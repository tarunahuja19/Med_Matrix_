import { useState } from 'react'
import {
  History,
  Search,
  Filter,
  Calendar,
  FileText,
  Brain,
  Eye,
  Download,
  Trash2,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Upload
} from 'lucide-react'
import { Link } from 'react-router-dom'

function HistoricalCasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Empty cases - will be populated from database
  const cases = []

  const getStatusBadge = (status) => {
    switch (status) {
      case 'high-risk':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        )
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case 'normal':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
            <CheckCircle className="w-3 h-3" />
            Normal
          </span>
        )
      case 'moderate':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3 h-3" />
            Moderate
          </span>
        )
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        )
      default:
        return null
    }
  }

  const filteredCases = cases.filter(c => {
    if (filterType !== 'all' && c.type.toLowerCase() !== filterType) return false
    if (searchQuery && !c.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.patientId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <History className="w-7 h-7 text-primary" />
            Historical Cases
          </h1>
          <p className="text-text-secondary mt-1">Previously uploaded K-space data and MRI scans</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            {filteredCases.length} of {cases.length} cases
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by case ID, patient ID, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none pl-9 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="k-space">K-space</option>
              <option value="mri">MRI</option>
              <option value="dicom">DICOM</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-9 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="date">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="findings">Findings Count</option>
              <option value="size">File Size</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cases Grid or Empty State */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Thumbnail Placeholder */}
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Brain className="w-12 h-12 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{caseItem.id}</h3>
                    <p className="text-sm text-text-secondary">{caseItem.patientId}</p>
                  </div>
                  {getStatusBadge(caseItem.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Diagnosis:</span>
                    <span className="text-text-primary font-medium">{caseItem.diagnosis}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Type:</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-text-primary text-xs font-medium">
                      {caseItem.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Date:</span>
                    <span className="text-text-primary">{caseItem.date}</span>
                  </div>
                  {caseItem.findings !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Findings:</span>
                      <span className="text-text-primary font-medium">{caseItem.findings}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Size:</span>
                    <span className="text-text-primary">{caseItem.size}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="text-center py-20 px-6">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-text-primary mb-3">No Cases Found</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              Your historical cases will appear here once you upload K-space or MRI data 
              and connect to the database.
            </p>
            <Link
              to="/import"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Your First Scan
            </Link>
          </div>
        </div>
      )}

      {/* Pagination - only show if there are cases */}
      {cases.length > 0 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <p className="text-sm text-text-secondary">
            Showing 1-{filteredCases.length} of {cases.length} cases
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoricalCasesPage
