import React, { useState } from 'react'
import { ChevronDown, AlertCircle, Zap } from 'lucide-react'

const DiseasePanel = ({ diseases = [], predictedDiseases = [], onSelectDisease = () => {} }) => {
  const [expandedId, setExpandedId] = useState(null)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
<<<<<<< HEAD
        return '#ef4444'
      case 'medium':
        return '#f97316'
      case 'low':
        return '#eab308'
      default:
        return '#599BAE'
=======
        return '#ff4444'
      case 'medium':
        return '#ff8800'
      case 'low':
        return '#ffaa00'
      default:
        return '#888888'
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
    }
  }

  const getRiskColor = (riskScore) => {
<<<<<<< HEAD
    if (riskScore >= 0.7) return '#ef4444'
    if (riskScore >= 0.5) return '#f97316'
    return '#eab308'
=======
    if (riskScore >= 0.7) return '#ff4444'
    if (riskScore >= 0.5) return '#ff8800'
    return '#ffaa00'
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
<<<<<<< HEAD
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #A1D7D6',
=======
        backgroundColor: '#0f1429',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #2a3f5f',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
<<<<<<< HEAD
          borderBottom: '1px solid #A1D7D6',
          backgroundColor: '#D1EEEA',
=======
          borderBottom: '1px solid #2a3f5f',
          backgroundColor: '#0a0e27',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
<<<<<<< HEAD
            color: '#2A5674',
=======
            color: '#e0e0e0',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
<<<<<<< HEAD
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
=======
          <AlertCircle size={20} style={{ color: '#ff4444' }} />
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
              color: '#599BAE',
=======
              color: '#888888',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                borderBottom: '1px solid #A1D7D6',
                backgroundColor: expandedId === disease.id ? '#D1EEEA' : 'transparent',
=======
                borderBottom: '1px solid #1a2332',
                backgroundColor: expandedId === disease.id ? '#1a2332' : 'transparent',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                  color: '#2A5674',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(161, 215, 214, 0.3)'
=======
                  color: '#e0e0e0',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                    <div style={{ fontSize: '12px', color: '#599BAE', marginTop: '2px' }}>
=======
                    <div style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
                      {disease.location.region}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      padding: '4px 8px',
<<<<<<< HEAD
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ef4444',
=======
                      backgroundColor: 'rgba(255, 68, 68, 0.2)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ff8888',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                    backgroundColor: 'rgba(209, 238, 234, 0.5)',
                    borderTop: '1px solid #A1D7D6',
                  }}
                >
                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#3F7994' }}>
                    <div>
                      <span style={{ color: '#599BAE' }}>Location:</span> X: {disease.location.x.toFixed(1)}, Y:{' '}
                      {disease.location.y.toFixed(1)}, Z: {disease.location.z.toFixed(1)}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ color: '#599BAE' }}>Severity:</span>{' '}
=======
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
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                        <span style={{ color: '#599BAE' }}>Size:</span> {disease.size}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', color: '#3F7994' }}>
=======
                        <span style={{ color: '#888888' }}>Size:</span> {disease.size}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', color: '#aaaaaa' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
          borderTop: '2px solid #A1D7D6',
          padding: '16px',
          backgroundColor: '#D1EEEA',
=======
          borderTop: '2px solid #2a3f5f',
          padding: '16px',
          backgroundColor: '#0a0e27',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
<<<<<<< HEAD
            color: '#2A5674',
=======
            color: '#e0e0e0',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
<<<<<<< HEAD
          <Zap size={16} style={{ color: '#f97316' }} />
=======
          <Zap size={16} style={{ color: '#ffff00' }} />
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
            <div style={{ fontSize: '12px', color: '#599BAE' }}>No predictions available</div>
=======
            <div style={{ fontSize: '12px', color: '#888888' }}>No predictions available</div>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
          ) : (
            predictedDiseases.map((disease) => (
              <div
                key={disease.id}
                onClick={() => onSelectDisease(disease)}
                style={{
                  padding: '10px 12px',
<<<<<<< HEAD
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  border: '1px solid #A1D7D6',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#A1D7D6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
=======
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
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#2A5674' }}>
                      {disease.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#599BAE', marginTop: '2px' }}>
=======
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#e0e0e0' }}>
                      {disease.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
                      Timeframe: {disease.timeframe}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '4px 8px',
<<<<<<< HEAD
                      backgroundColor: `rgba(239, 68, 68, 0.1)`,
=======
                      backgroundColor: `rgba(255, ${Math.floor(255 - disease.riskScore * 255)}, 0, 0.2)`,
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
