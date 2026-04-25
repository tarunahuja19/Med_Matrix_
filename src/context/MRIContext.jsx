import { createContext, useContext, useState, useCallback, useRef } from 'react'

const MRIContext = createContext(null)

// Simple NPY parser for browser
function parseNpyHeader(buffer) {
  const view = new DataView(buffer)
  
  // Check magic number
  const magic = new Uint8Array(buffer, 0, 6)
  if (magic[0] !== 0x93 || String.fromCharCode(magic[1], magic[2], magic[3]) !== 'NUM') {
    throw new Error('Invalid NPY file format')
  }
  
  // Get header length
  const headerLen = view.getUint16(8, true)
  const headerStr = new TextDecoder().decode(new Uint8Array(buffer, 10, headerLen))
  
  // Parse shape from header
  const shapeMatch = headerStr.match(/'shape':\s*\(([^)]+)\)/)
  const dtypeMatch = headerStr.match(/'descr':\s*'([^']+)'/)
  const orderMatch = headerStr.match(/'fortran_order':\s*(True|False)/)
  
  if (!shapeMatch) throw new Error('Could not parse shape from NPY header')
  
  const shape = shapeMatch[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
  const dtype = dtypeMatch ? dtypeMatch[1] : '<f4'
  const fortranOrder = orderMatch ? orderMatch[1] === 'True' : false
  
  return {
    shape,
    dtype,
    fortranOrder,
    dataOffset: 10 + headerLen
  }
}

function getNpyData(buffer, header) {
  const { shape, dtype, dataOffset } = header
  
  // Check if complex type
  const isComplex = dtype.includes('c')
  
  // Determine data type
  let TypedArray = Float32Array
  let bytesPerElement = 4
  
  if (dtype.includes('c16') || dtype.includes('complex128')) {
    TypedArray = Float64Array
    bytesPerElement = 8
  } else if (dtype.includes('c8') || dtype.includes('complex64')) {
    TypedArray = Float32Array
    bytesPerElement = 4
  } else if (dtype.includes('f8') || dtype.includes('float64')) {
    TypedArray = Float64Array
    bytesPerElement = 8
  } else if (dtype.includes('f4') || dtype.includes('float32')) {
    TypedArray = Float32Array
    bytesPerElement = 4
  } else if (dtype.includes('i4') || dtype.includes('int32')) {
    TypedArray = Int32Array
    bytesPerElement = 4
  } else if (dtype.includes('i2') || dtype.includes('int16')) {
    TypedArray = Int16Array
    bytesPerElement = 2
  } else if (dtype.includes('u1') || dtype.includes('uint8')) {
    TypedArray = Uint8Array
    bytesPerElement = 1
  }
  
  const totalElements = shape.reduce((a, b) => a * b, 1)
  
  if (isComplex) {
    // Complex data: interleaved real/imag pairs
    const data = new TypedArray(buffer, dataOffset, totalElements * 2)
    return { data, shape, isComplex: true }
  }
  
  const data = new TypedArray(buffer, dataOffset, totalElements)
  return { data, shape, isComplex: false }
}

// ──────────────────────────────────────────────
// FFT Implementation for K-Space Reconstruction
// ──────────────────────────────────────────────

// 1D FFT using Cooley-Tukey algorithm
function fft1d(real, imag, inverse = false) {
  const n = real.length
  if (n <= 1) return { real, imag }
  
  // Bit-reversal permutation
  const bits = Math.log2(n)
  for (let i = 0; i < n; i++) {
    const j = parseInt(i.toString(2).padStart(bits, '0').split('').reverse().join(''), 2)
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]]
    }
  }
  
  // Cooley-Tukey iterative FFT
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2
    const angleStep = (inverse ? 2 : -2) * Math.PI / size
    
    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const angle = angleStep * j
        const tpRe = Math.cos(angle) * real[i + j + halfSize] - Math.sin(angle) * imag[i + j + halfSize]
        const tpIm = Math.sin(angle) * real[i + j + halfSize] + Math.cos(angle) * imag[i + j + halfSize]
        
        real[i + j + halfSize] = real[i + j] - tpRe
        imag[i + j + halfSize] = imag[i + j] - tpIm
        real[i + j] += tpRe
        imag[i + j] += tpIm
      }
    }
  }
  
  // Normalize for inverse FFT
  if (inverse) {
    for (let i = 0; i < n; i++) {
      real[i] /= n
      imag[i] /= n
    }
  }
  
  return { real, imag }
}

