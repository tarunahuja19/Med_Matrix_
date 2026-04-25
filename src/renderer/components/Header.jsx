import React from 'react'
import { Activity } from 'lucide-react'

const Header = ({ modelMetrics = null }) => {
  return (
    <header
      style={{
        backgroundColor: '#0a0e27',
        borderBottom: '1px solid #2a3f5f',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity size={28} style={{ color: '#4a7cff' }} />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#e0e0e0',
            }}
          >
            MRI Brain Analysis
          </h1>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
              color: '#888888',
            }}
          >
            Mamba 2 AI Disease Detector
          </p>
        </div>
      </div>

      {modelMetrics && (
        <div
          style={{
            display: 'flex',
            gap: '24px',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ color: '#888888' }}>Model:</span>{' '}
            <span style={{ color: '#e0e0e0', fontWeight: '600' }}>
              {modelMetrics.modelVersion}
            </span>
          </div>
          <div>
            <span style={{ color: '#888888' }}>Accuracy:</span>{' '}
            <span style={{ color: '#66ff66', fontWeight: '600' }}>
              {Math.round(modelMetrics.accuracy * 100)}%
            </span>
          </div>
          <div>
            <span style={{ color: '#888888' }}>VRAM:</span>{' '}
            <span style={{ color: '#4a7cff', fontWeight: '600' }}>
              {modelMetrics.vramUsed.toFixed(1)}/{modelMetrics.vramAvailable.toFixed(1)} GB
            </span>
          </div>
          <div>
            <span style={{ color: '#888888' }}>Processing:</span>{' '}
            <span style={{ color: '#ffaa00', fontWeight: '600' }}>
              {modelMetrics.processingTime.toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
