import { useState } from 'react'
import { Upload, FolderOpen, File, X, Check, AlertCircle, HardDrive } from 'lucide-react'

function ImportPage() {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [importType, setImportType] = useState('kspace')

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      status: 'ready'
    }))
    setFiles(prev => [...prev, ...fileObjects])
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    const types = {
      dat: 'K-Space', h5: 'K-Space', hdf5: 'K-Space', raw: 'K-Space',
      dcm: 'DICOM', nii: 'NIfTI', mha: 'MetaImage'
    }
    return types[ext] || 'Unknown'
  }

  const handleBrowseFiles = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile()
      if (!result.canceled && result.filePaths.length > 0) {
        const fileObjects = result.filePaths.map((path, index) => ({
          id: Date.now() + index,
          name: path.split(/[/\\]/).pop(),
          size: 'Calculating...',
          type: getFileType(path),
          status: 'ready'
        }))
        setFiles(prev => [...prev, ...fileObjects])
      }
    }
  }

  const handleBrowseFolder = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openDirectory()
      if (!result.canceled && result.filePaths.length > 0) {
        const folderObject = {
          id: Date.now(),
          name: result.filePaths[0].split(/[/\\]/).pop(),
          size: 'Directory',
          type: 'Folder',
          status: 'ready'
        }
        setFiles(prev => [...prev, folderObject])
      }
    }
  }

  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Import Dataset</h1>
          <p className="text-text-secondary">
            Import K-space files or MRI scan images for analysis
          </p>
        </div>

        {/* Import Type Selection */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Data Type</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setImportType('kspace')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                importType === 'kspace'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <HardDrive className={`w-6 h-6 mb-2 ${importType === 'kspace' ? 'text-primary' : 'text-text-secondary'}`} />
              <div className={`font-medium ${importType === 'kspace' ? 'text-primary' : 'text-text-primary'}`}>
                K-Space Data
              </div>
              <div className="text-xs text-text-muted mt-1">.dat, .h5, .hdf5, .raw</div>
            </button>
            <button
              onClick={() => setImportType('mri')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                importType === 'mri'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <File className={`w-6 h-6 mb-2 ${importType === 'mri' ? 'text-primary' : 'text-text-secondary'}`} />
              <div className={`font-medium ${importType === 'mri' ? 'text-primary' : 'text-text-primary'}`}>
                MRI Images
              </div>
              <div className="text-xs text-text-muted mt-1">.dcm, .nii, .mha</div>
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`bg-surface rounded-xl border-2 border-dashed p-12 text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Drag and drop files here
          </h3>
          <p className="text-text-secondary mb-6">
            or use the buttons below to browse
          </p>
          <div className="flex items-center justify-center gap-4">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
              <File className="w-4 h-4" />
              <span>Browse Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".dat,.h5,.hdf5,.raw,.dcm,.nii,.mha"
              />
            </label>
            <button
              onClick={handleBrowseFolder}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse Folder</span>
            </button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 bg-surface rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-text-primary">
                Selected Files ({files.length})
              </h3>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-danger hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between px-6 py-3 hover:bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-text-muted" />
                    <div>
                      <div className="font-medium text-text-primary">{file.name}</div>
                      <div className="text-xs text-text-muted">
                        {file.type} - {file.size}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {file.status === 'ready' && (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <Check className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-text-muted hover:text-danger transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border bg-surface-hover">
              <button className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                Start Import & Analysis
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <strong className="text-text-primary">Supported formats:</strong> K-space data (.dat, .h5, .hdf5, .raw) 
            and standard MRI formats (.dcm, .nii, .nii.gz, .mha). Large datasets may take longer to process.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportPage
