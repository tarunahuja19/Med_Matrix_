import { Routes, Route } from 'react-router-dom'
import MenuBar from './components/MenuBar'
import HomePage from './pages/HomePage'
import ImportPage from './pages/ImportPage'
import AnalysisPage from './pages/AnalysisPage'
import Viewer2DPage from './pages/Viewer2DPage'
import Viewer3DPage from './pages/Viewer3DPage'
import Viewer4DPage from './pages/Viewer4DPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'

function App() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <MenuBar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/viewer-2d" element={<Viewer2DPage />} />
          <Route path="/viewer-3d" element={<Viewer3DPage />} />
          <Route path="/viewer-4d" element={<Viewer4DPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
