import { useState } from 'react'
import { Square, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Loader2, Info, BarChart3 } from 'lucide-react'
import { useMRI } from '../context/MRIContext'

function Viewer2DPage() {
  const { mriData, isProcessing } = useMRI()
  const [zoom, setZoom] = useState(1)
  const [activeView, setActiveView] = useState('comparison') // 'comparison', 'kspace', 'reconstructed'

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleReset = () => {
    setZoom(1)
  }

  // No data state
  if (!mriData) {
    return (
      <div className="page-transition p-8 h-full overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">2D Viewer</h1>
            <p className="text-text-secondary">
              View reconstructed MRI from K-space data
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Square className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Data to Display
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Import a K-space .npy file to reconstruct and view the MRI brain image.
            </p>
            <a
              href="#/import"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Import Dataset
            </a>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary">
              <strong className="text-text-primary">K-Space Reconstruction:</strong> Upload a 64x64 k-space .npy file 
              to reconstruct the brain MRI image via inverse Fast Fourier Transform (iFFT).
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Data loaded state
  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">2D Viewer</h1>
            <p className="text-text-secondary">
              {mriData.fileName} - K-Space Reconstruction
            </p>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-surface border border-border rounded-lg p-1 mr-4">
              <button
                onClick={() => setActiveView('comparison')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeView === 'comparison' 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setActiveView('kspace')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeView === 'kspace' 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                K-Space
              </button>
              <button
                onClick={() => setActiveView('reconstructed')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeView === 'reconstructed' 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                Reconstructed
              </button>
            </div>
            
            <button
              onClick={handleZoomOut}
              className="p-2 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-text-secondary" />
            </button>
            <span className="text-sm text-text-muted min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-text-secondary" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors ml-2"
              title="Reset View"
            >
              <RotateCcw className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Image Viewer */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="relative bg-[#0d0d0d] min-h-[500px] p-6">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="flex items-center gap-3 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </div>
              </div>
            )}
            
            {activeView === 'comparison' ? (
              /* Side-by-side comparison like Python's show_comparison */
              <div className="flex items-center justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="bg-[#0d0d0d] p-4 rounded-lg">
                    <img
                      src={mriData.kspaceImage}
                      alt="K-Space (log magnitude)"
                      className="max-h-[400px] object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})`, imageRendering: 'pixelated' }}
                    />
                  </div>
                  <p className="mt-3 text-white text-sm font-medium">K-Space (log magnitude)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-[#0d0d0d] p-4 rounded-lg">
                    <img
                      src={mriData.image}
                      alt="Reconstructed Brain Image"
                      className="max-h-[400px] object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})`, imageRendering: 'pixelated' }}
                    />
                  </div>
                  <p className="mt-3 text-white text-sm font-medium">Reconstructed Brain Image</p>
                </div>
              </div>
            ) : activeView === 'kspace' ? (
              /* K-Space only view */
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <img
                    src={mriData.kspaceImage}
                    alt="K-Space (log magnitude)"
                    className="max-h-[500px] object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})`, imageRendering: 'pixelated' }}
                  />
                  <p className="mt-4 text-white text-sm font-medium">K-Space (log magnitude)</p>
                </div>
              </div>
            ) : (
              /* Reconstructed only view */
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <img
                    src={mriData.image}
                    alt="Reconstructed Brain Image"
                    className="max-h-[500px] object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})`, imageRendering: 'pixelated' }}
                  />
                  <p className="mt-4 text-white text-sm font-medium">Reconstructed Brain Image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Info */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Image Information</h3>
            </div>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-text-muted">File Name</dt>
                <dd className="text-text-primary font-medium">{mriData.fileName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">K-Space Shape</dt>
                <dd className="text-text-primary font-medium">
                  {mriData.metadata?.shape?.join(' x ') || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Image Size</dt>
                <dd className="text-text-primary font-medium">
                  {mriData.metadata?.height} x {mriData.metadata?.width}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Data Type</dt>
                <dd className="text-text-primary font-medium">
                  {mriData.metadata?.isComplex ? 'Complex' : 'Real'} ({mriData.metadata?.dtype})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Reconstruction</dt>
                <dd className="text-text-primary font-medium">Inverse FFT (iFFT)</dd>
              </div>
            </dl>
          </div>

          {/* Image Statistics */}
          {mriData.statistics && (
            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-primary">Reconstructed Image Statistics</h3>
              </div>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Min Value</dt>
                  <dd className="text-text-primary font-medium">{mriData.statistics.min?.toFixed(4)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Max Value</dt>
                  <dd className="text-text-primary font-medium">{mriData.statistics.max?.toFixed(4)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Mean</dt>
                  <dd className="text-text-primary font-medium">{mriData.statistics.mean?.toFixed(4)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Std Dev</dt>
                  <dd className="text-text-primary font-medium">{mriData.statistics.std?.toFixed(4)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Median</dt>
                  <dd className="text-text-primary font-medium">{mriData.statistics.median?.toFixed(4)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Non-zero Ratio</dt>
                  <dd className="text-text-primary font-medium">{(mriData.statistics.nonzero_ratio * 100)?.toFixed(1)}%</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <strong className="text-text-primary">Reconstruction Method:</strong> The brain MRI image is reconstructed 
            from k-space data using inverse Fast Fourier Transform (iFFT). The k-space visualization shows the 
            log-magnitude of the frequency domain data.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Viewer2DPage
