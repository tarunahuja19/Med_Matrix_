import { useState } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  ChevronDown,
  Brain,
  Heart,
  Zap,
  Database
} from 'lucide-react'

function RiskForecastPage() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [timeRange, setTimeRange] = useState('6months')

  // Empty data - will be populated from database and ML model
  const patients = []
  const riskData = null
  const riskFactors = []
  const futureRisks = []

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-500" />
    if (trend === 'decreasing') return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            Risk Forecast
          </h1>
          <p className="text-text-secondary mt-1">Predicted disease progression and risk analysis</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Patient Selector */}
          <div className="relative">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="appearance-none bg-surface border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={patients.length === 0}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient} value={patient}>{patient}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-surface border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
              <option value="24months">24 Months</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!riskData ? (
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="text-center py-20 px-6">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-text-primary mb-3">No Risk Data Available</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Risk forecasts will be generated once you connect to the database and ML model. 
              Upload K-space or MRI data to begin analysis.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span>ML Model: Not Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <span>Database: Not Connected</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Risk Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary text-sm font-medium">Current Risk Level</span>
                <AlertTriangle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">--</span>
                <span className="text-lg text-text-secondary">(--/100)</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">No data available</p>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary text-sm font-medium">Projected Risk</span>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">--</span>
                <span className="text-lg text-text-secondary">/100</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">No data available</p>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary text-sm font-medium">Intervention Urgency</span>
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">--</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">No data available</p>
            </div>
          </div>

          {/* Risk Progression Chart Placeholder */}
          <div className="bg-surface rounded-xl border border-border shadow-sm mb-8">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Risk Progression Over Time</h2>
              <p className="text-sm text-text-secondary mt-1">Projected risk score if current condition is not treated</p>
            </div>
            <div className="p-5">
              <div className="h-64 flex items-center justify-center">
                <p className="text-text-secondary">Chart will appear when data is available</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors Placeholder */}
            <div className="bg-surface rounded-xl border border-border shadow-sm">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Contributing Risk Factors
                </h2>
              </div>
              <div className="p-5">
                <div className="text-center py-8">
                  <p className="text-text-secondary">No risk factors to display</p>
                </div>
              </div>
            </div>

            {/* Future Predictions Placeholder */}
            <div className="bg-surface rounded-xl border border-border shadow-sm">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Predicted Future Conditions
                </h2>
              </div>
              <div className="p-5">
                <div className="text-center py-8">
                  <p className="text-text-secondary">No predictions available</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RiskForecastPage