// 2D inverse FFT (ifft2)
function ifft2(kspaceReal, kspaceImag, height, width) {
  const resultReal = new Float64Array(height * width)
  const resultImag = new Float64Array(height * width)
  
  // Copy input
  for (let i = 0; i < height * width; i++) {
    resultReal[i] = kspaceReal[i]
    resultImag[i] = kspaceImag[i]
  }
  
  // IFFT along rows
  for (let row = 0; row < height; row++) {
    const rowReal = new Float64Array(width)
    const rowImag = new Float64Array(width)
    for (let col = 0; col < width; col++) {
      rowReal[col] = resultReal[row * width + col]
      rowImag[col] = resultImag[row * width + col]
    }
    const { real, imag } = fft1d(rowReal, rowImag, true)
    for (let col = 0; col < width; col++) {
      resultReal[row * width + col] = real[col]
      resultImag[row * width + col] = imag[col]
    }
  }
  
  // IFFT along columns
  for (let col = 0; col < width; col++) {
    const colReal = new Float64Array(height)
    const colImag = new Float64Array(height)
    for (let row = 0; row < height; row++) {
      colReal[row] = resultReal[row * width + col]
      colImag[row] = resultImag[row * width + col]
    }
    const { real, imag } = fft1d(colReal, colImag, true)
    for (let row = 0; row < height; row++) {
      resultReal[row * width + col] = real[row]
      resultImag[row * width + col] = imag[row]
    }
  }
  
  return { real: resultReal, imag: resultImag }
}

// ifftshift - shift zero-frequency to center (inverse of fftshift)
function ifftshift2d(data, height, width) {
  const result = new Float64Array(height * width)
  const halfH = Math.floor(height / 2)
  const halfW = Math.floor(width / 2)
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const newRow = (row + halfH) % height
      const newCol = (col + halfW) % width
      result[newRow * width + newCol] = data[row * width + col]
    }
  }
  
  return result
}

// fftshift - shift zero-frequency to center
function fftshift2d(data, height, width) {
  return ifftshift2d(data, height, width) // Same operation for even dimensions
}

// Reconstruct MRI image from k-space using inverse FFT
// Mirrors the Python: ifftshift -> ifft2 -> fftshift -> magnitude
function reconstructFromKspace(kspaceReal, kspaceImag, height, width) {
  // Step 1: ifftshift - shift zero-frequency component to center
  const shiftedReal = ifftshift2d(kspaceReal, height, width)
  const shiftedImag = ifftshift2d(kspaceImag, height, width)
  
  // Step 2: Apply inverse 2D FFT
  const { real: ifftReal, imag: ifftImag } = ifft2(shiftedReal, shiftedImag, height, width)
  
  // Step 3: fftshift - shift back
  const finalReal = fftshift2d(ifftReal, height, width)
  const finalImag = fftshift2d(ifftImag, height, width)
  
  // Step 4: Compute magnitude
  const magnitude = new Float64Array(height * width)
  for (let i = 0; i < height * width; i++) {
    magnitude[i] = Math.sqrt(finalReal[i] * finalReal[i] + finalImag[i] * finalImag[i])
  }
  
  // Step 5: Normalize to [0, 1]
  let min = Infinity, max = -Infinity
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] < min) min = magnitude[i]
    if (magnitude[i] > max) max = magnitude[i]
  }
  const range = max - min || 1
  for (let i = 0; i < magnitude.length; i++) {
    magnitude[i] = (magnitude[i] - min) / range
  }
  
  return { magnitude, min, max }
}

// Render reconstructed image to canvas
function renderReconstructedImage(magnitude, height, width) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  
  // Grayscale rendering (like Python's cmap="gray")
  for (let i = 0; i < magnitude.length; i++) {
    const val = Math.round(magnitude[i] * 255)
    const idx = i * 4
    imageData.data[idx] = val     // R
    imageData.data[idx + 1] = val // G
    imageData.data[idx + 2] = val // B
    imageData.data[idx + 3] = 255 // A
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  return canvas.toDataURL('image/png')
}

// Render k-space visualization (log magnitude)
function renderKspaceVisualization(real, imag, height, width) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  
  // Calculate log magnitude
  const logMag = new Float64Array(height * width)
  let min = Infinity, max = -Infinity
  for (let i = 0; i < height * width; i++) {
    const mag = Math.sqrt(real[i] * real[i] + imag[i] * imag[i])
    logMag[i] = Math.log1p(mag)
    if (logMag[i] < min) min = logMag[i]
    if (logMag[i] > max) max = logMag[i]
  }
  
  const range = max - min + 1e-8
  
  // Inferno-like colormap
  for (let i = 0; i < logMag.length; i++) {
    const t = (logMag[i] - min) / range
    
    // Simplified inferno colormap
    let r, g, b
    if (t < 0.25) {
      const s = t / 0.25
      r = Math.round(s * 120)
      g = Math.round(s * 28)
      b = Math.round(40 + s * 60)
    } else if (t < 0.5) {
      const s = (t - 0.25) / 0.25
      r = Math.round(120 + s * 80)
      g = Math.round(28 + s * 30)
      b = Math.round(100 - s * 30)
    } else if (t < 0.75) {
      const s = (t - 0.5) / 0.25
      r = Math.round(200 + s * 40)
      g = Math.round(58 + s * 80)
      b = Math.round(70 - s * 50)
    } else {
      const s = (t - 0.75) / 0.25
      r = Math.round(240 + s * 15)
      g = Math.round(138 + s * 100)
      b = Math.round(20 + s * 50)
    }
    
    const idx = i * 4
    imageData.data[idx] = r
    imageData.data[idx + 1] = g
    imageData.data[idx + 2] = b
    imageData.data[idx + 3] = 255
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  return canvas.toDataURL('image/png')
}

