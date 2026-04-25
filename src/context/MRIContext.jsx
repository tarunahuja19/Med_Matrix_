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
  
  // Determine data type
  let TypedArray = Float32Array
  let bytesPerElement = 4
  
  if (dtype.includes('f8') || dtype.includes('float64')) {
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
  const data = new TypedArray(buffer, dataOffset, totalElements)
  
  return { data, shape }
}

function renderSliceToCanvas(data, shape, sliceIndex, colormap = 'bone') {
  let slice2D
  let width, height
  
  if (shape.length === 2) {
    // 2D array
    height = shape[0]
    width = shape[1]
    slice2D = data
  } else if (shape.length === 3) {
    // 3D array - extract slice
    const [depth, h, w] = shape
    height = h
    width = w
    const sliceSize = height * width
    const startIdx = sliceIndex * sliceSize
    slice2D = data.slice(startIdx, startIdx + sliceSize)
  } else if (shape.length === 4 && shape[3] === 1) {
    // 4D with trailing 1 dimension
    const [depth, h, w] = shape
    height = h
    width = w
    const sliceSize = height * width
    const startIdx = sliceIndex * sliceSize
    slice2D = data.slice(startIdx, startIdx + sliceSize)
  } else {
    throw new Error(`Unsupported array shape: ${shape.join('x')}`)
  }
  
  // Normalize data
  let min = Infinity, max = -Infinity
  for (let i = 0; i < slice2D.length; i++) {
    if (slice2D[i] < min) min = slice2D[i]
    if (slice2D[i] > max) max = slice2D[i]
  }
  const range = max - min || 1
  
  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  
  // Bone colormap approximation
  for (let i = 0; i < slice2D.length; i++) {
    const normalized = (slice2D[i] - min) / range
    
    // Bone colormap: dark blue -> white with slight warm tint
    let r, g, b
    if (normalized < 0.75) {
      const t = normalized / 0.75
      r = Math.round(t * 204)
      g = Math.round(t * 204)
      b = Math.round(t * 227)
    } else {
      const t = (normalized - 0.75) / 0.25
      r = Math.round(204 + t * 51)
      g = Math.round(204 + t * 51)
      b = Math.round(227 + t * 28)
    }
    
    const idx = i * 4
    imageData.data[idx] = r
    imageData.data[idx + 1] = g
    imageData.data[idx + 2] = b
    imageData.data[idx + 3] = 255
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  // Calculate statistics
  let sum = 0, sumSq = 0, nonZero = 0
  for (let i = 0; i < slice2D.length; i++) {
    sum += slice2D[i]
    sumSq += slice2D[i] * slice2D[i]
    if (slice2D[i] !== 0) nonZero++
  }
  const mean = sum / slice2D.length
  const variance = (sumSq / slice2D.length) - (mean * mean)
  const std = Math.sqrt(Math.max(0, variance))
  
  // Sort for median
  const sorted = [...slice2D].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  
  return {
    imageDataUrl: canvas.toDataURL('image/png'),
    stats: {
      slice_index: sliceIndex,
      min,
      max,
      mean,
      std,
      median,
      nonzero_ratio: nonZero / slice2D.length
    }
  }
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
      const { data, shape } = getNpyData(arrayBuffer, header)
      
      // Store raw data for slice navigation
      rawDataRef.current = { data, shape, arrayBuffer }
      
      // Determine number of slices
      let nSlices = 1
      if (shape.length === 3) {
        nSlices = shape[0]
      } else if (shape.length === 4 && shape[3] === 1) {
        nSlices = shape[0]
      }
      
      // Render middle slice
      const middleSlice = Math.floor(nSlices / 2)
      const { imageDataUrl, stats } = renderSliceToCanvas(data, shape, middleSlice)
      
      // Generate stats for all slices
      const allStats = []
      for (let i = 0; i < nSlices; i++) {
        const { stats: sliceStats } = renderSliceToCanvas(data, shape, i)
        allStats.push(sliceStats)
      }
      
      setMRIData({
        image: imageDataUrl,
        metadata: {
          shape: shape,
          n_slices: nSlices,
          current_slice: middleSlice,
          colormap: 'bone',
        },
        statistics: allStats,
        fileName: file.name,
      })
      
      return { success: true }
    } catch (err) {
      console.error('[v0] NPY processing error:', err)
      const errorMessage = err.message || 'Failed to process NPY file'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const setSlice = useCallback(async (sliceIndex) => {
    if (!mriData || !rawDataRef.current) return
    
    setIsProcessing(true)
    try {
      const { data, shape } = rawDataRef.current
      const { imageDataUrl } = renderSliceToCanvas(data, shape, sliceIndex)
      
      setMRIData(prev => ({
        ...prev,
        image: imageDataUrl,
        metadata: {
          ...prev.metadata,
          current_slice: sliceIndex,
        },
      }))
    } catch (err) {
      console.error('[v0] Error changing slice:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [mriData])

  const clearData = useCallback(() => {
    setMRIData(null)
    setError(null)
  }, [])

  return (
    <MRIContext.Provider
      value={{
        mriData,
        isProcessing,
        error,
        processNpyFile,
        setSlice,
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
    throw new Error('useMRI must be used within an MRIProvider')
  }
  return context
}
