import React, { useState } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import BrainVisualization from './components/BrainVisualization'
import DiseasePanel from './components/DiseasePanel'
import RiskAnalysisCharts from './components/RiskAnalysisCharts'
import { Spinner } from './components/Spinner'
import { analyzeMRIFile } from './services/mockApi'

function App() {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDisease, setSelectedDisease] = useState(null)

  const handleFileSelected = async (fileInfo) => {
    setIsLoading(true)
    try {
      const result = await analyzeMRIFile(fileInfo.fileName, fileInfo.fileSize)
      setAnalysisResult(result)
      setSelectedDisease(null)
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      alert('Error analyzing file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#D1EEEA',
        color: '#2A5674',
      }}
    >
      <Header modelMetrics={analysisResult?.modelMetrics} />

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: analysisResult ? '2fr 1fr' : '1fr 1fr',
          gap: '16px',
        }}
      >
        {/* Left Column - Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
          {isLoading ? (
            // Loading Section
            <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #A1D7D6', display: 'flex' }}>
              <Spinner message="Analyzing MRI scan... Processing kSpace data..." />
            </div>
          ) : !analysisResult ? (
            // Upload Section
            <div style={{ flex: 1 }}>
              <FileUpload onFileSelected={handleFileSelected} isLoading={isLoading} />
            </div>
          ) : (
            // Analysis Section with 3D Brain
            <>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #A1D7D6',
                  padding: '12px',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2A5674',
                  }}
                >
                  3D Brain Visualization
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <BrainVisualization
                    diseases={[
                      ...analysisResult.detectedDiseases,
                      ...analysisResult.predictedDiseases,
                    ]}
                    selectedDisease={selectedDisease}
                  />
                </div>
              </div>

              {/* Charts Section */}
              <div
                style={{
                  height: '300px',
                }}
              >
                <RiskAnalysisCharts riskAnalysis={analysisResult.riskAnalysis} />
              </div>
            </>
          )}
        </div>

        {/* Right Column - Disease Panel and Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: 0,
          }}
        >
          {!analysisResult ? (
            // Welcome message during file upload
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #A1D7D6',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
              }}
            >
              <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#3F7994' }}>
                <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#2A5674', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Welcome to Mamba 2 Brain Analysis
                </div>
                <div>
                  Upload a kSpace medical file to begin analysis. Our AI model will:
                </div>
                <ul
                  style={{
                    margin: '12px 0',
                    paddingLeft: '20px',
                    textAlign: 'left',
                    display: 'inline-block',
                  }}
                >
                  <li style={{ marginBottom: '6px' }}>Detect microbleeds with high accuracy</li>
                  <li style={{ marginBottom: '6px' }}>Identify brain tumors</li>
                  <li style={{ marginBottom: '6px' }}>Predict future disease risks</li>
                  <li style={{ marginBottom: '6px' }}>Visualize suspicious regions in 3D</li>
                  <li>Analyze risk factors with minimal VRAM usage</li>
                </ul>
              </div>
            </div>
          ) : (
            // Disease Panel after analysis
            <DiseasePanel
              diseases={analysisResult.detectedDiseases}
              predictedDiseases={analysisResult.predictedDiseases}
              onSelectDisease={setSelectedDisease}
            />
          )}
        </div>
      </div>

      {/* Action Bar */}
      {analysisResult && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #A1D7D6',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#599BAE' }}>
            File: <span style={{ color: '#2A5674', fontWeight: '600' }}>
              {analysisResult.fileName}
            </span>{' '}
            | Analyzed: {new Date(analysisResult.analysisTimestamp).toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setAnalysisResult(null)
                setSelectedDisease(null)
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#D1EEEA',
                border: '1px solid #A1D7D6',
                borderRadius: '4px',
                color: '#2A5674',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#A1D7D6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#D1EEEA'
              }}
            >
              Upload Another File
            </button>
            <button
              onClick={() => {
                alert('Report generation coming soon!')
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3F7994',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2A5674'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3F7994'
              }}
            >
              Generate Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
