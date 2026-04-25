import { useState } from 'react'
import { Square, AlertCircle, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react'
import { useMRI } from '../context/MRIContext'

function Viewer2DPage() {
  const { mriData, isProcessing, setSlice } = useMRI()
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  const handlePrevSlice = () => {
    if (mriData?.metadata?.current_slice > 0) {
      setSlice(mriData.metadata.current_slice - 1)
    }
  }

  const handleNextSlice = () => {
    if (mriData?.metadata?.current_slice < mriData?.metadata?.n_slices - 1) {
      setSlice(mriData.metadata.current_slice + 1)
    }
  }

  // No data state
  if (!mriData) {
    return (
      <div className="page-transition p-8 h-full overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">2D Viewer</h1>
            <p className="text-text-secondary">
              View MRI slices with annotation overlays
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
              Import and analyze a dataset to view 2D MRI slices with detected regions highlighted.
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
              <strong className="text-text-primary">2D Viewer features:</strong> Slice navigation, 
              zoom, pan, windowing controls, and overlay of detected anomalies.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Data loaded state
  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">2D Viewer</h1>
            <p className="text-text-secondary">
              {mriData.fileName} - Slice {(mriData.metadata?.current_slice ?? 0) + 1} of {mriData.metadata?.n_slices ?? 1}
            </p>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-2">
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
          <div className="relative flex items-center justify-center bg-black min-h-[500px] p-4">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="flex items-center gap-3 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading slice...</span>
                </div>
              </div>
            )}
            
            <img
              src={mriData.image}
              alt="MRI Slice"
              className="max-w-full max-h-[500px] object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Slice Navigation */}
          {mriData.metadata?.n_slices > 1 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t border-border bg-surface-hover">
              <button
                onClick={handlePrevSlice}
                disabled={mriData.metadata?.current_slice === 0 || isProcessing}
                className="p-2 bg-surface border border-border rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={mriData.metadata?.n_slices - 1}
                  value={mriData.metadata?.current_slice ?? 0}
                  onChange={(e) => setSlice(parseInt(e.target.value))}
                  disabled={isProcessing}
                  className="w-48 accent-primary"
                />
                <span className="text-sm text-text-muted min-w-[5rem]">
                  Slice {(mriData.metadata?.current_slice ?? 0) + 1} / {mriData.metadata?.n_slices}
                </span>
              </div>
              
              <button
                onClick={handleNextSlice}
                disabled={mriData.metadata?.current_slice === mriData.metadata?.n_slices - 1 || isProcessing}
                className="p-2 bg-surface border border-border rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          )}
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
                <dt className="text-text-muted">Dimensions</dt>
                <dd className="text-text-primary font-medium">
                  {mriData.metadata?.shape?.join(' x ') || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Total Slices</dt>
                <dd className="text-text-primary font-medium">{mriData.metadata?.n_slices || 1}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Colormap</dt>
                <dd className="text-text-primary font-medium capitalize">{mriData.metadata?.colormap || 'bone'}</dd>
              </div>
            </dl>
          </div>

          {/* Slice Statistics */}
          {mriData.statistics && mriData.statistics.length > 0 && (
            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-primary">Slice Statistics</h3>
              </div>
              {(() => {
                const currentStats = mriData.statistics.find(
                  s => s.slice_index === (mriData.metadata?.current_slice ?? 0)
                ) || mriData.statistics[0]
                
                return (
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Min Value</dt>
                      <dd className="text-text-primary font-medium">{currentStats.min?.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Max Value</dt>
                      <dd className="text-text-primary font-medium">{currentStats.max?.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Mean</dt>
                      <dd className="text-text-primary font-medium">{currentStats.mean?.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Std Dev</dt>
                      <dd className="text-text-primary font-medium">{currentStats.std?.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Non-zero Ratio</dt>
                      <dd className="text-text-primary font-medium">{(currentStats.nonzero_ratio * 100)?.toFixed(1)}%</dd>
                    </div>
                  </dl>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Viewer2DPage
