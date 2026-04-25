import React, { useState } from 'react'
import { ChevronDown, AlertCircle, Zap } from 'lucide-react'

const DiseasePanel = ({ diseases = [], predictedDiseases = [], onSelectDisease = () => {} }) => {
  const [expandedId, setExpandedId] = useState(null)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#ff4444'
      case 'medium':
        return '#ff8800'
      case 'low':
        return '#ffaa00'
      default:
        return '#888888'
    }
  }

  const getRiskColor = (riskScore) => {
    if (riskScore >= 0.7) return '#ff4444'
    if (riskScore >= 0.5) return '#ff8800'
    return '#ffaa00'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0f1429',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #2a3f5f',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #2a3f5f',
          backgroundColor: '#0a0e27',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={20} style={{ color: '#ff4444' }} />
          Detected Diseases
        </h2>
      </div>

      {/* Detected Diseases List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 0',
        }}
      >
        {diseases.length === 0 ? (
          <div
            style={{
              padding: '16px',
              color: '#888888',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            No diseases detected
          </div>
        ) : (
          diseases.map((disease) => (
            <div
              key={disease.id}
              style={{
                borderBottom: '1px solid #1a2332',
                backgroundColor: expandedId === disease.id ? '#1a2332' : 'transparent',
              }}
            >
              <button
                onClick={() => {
                  setExpandedId(expandedId === disease.id ? null : disease.id)
                  onSelectDisease(disease)
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#e0e0e0',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getSeverityColor(disease.severity),
                    }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {disease.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>
                      {disease.location.region}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255, 68, 68, 0.2)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ff8888',
                    }}
                  >
                    {Math.round(disease.confidence * 100)}%
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      transform:
                        expandedId === disease.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === disease.id && (
                <div
                  style={{
                    padding: '12px 16px 16px 40px',
                    backgroundColor: 'rgba(255, 68, 68, 0.05)',
                    borderTop: '1px solid #1a2332',
                  }}
                >
                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#c0c0c0' }}>
                    <div>
                      <span style={{ color: '#888888' }}>Location:</span> X: {disease.location.x.toFixed(1)}, Y:{' '}
                      {disease.location.y.toFixed(1)}, Z: {disease.location.z.toFixed(1)}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ color: '#888888' }}>Severity:</span>{' '}
                      <span
                        style={{
                          color: getSeverityColor(disease.severity),
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}
                      >
                        {disease.severity}
                      </span>
                    </div>
                    {disease.size && (
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ color: '#888888' }}>Size:</span> {disease.size}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', color: '#aaaaaa' }}>
                      {disease.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Predicted Diseases Section */}
      <div
        style={{
          borderTop: '2px solid #2a3f5f',
          padding: '16px',
          backgroundColor: '#0a0e27',
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Zap size={16} style={{ color: '#ffff00' }} />
          Predicted Future Risks
        </h3>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {predictedDiseases.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#888888' }}>No predictions available</div>
          ) : (
            predictedDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => onSelectDisease(disease)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#1a2332',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  border: '1px solid #2a3f5f',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a3f5f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a2332'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#e0e0e0' }}>
                      {disease.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>
                      Timeframe: {disease.timeframe}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '4px 8px',
                      backgroundColor: `rgba(255, ${Math.floor(255 - disease.riskScore * 255)}, 0, 0.2)`,
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: getRiskColor(disease.riskScore),
                    }}
                  >
                    {Math.round(disease.riskScore * 100)}% risk
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DiseasePanel
