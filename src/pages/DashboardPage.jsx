import {
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Database
} from 'lucide-react'

function DashboardPage() {
  // Empty stats - will be populated from database
  const stats = [
    { label: 'Total Scans', value: '--', icon: Brain, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Analysis', value: '--', icon: Activity, color: 'bg-teal-100 text-teal-600' },
    { label: 'High Risk Cases', value: '--', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
    { label: 'Completed', value: '--', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  ]

  // Empty activity - will be populated from database
  const recentActivity = []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Overview of your medical imaging analysis system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-surface rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="p-5">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {/* Activity items will be rendered here */}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No Activity Yet</h3>
                <p className="text-text-secondary text-sm">
                  Activity will appear here once you connect to the database and start analyzing scans.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              System Overview
            </h2>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Model Accuracy</span>
                <span className="text-text-primary font-medium">--%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Processing Queue</span>
                <span className="text-text-primary font-medium">-- / --</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Storage Used</span>
                <span className="text-text-primary font-medium">-- GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">Reports Generated</span>
                </div>
                <span className="text-text-primary font-medium">--</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">Patients Analyzed</span>
                </div>
                <span className="text-text-primary font-medium">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
