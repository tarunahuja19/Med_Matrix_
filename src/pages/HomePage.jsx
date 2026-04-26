import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="page-transition h-full overflow-auto bg-gray-50">
      <div className="min-h-full flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center px-8 py-12 lg:px-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="space-y-8">
                {/* Version Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="text-gray-800">What the scan</span>
                  <br />
                  <span className="text-gray-800">misses,</span>
                  <br />
                  <span className="text-teal-500">PhantomNet</span>
                  <br />
                  <span className="text-gray-800">finds.</span>
                </h1>

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                  A Mamba-2 selective state-space network that reads brain MRI{' '}
                  <span className="text-gray-800 font-semibold">straight from k-space</span>
                  {' '}&mdash; surfacing microbleeds, white-matter lesions, and silent infarcts that conventional reconstruction pipelines erase.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Enter Workstation
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/import"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-colors shadow-sm"
                  >
                    Upload K-Space
                  </Link>
                </div>
              </div>

              {/* Right Column - Brain Visualization */}
              <div className="relative flex items-center justify-center">
                {/* Brain Container */}
                <div className="relative w-full max-w-lg aspect-square bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  {/* Label */}
                  <div className="absolute top-4 right-4 text-gray-400 text-xs font-mono">
                    MAMBA2_INFERENCE.LIVE
                  </div>

                  {/* Orbital Rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[85%] h-[85%] border border-dashed border-teal-300/50 rounded-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[65%] h-[65%] border border-teal-200/40 rounded-full" />
                  </div>

                  {/* Brain Image Container */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[70%] h-[80%]">
                      {/* Brain Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-teal-100/50 via-teal-50/30 to-transparent rounded-full blur-2xl" />

                      {/* Stylized Brain SVG */}
                      <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                        {/* Brain outline */}
                        <ellipse cx="100" cy="100" rx="75" ry="85" fill="none" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.9" />

                        {/* Brain hemisphere division */}
                        <path d="M100 15 L100 185" stroke="rgba(20,184,166,0.4)" strokeWidth="1" strokeDasharray="4,4" />

                        {/* Left hemisphere details */}
                        <path d="M40 70 Q50 50 70 45 Q90 40 100 50" fill="none" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" />
                        <path d="M35 100 Q45 80 65 75 Q85 70 95 80" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1.5" />
                        <path d="M40 130 Q55 110 75 105 Q95 100 100 110" fill="none" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" />
                        <path d="M50 160 Q70 140 90 145 Q100 150 100 160" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1.5" />

                        {/* Right hemisphere details */}
                        <path d="M160 70 Q150 50 130 45 Q110 40 100 50" fill="none" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" />
                        <path d="M165 100 Q155 80 135 75 Q115 70 105 80" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1.5" />
                        <path d="M160 130 Q145 110 125 105 Q105 100 100 110" fill="none" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" />
                        <path d="M150 160 Q130 140 110 145 Q100 150 100 160" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1.5" />

                        {/* Brain stem */}
                        <path d="M85 175 Q100 190 115 175 L110 200 Q100 210 90 200 Z" fill="rgba(20,184,166,0.2)" stroke="rgba(20,184,166,0.6)" strokeWidth="1.5" />

                        {/* Central glow */}
                        <ellipse cx="100" cy="100" rx="25" ry="30" fill="url(#centerGlow)" opacity="0.5" />

                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(20,184,166,0.9)" />
                            <stop offset="50%" stopColor="rgba(20,184,166,0.5)" />
                            <stop offset="100%" stopColor="rgba(20,184,166,0.9)" />
                          </linearGradient>
                          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(20,184,166,0.4)" />
                            <stop offset="100%" stopColor="rgba(20,184,166,0)" />
                          </radialGradient>
                        </defs>
                      </svg>

                      {/* Detection Markers */}
                      {/* Orange marker - top right */}
                      <div className="absolute top-[15%] right-[20%]">
                        <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />
                        <div className="absolute inset-0 w-3 h-3 bg-orange-500 rounded-full animate-ping opacity-75" />
                      </div>

                      {/* Red marker - middle right */}
                      <div className="absolute top-[45%] right-[10%]">
                        <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                        <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
                      </div>

                      {/* Blue marker - middle left */}
                      <div className="absolute top-[55%] left-[25%]">
                        <div className="w-2.5 h-2.5 bg-sky-400 rounded-full shadow-lg shadow-sky-400/50" />
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping opacity-75" />
                      </div>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-teal-50 border border-teal-200 rounded text-teal-600 text-xs font-mono">
                    CONF 0.964
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="px-8 py-6 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-2 text-sm text-gray-500 font-mono">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-500" />
                <span>142 ITER/S</span>
              </div>
              <span className="text-gray-300">&#183;</span>
              <span>HIPAA</span>
              <span className="text-gray-300">&#183;</span>
              <span>DICOM</span>
              <span className="text-gray-300">&#183;</span>
              <span>BIDS</span>
              <span className="text-gray-300">&#183;</span>
              <span>MED_MATRIX RESEARCH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
