import { Box, AlertCircle } from 'lucide-react'

function Viewer3DPage() {
  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">3D Viewer</h1>
          <p className="text-text-secondary">
            Interactive 3D brain visualization with marked suspicious regions
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Box className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No 3D Model Available
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Import and analyze a dataset to generate an interactive 3D brain model with highlighted regions of interest.
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
            <strong className="text-text-primary">3D Viewer features:</strong> Interactive rotation, 
            zoom, suspicious region markers, future-affected region predictions, and exportable visualizations.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Viewer3DPage
