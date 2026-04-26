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
<<<<<<< HEAD
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #A1D7D6',
=======
        backgroundColor: '#0f1429',
        borderRadius: '8px',
        border: '1px solid #2a3f5f',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
          color: '#2A5674',
=======
          color: '#e0e0e0',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
          border: `2px dashed ${dragActive ? '#3F7994' : '#A1D7D6'}`,
=======
          border: `2px dashed ${dragActive ? '#4a7cff' : '#2a3f5f'}`,
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
<<<<<<< HEAD
          backgroundColor: dragActive ? 'rgba(63, 121, 148, 0.1)' : 'rgba(161, 215, 214, 0.2)',
=======
          backgroundColor: dragActive ? 'rgba(74, 124, 255, 0.1)' : 'rgba(42, 63, 95, 0.2)',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                color: '#22c55e',
=======
                color: '#66ff66',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
                marginBottom: '12px',
              }}
            />
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
<<<<<<< HEAD
                color: '#2A5674',
=======
                color: '#e0e0e0',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
                marginBottom: '4px',
              }}
            >
              {uploadedFile.name}
            </div>
<<<<<<< HEAD
            <div style={{ fontSize: '12px', color: '#599BAE' }}>
=======
            <div style={{ fontSize: '12px', color: '#888888' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
              {uploadedFile.size} MB
            </div>
            {isLoading && (
              <div style={{ marginTop: '12px' }}>
                <div
                  style={{
                    fontSize: '12px',
<<<<<<< HEAD
                    color: '#3F7994',
=======
                    color: '#4a7cff',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
                color: '#3F7994',
=======
                color: '#4a7cff',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
                marginBottom: '12px',
              }}
            />
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
<<<<<<< HEAD
                color: '#2A5674',
=======
                color: '#e0e0e0',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
                marginBottom: '4px',
              }}
            >
              Drag and drop your kSpace file
            </div>
<<<<<<< HEAD
            <div style={{ fontSize: '12px', color: '#599BAE' }}>
=======
            <div style={{ fontSize: '12px', color: '#888888' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
              or click to browse
            </div>
            <div
              style={{
                marginTop: '12px',
                fontSize: '11px',
<<<<<<< HEAD
                color: '#79B8C3',
=======
                color: '#666666',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
<<<<<<< HEAD
          backgroundColor: 'rgba(161, 215, 214, 0.3)',
          border: '1px solid #A1D7D6',
=======
          backgroundColor: 'rgba(42, 63, 95, 0.3)',
          border: '1px solid #2a3f5f',
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
          borderRadius: '6px',
          padding: '12px',
          fontSize: '12px',
          lineHeight: '1.6',
<<<<<<< HEAD
          color: '#3F7994',
        }}
      >
        <div style={{ fontWeight: '600', color: '#2A5674', marginBottom: '8px' }}>
=======
          color: '#aaaaaa',
        }}
      >
        <div style={{ fontWeight: '600', color: '#e0e0e0', marginBottom: '8px' }}>
>>>>>>> 736863206e35dfdd441e7f4a8504d52a28d54ab0
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
