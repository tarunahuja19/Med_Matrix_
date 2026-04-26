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
          color: '#599BAE',
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
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
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
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(22, 163, 74, 0.7)',
        ],
        borderColor: [
          '#ef4444',
          '#f97316',
          '#eab308',
          '#22c55e',
          '#16a34a',
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
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#f97316',
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
          color: '#2A5674',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(42, 86, 116, 0.9)',
        titleColor: '#fff',
        bodyColor: '#D1EEEA',
        borderColor: '#A1D7D6',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(161, 215, 214, 0.3)',
        },
        ticks: {
          color: '#599BAE',
        },
      },
      x: {
        grid: {
          color: 'rgba(161, 215, 214, 0.3)',
        },
        ticks: {
          color: '#599BAE',
        },
      },
      r: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(161, 215, 214, 0.3)',
        },
        ticks: {
          color: '#599BAE',
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
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #A1D7D6',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #A1D7D6',
          backgroundColor: '#D1EEEA',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#2A5674',
          }}
        >
          Risk Analysis & Projections
        </h2>
      </div>

      {/* Overall Risk Score */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #A1D7D6',
          backgroundColor: '#D1EEEA',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#599BAE', marginBottom: '4px' }}>
            Overall Brain Health Risk
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ef4444',
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
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(234, 179, 8, 0.2)',
            borderRadius: '4px',
            color:
              riskAnalysis.overallRiskScore > 6 ? '#ef4444' : '#eab308',
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
            backgroundColor: '#D1EEEA',
            borderRadius: '6px',
            border: '1px solid #A1D7D6',
            padding: '12px',
            minHeight: '250px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#2A5674',
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
            backgroundColor: '#D1EEEA',
            borderRadius: '6px',
            border: '1px solid #A1D7D6',
            padding: '12px',
            minHeight: '250px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#2A5674',
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
            backgroundColor: '#D1EEEA',
            borderRadius: '6px',
            border: '1px solid #A1D7D6',
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
              color: '#2A5674',
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
