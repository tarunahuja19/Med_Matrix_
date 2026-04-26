import React, { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'

const FileUpload = ({ onFileSelected = () => {}, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    const validExtensions = ['raw', 'dcm', 'nii', 'gz']
    const fileExtension = file.name.split('.').pop().toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      alert('Please upload a valid medical file format (raw, dcm, nii, nii.gz)')
      return
    }

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
    })

    onFileSelected({
      fileName: file.name,
      fileSize: file.size,
    })
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #A1D7D6',
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2
        style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#2A5674',
        }}
      >
        Upload kSpace File
      </h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          flex: 1,
          border: `2px dashed ${dragActive ? '#3F7994' : '#A1D7D6'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? 'rgba(63, 121, 148, 0.1)' : 'rgba(161, 215, 214, 0.2)',
          transition: 'all 0.3s',
          marginBottom: '16px',
        }}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          style={{ display: 'none' }}
          accept=".raw,.dcm,.nii,.gz"
          disabled={isLoading}
        />

        {uploadedFile ? (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CheckCircle
              size={48}
              style={{
                color: '#22c55e',
                marginBottom: '12px',
              }}
            />
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2A5674',
                marginBottom: '4px',
              }}
            >
              {uploadedFile.name}
            </div>
            <div style={{ fontSize: '12px', color: '#599BAE' }}>
              {uploadedFile.size} MB
            </div>
            {isLoading && (
              <div style={{ marginTop: '12px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#3F7994',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  Analyzing file...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Upload
              size={48}
              style={{
                color: '#3F7994',
                marginBottom: '12px',
              }}
            />
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2A5674',
                marginBottom: '4px',
              }}
            >
              Drag and drop your kSpace file
            </div>
            <div style={{ fontSize: '12px', color: '#599BAE' }}>
              or click to browse
            </div>
            <div
              style={{
                marginTop: '12px',
                fontSize: '11px',
                color: '#79B8C3',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertCircle size={14} />
              Supported: .raw, .dcm, .nii, .nii.gz
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div
        style={{
          backgroundColor: 'rgba(161, 215, 214, 0.3)',
          border: '1px solid #A1D7D6',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '12px',
          lineHeight: '1.6',
          color: '#3F7994',
        }}
      >
        <div style={{ fontWeight: '600', color: '#2A5674', marginBottom: '8px' }}>
          Mamba 2 AI Analysis Features:
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Microbleed detection with high accuracy</li>
          <li>Brain tumor identification</li>
          <li>Risk prediction for future diseases</li>
          <li>Position clustering analysis</li>
          <li>Low VRAM consumption (2GB)</li>
        </ul>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default FileUpload
