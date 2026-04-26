import React from 'react'
import { Activity } from 'lucide-react'

const Header = ({ modelMetrics = null }) => {
  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #A1D7D6',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity size={28} style={{ color: '#3F7994' }} />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#2A5674',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            PhantomNet
          </h1>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
              color: '#599BAE',
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
            <span style={{ color: '#599BAE' }}>Model:</span>{' '}
            <span style={{ color: '#2A5674', fontWeight: '600' }}>
              {modelMetrics.modelVersion}
            </span>
          </div>
          <div>
            <span style={{ color: '#599BAE' }}>Accuracy:</span>{' '}
            <span style={{ color: '#22c55e', fontWeight: '600' }}>
              {Math.round(modelMetrics.accuracy * 100)}%
            </span>
          </div>
          <div>
            <span style={{ color: '#599BAE' }}>VRAM:</span>{' '}
            <span style={{ color: '#3F7994', fontWeight: '600' }}>
              {modelMetrics.vramUsed.toFixed(1)}/{modelMetrics.vramAvailable.toFixed(1)} GB
            </span>
          </div>
          <div>
            <span style={{ color: '#599BAE' }}>Processing:</span>{' '}
            <span style={{ color: '#f97316', fontWeight: '600' }}>
              {modelMetrics.processingTime.toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
