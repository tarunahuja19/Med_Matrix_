import { Brain, Upload, BarChart3, Box, ArrowRight, Zap, Shield, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Zap,
    title: 'Mamba-2 Architecture',
    description: 'Advanced ML model for accurate K-space analysis and disease detection'
  },
  {
    icon: Shield,
    title: 'Early Detection',
    description: 'Detect microbleeds and predict future disease progression'
  },
  {
    icon: Clock,
    title: 'Real-time Analysis',
    description: 'Fast processing with interactive 3D visualization'
  }
]

const quickActions = [
  { 
    path: '/import', 
    icon: Upload, 
    title: 'Import Dataset', 
    description: 'Load K-space or MRI files',
    color: 'bg-primary'
  },
  { 
    path: '/analysis', 
    icon: BarChart3, 
    title: 'Run Analysis', 
    description: 'Detect diseases & anomalies',
    color: 'bg-accent'
  },
  { 
    path: '/viewer-3d', 
    icon: Box, 
    title: '3D Viewer', 
    description: 'Interactive brain visualization',
    color: 'bg-success'
  },
]

function HomePage() {
  return (
    <div className="page-transition p-8 h-full overflow-auto">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Welcome to NeuroScan AI
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Advanced MRI analysis platform powered by Mamba-2 architecture for detecting 
            microbleeds, brain tumors, and predicting future disease progression.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group bg-surface rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${action.color} rounded-lg mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {action.description}
              </p>
              <div className="flex items-center text-primary text-sm font-medium">
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="bg-surface rounded-xl border border-border p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-sm font-medium text-text-primary">Model Status: Ready</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-text-secondary">Mamba-2 v1.0.0</span>
            </div>
            <div className="text-sm text-text-muted">
              No dataset loaded
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
