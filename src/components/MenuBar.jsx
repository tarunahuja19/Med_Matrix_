import { NavLink } from 'react-router-dom'
import {
  Home,
  Upload,
  BarChart3,
  Square,
  Box,
  Layers,
  Brain
} from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/import', label: 'Import', icon: Upload },
  { path: '/analysis', label: 'Analysis', icon: BarChart3 },
  { path: '/viewer-2d', label: '2D Viewer', icon: Square },
  { path: '/viewer-3d', label: '3D Viewer', icon: Box },
  { path: '/viewer-4d', label: '4D Viewer', icon: Layers },
]

function MenuBar() {
  return (
    <header className="bg-surface border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo Section */}
        <div className="flex items-center gap-3">

          <div className="flex flex-col">
            <NavLink to="/" className="text-lg font-bold text-text-primary leading-tight hover:opacity-80 transition-opacity" style={{ fontFamily: "'Sora', sans-serif" }}>
              PhantomNet
            </NavLink>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>


      </div>
    </header>
  )
}

export default MenuBar
