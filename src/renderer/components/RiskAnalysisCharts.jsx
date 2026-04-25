import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale,
} from 'chart.js'
import { Line, Bar, Radar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale,
)

const RiskAnalysisCharts = ({ riskAnalysis = null }) => {
  if (!riskAnalysis) {
    return (
      <div
        style={{
          padding: '20px',
          color: '#888888',
          textAlign: 'center',
        }}
      >
        No analysis data available
      </div>
    )
  }

  // Risk Timeline Chart
  const timelineData = {
    labels: riskAnalysis.riskTimeline.map((t) => `Month ${t.month}`),
    datasets: [
      {
        label: 'Risk Score Projection',
        data: riskAnalysis.riskTimeline.map((t) => t.riskScore),
        borderColor: '#ff4444',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ff4444',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  // Regional Risk Heatmap
  const regionalData = {
    labels: riskAnalysis.regionalHeatmap.map((r) => r.region),
    datasets: [
      {
        label: 'Risk Level by Region',
        data: riskAnalysis.regionalHeatmap.map((r) => r.severity),
        backgroundColor: [
          'rgba(255, 68, 68, 0.7)',
          'rgba(255, 136, 0, 0.7)',
          'rgba(255, 170, 0, 0.7)',
          'rgba(102, 255, 102, 0.7)',
          'rgba(102, 200, 102, 0.7)',
        ],
        borderColor: [
          '#ff4444',
          '#ff8800',
          '#ffaa00',
          '#66ff66',
          '#66cc66',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Risk Factors Radar Chart
  const riskFactorsLabels = Object.keys(riskAnalysis.riskFactors)
  const riskFactorsData = Object.values(riskAnalysis.riskFactors).map((val) => {
    if (typeof val === 'number') return val * 20 // Scale up numbers
    if (val === 'Significant') return 8
    if (val === 'Medium') return 6
    if (val === 'High Risk Group') return 8
    return 5
  })

  const radarData = {
    labels: riskFactorsLabels,
    datasets: [
      {
        label: 'Risk Factor Severity',
        data: riskFactorsData,
        borderColor: '#ffff00',
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#ffff00',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#e0e0e0',
        borderColor: '#2a3f5f',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(42, 63, 95, 0.3)',
        },
        ticks: {
          color: '#888888',
        },
      },
      x: {
        grid: {
          color: 'rgba(42, 63, 95, 0.3)',
        },
        ticks: {
          color: '#888888',
        },
      },
      r: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(42, 63, 95, 0.3)',
        },
        ticks: {
          color: '#888888',
        },
      },
    },
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
          }}
        >
          Risk Analysis & Projections
        </h2>
      </div>

      {/* Overall Risk Score */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #2a3f5f',
          backgroundColor: '#1a2332',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>
            Overall Brain Health Risk
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ff4444',
            }}
          >
            {riskAnalysis.overallRiskScore.toFixed(1)}/10
          </div>
        </div>
        <div
          style={{
            padding: '8px 16px',
            backgroundColor:
              riskAnalysis.overallRiskScore > 6
                ? 'rgba(255, 68, 68, 0.2)'
                : 'rgba(255, 170, 0, 0.2)',
            borderRadius: '4px',
            color:
              riskAnalysis.overallRiskScore > 6 ? '#ff4444' : '#ffaa00',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {riskAnalysis.brainHealthStatus}
        </div>
      </div>

      {/* Charts Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}
      >
        {/* Timeline Chart */}
        <div
          style={{
            backgroundColor: '#0a0e27',
            borderRadius: '6px',
            border: '1px solid #2a3f5f',
            padding: '12px',
            minHeight: '250px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#e0e0e0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Risk Timeline
          </h3>
          <Line data={timelineData} options={chartOptions} />
        </div>

        {/* Regional Heatmap */}
        <div
          style={{
            backgroundColor: '#0a0e27',
            borderRadius: '6px',
            border: '1px solid #2a3f5f',
            padding: '12px',
            minHeight: '250px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#e0e0e0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Risk by Brain Region
          </h3>
          <Bar data={regionalData} options={chartOptions} />
        </div>

        {/* Risk Factors Radar */}
        <div
          style={{
            backgroundColor: '#0a0e27',
            borderRadius: '6px',
            border: '1px solid #2a3f5f',
            padding: '12px',
            minHeight: '250px',
            gridColumn: '1 / -1',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#e0e0e0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Risk Factor Analysis
          </h3>
          <div style={{ height: '250px' }}>
            <Radar data={radarData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskAnalysisCharts
