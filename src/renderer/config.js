/**
 * Application Configuration
 * Edit this file to customize the app behavior
 */

export const APP_CONFIG = {
  // Application metadata
  APP_NAME: 'MRI Brain Analysis Tool',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Mamba 2 AI-powered brain disease detection and analysis',

  // API Configuration
  API: {
    USE_MOCK_API: true,
    MOCK_API_DELAY: 2000, // ms - simulates processing time
    API_URL: 'http://localhost:8000/api',
    REQUEST_TIMEOUT: 30000, // ms
  },

  // UI Configuration
  UI: {
    // Theme colors - Teal palette
    COLORS: {
      BG_PRIMARY: '#D1EEEA',
      BG_SECONDARY: '#A1D7D6',
      BG_TERTIARY: '#79B8C3',
      TEXT_PRIMARY: '#2A5674',
      TEXT_SECONDARY: '#3F7994',
      TEXT_MUTED: '#599BAE',
      BORDER: '#A1D7D6',
      ACCENT_BLUE: '#3F7994',
      ACCENT_RED: '#ef4444',
      ACCENT_ORANGE: '#f97316',
      ACCENT_GREEN: '#22c55e',
    },

    // Brain visualization
    BRAIN: {
      WIREFRAME: false,
      COLOR: 0x4a5578,
      EMISSIVE: 0x2a3558,
      SHININESS: 30,
      SCALE: 80,
      DETAIL: 5, // Higher = more detailed (slower)
      AMBIENT_LIGHT_INTENSITY: 0.6,
      DIRECTIONAL_LIGHT_INTENSITY: 0.8,
    },

    // Disease markers
    MARKERS: {
      DETECTED_HIGH: { color: 0xff4444, size: 8 },
      DETECTED_MEDIUM: { color: 0xff8800, size: 6 },
      DETECTED_LOW: { color: 0xffaa00, size: 6 },
      PREDICTED: { color: 0xffff00, size: 6 },
      SELECTED: { color: 0x00ff00, scale: 1.5 },
    },

    // Layout
    LAYOUT: {
      SIDEBAR_WIDTH: '1fr',
      MAIN_WIDTH: '2fr',
      HEADER_HEIGHT: '60px',
      FOOTER_HEIGHT: '50px',
    },
  },

  // Disease Configuration
  DISEASES: {
    TYPES: {
      MICROBLEED: 'microbleed',
      TUMOR: 'tumor',
      STROKE: 'stroke',
      LESION: 'lesion',
      ANEURYSM: 'aneurysm',
    },

    // Severity levels
    SEVERITY: {
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
    },

    // Risk levels for prediction
    RISK_LEVELS: {
      CRITICAL: 0.8,
      HIGH: 0.6,
      MODERATE: 0.4,
      LOW: 0,
    },
  },

  // File Upload Configuration
  FILE_UPLOAD: {
    ACCEPTED_FORMATS: ['raw', 'dcm', 'nii', 'gz'],
    MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB in bytes
    ALLOWED_MIME_TYPES: [
      'application/octet-stream',
      'application/x-gzip',
      'image/dicom',
    ],
  },

  // Brain Regions
  BRAIN_REGIONS: [
    'Frontal Lobe',
    'Parietal Lobe',
    'Temporal Lobe',
    'Occipital Lobe',
    'Cerebellum',
    'Brain Stem',
    'Left Hemisphere',
    'Right Hemisphere',
    'Thalamus',
    'Hippocampus',
  ],

  // Chart Configuration
  CHARTS: {
    BACKGROUND_COLOR: '#D1EEEA',
    TEXT_COLOR: '#2A5674',
    GRID_COLOR: '#A1D7D6',
    ANIMATION_DURATION: 800, // ms
  },

  // Performance
  PERFORMANCE: {
    ENABLE_STATS: false, // Show performance stats in dev
    MAX_MARKERS: 50, // Maximum markers on 3D brain
    RENDERER_ANTIALIAS: true,
    RENDERER_PIXEL_RATIO: 1, // 2 for higher quality but slower
  },

  // Development
  DEV: {
    DEBUG_MODE: false,
    SHOW_DEVTOOLS: true,
    LOG_API_CALLS: true,
  },
}

/**
 * Get a config value with dot notation
 * @param {string} path - Config path (e.g., 'UI.COLORS.ACCENT_BLUE')
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Config value
 */
export function getConfig(path, defaultValue = undefined) {
  const keys = path.split('.')
  let value = APP_CONFIG

  for (const key of keys) {
    if (typeof value !== 'object' || value === null) {
      return defaultValue
    }
    value = value[key]
  }

  return value !== undefined ? value : defaultValue
}

/**
 * Update a config value
 * @param {string} path - Config path
 * @param {any} value - New value
 */
export function setConfig(path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  let obj = APP_CONFIG

  for (const key of keys) {
    if (!(key in obj)) {
      obj[key] = {}
    }
    obj = obj[key]
  }

  obj[lastKey] = value
}

export default APP_CONFIG
