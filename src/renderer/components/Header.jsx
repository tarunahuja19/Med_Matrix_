import React from 'react'
import { Activity } from 'lucide-react'

const Header = ({ modelMetrics = null }) => {
  return (
    <header
      style={{
<<<<<<< HEAD
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #A1D7D6',
=======
        backgroundColor: '#0a0e27',
        borderBottom: '1px solid #2a3f5f',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
<<<<<<< HEAD
        <Activity size={28} style={{ color: '#3F7994' }} />
=======
        <Activity size={28} style={{ color: '#4a7cff' }} />
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
<<<<<<< HEAD
              color: '#2A5674',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            PhantomNet
=======
              color: '#e0e0e0',
            }}
          >
            MRI Brain Analysis
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
          </h1>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
<<<<<<< HEAD
              color: '#599BAE',
=======
              color: '#888888',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
            <span style={{ color: '#599BAE' }}>Model:</span>{' '}
            <span style={{ color: '#2A5674', fontWeight: '600' }}>
=======
            <span style={{ color: '#888888' }}>Model:</span>{' '}
            <span style={{ color: '#e0e0e0', fontWeight: '600' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
              {modelMetrics.modelVersion}
            </span>
          </div>
          <div>
<<<<<<< HEAD
            <span style={{ color: '#599BAE' }}>Accuracy:</span>{' '}
            <span style={{ color: '#22c55e', fontWeight: '600' }}>
=======
            <span style={{ color: '#888888' }}>Accuracy:</span>{' '}
            <span style={{ color: '#66ff66', fontWeight: '600' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
              {Math.round(modelMetrics.accuracy * 100)}%
            </span>
          </div>
          <div>
<<<<<<< HEAD
            <span style={{ color: '#599BAE' }}>VRAM:</span>{' '}
            <span style={{ color: '#3F7994', fontWeight: '600' }}>
=======
            <span style={{ color: '#888888' }}>VRAM:</span>{' '}
            <span style={{ color: '#4a7cff', fontWeight: '600' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
              {modelMetrics.vramUsed.toFixed(1)}/{modelMetrics.vramAvailable.toFixed(1)} GB
            </span>
          </div>
          <div>
<<<<<<< HEAD
            <span style={{ color: '#599BAE' }}>Processing:</span>{' '}
            <span style={{ color: '#f97316', fontWeight: '600' }}>
=======
            <span style={{ color: '#888888' }}>Processing:</span>{' '}
            <span style={{ color: '#ffaa00', fontWeight: '600' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
              {modelMetrics.processingTime.toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
