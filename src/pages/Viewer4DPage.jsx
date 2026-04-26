import { Layers, AlertCircle } from 'lucide-react'

function Viewer4DPage() {
  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">4D Viewer</h1>
          <p className="text-text-secondary">
            Time-series visualization for disease progression analysis
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Time-Series Data Available
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Import multiple temporal scans or run prediction analysis to visualize disease progression over time.
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
            <strong className="text-text-primary">4D Viewer features:</strong> Temporal playback controls, 
            progression timeline, predicted future states, and comparative analysis between time points.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Viewer4DPage