export function MRIProvider({ children }) {
  const [mriData, setMRIData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const rawDataRef = useRef(null)

  const processNpyFile = useCallback(async (file) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Parse NPY header
      const header = parseNpyHeader(arrayBuffer)
      const { data, shape, isComplex } = getNpyData(arrayBuffer, header)
      
      let height, width
      let kspaceReal, kspaceImag
      
      // Handle different shapes as per Python code
      if (shape.length === 2) {
        // 2D array (H, W)
        height = shape[0]
        width = shape[1]
        
        if (isComplex) {
          // Complex array - interleaved real/imag
          kspaceReal = new Float64Array(height * width)
          kspaceImag = new Float64Array(height * width)
          for (let i = 0; i < height * width; i++) {
            kspaceReal[i] = data[i * 2]
            kspaceImag[i] = data[i * 2 + 1]
          }
        } else {
          // Real array - treat as magnitude, promote to complex
          kspaceReal = new Float64Array(data)
          kspaceImag = new Float64Array(height * width).fill(0)
        }
      } else if (shape.length === 3 && shape[2] === 2) {
        // Shape (H, W, 2) - interpreted as (real, imag) channels
        height = shape[0]
        width = shape[1]
        kspaceReal = new Float64Array(height * width)
        kspaceImag = new Float64Array(height * width)
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const idx = row * width + col
            const dataIdx = (row * width + col) * 2
            kspaceReal[idx] = data[dataIdx]
            kspaceImag[idx] = data[dataIdx + 1]
          }
        }
      } else {
        throw new Error(`Unexpected k-space shape: ${shape.join('x')}. Expected (H, W) or (H, W, 2).`)
      }
      
      // Store raw data
      rawDataRef.current = { kspaceReal, kspaceImag, height, width, shape }
      
      // Reconstruct image from k-space using inverse FFT
      const { magnitude, min, max } = reconstructFromKspace(kspaceReal, kspaceImag, height, width)
      
      // Render reconstructed image
      const reconstructedImage = renderReconstructedImage(magnitude, height, width)
      
      // Render k-space visualization
      const kspaceImage = renderKspaceVisualization(kspaceReal, kspaceImag, height, width)
      
      // Calculate statistics
      let sum = 0, sumSq = 0, nonZero = 0
      for (let i = 0; i < magnitude.length; i++) {
        sum += magnitude[i]
        sumSq += magnitude[i] * magnitude[i]
        if (magnitude[i] > 0.01) nonZero++
      }
      const mean = sum / magnitude.length
      const variance = (sumSq / magnitude.length) - (mean * mean)
      const std = Math.sqrt(Math.max(0, variance))
      
      const sorted = [...magnitude].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      
      setMRIData({
        image: reconstructedImage,
        kspaceImage: kspaceImage,
        metadata: {
          shape: shape,
          height,
          width,
          dtype: header.dtype,
          isComplex,
          colormap: 'gray',
        },
        statistics: {
          min: min,
          max: max,
          mean: mean,
          std: std,
          median: median,
          nonzero_ratio: nonZero / magnitude.length
        },
        fileName: file.name,
      })
      
      return { success: true }
    } catch (err) {
      console.error('[v0] K-space processing error:', err)
      const errorMessage = err.message || 'Failed to process K-space file'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setMRIData(null)
    setError(null)
    rawDataRef.current = null
  }, [])

  return (
    <MRIContext.Provider
      value={{
        mriData,
        isProcessing,
        error,
        processNpyFile,
        clearData,
      }}
    >
      {children}
    </MRIContext.Provider>
  )
}

export function useMRI() {
  const context = useContext(MRIContext)
  if (!context) {
    console.error('[v0] useMRI called outside of MRIProvider')
    // Return a fallback object instead of throwing
    return {
      mriData: null,
      isProcessing: false,
      error: 'MRIProvider not found',
      processNpyFile: async () => ({ success: false, error: 'MRIProvider not found' }),
      clearData: () => {},
    }
  }
  return context
}
