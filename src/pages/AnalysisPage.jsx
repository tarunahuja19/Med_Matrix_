import { BarChart3, AlertCircle } from 'lucide-react'

function AnalysisPage() {
  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Analysis</h1>
          <p className="text-text-secondary">
            Run ML-powered analysis on imported datasets
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Dataset Loaded
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Import a K-space or MRI dataset first to run disease detection and prediction analysis.
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
            <strong className="text-text-primary">Analysis capabilities:</strong> Microbleed detection, 
            brain tumor identification, position clustering, size analysis, and future disease prediction.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
