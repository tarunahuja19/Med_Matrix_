import { useState } from 'react'
import { Settings, Monitor, Brain, Palette, FolderOpen, Save, RotateCcw } from 'lucide-react'

function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light',
    autoSave: true,
    showGrid: true,
    highContrast: false,
    defaultView: '3d',
    modelPrecision: 'high',
    gpuAcceleration: true,
    outputPath: '',
    cacheSize: '2',
    language: 'en'
  })

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    localStorage.setItem('neuroscan-settings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        theme: 'light',
        autoSave: true,
        showGrid: true,
        highContrast: false,
        defaultView: '3d',
        modelPrecision: 'high',
        gpuAcceleration: true,
        outputPath: '',
        cacheSize: '2',
        language: 'en'
      })
    }
  }

  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Settings</h1>
            <p className="text-text-secondary">
              Configure application preferences and model parameters
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-surface-hover transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Display</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Theme</label>
                <p className="text-sm text-text-muted">Choose your preferred color scheme</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">High Contrast Mode</label>
                <p className="text-sm text-text-muted">Enhance visibility for better readability</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleChange('highContrast', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Show Grid Overlay</label>
                <p className="text-sm text-text-muted">Display grid lines in viewers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => handleChange('showGrid', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Default Viewer</label>
                <p className="text-sm text-text-muted">Initial viewer when opening datasets</p>
              </div>
              <select
                value={settings.defaultView}
                onChange={(e) => handleChange('defaultView', e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="2d">2D Viewer</option>
                <option value="3d">3D Viewer</option>
                <option value="4d">4D Viewer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Model Settings */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Model Configuration</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Model Precision</label>
                <p className="text-sm text-text-muted">Higher precision uses more resources</p>
              </div>
              <select
                value={settings.modelPrecision}
                onChange={(e) => handleChange('modelPrecision', e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="low">Low (Faster)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Recommended)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">GPU Acceleration</label>
                <p className="text-sm text-text-muted">Use GPU for faster processing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gpuAcceleration}
                  onChange={(e) => handleChange('gpuAcceleration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Cache Size</label>
                <p className="text-sm text-text-muted">Memory allocated for caching</p>
              </div>
              <select
                value={settings.cacheSize}
                onChange={(e) => handleChange('cacheSize', e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="1">1 GB</option>
                <option value="2">2 GB</option>
                <option value="4">4 GB</option>
                <option value="8">8 GB</option>
              </select>
            </div>
          </div>
        </div>

        {/* Storage Settings */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Storage</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Auto-Save Results</label>
                <p className="text-sm text-text-muted">Automatically save analysis results</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="font-medium text-text-primary">Output Directory</label>
                  <p className="text-sm text-text-muted">Where to save analysis results</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.outputPath}
                  onChange={(e) => handleChange('outputPath', e.target.value)}
                  placeholder="Select output directory..."
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-surface-hover transition-colors">
                  Browse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">General</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text-primary">Language</label>
                <p className="text-sm text-text-muted">Interface language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
