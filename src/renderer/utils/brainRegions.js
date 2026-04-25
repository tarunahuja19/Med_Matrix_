export const BRAIN_REGIONS = {
  frontal: {
    id: 'frontal',
    name: 'Frontal Lobe',
    color: '#ff6b6b',
    position: { x: 0, y: 2, z: 0 },
    radius: 1.2,
    description: 'Controls reasoning, planning, and motor functions',
  },
  parietal: {
    id: 'parietal',
    name: 'Parietal Lobe',
    color: '#4ecdc4',
    position: { x: 0.8, y: 0.5, z: 0 },
    radius: 0.9,
    description: 'Processes touch and spatial awareness',
  },
  temporal: {
    id: 'temporal',
    name: 'Temporal Lobe',
    color: '#45b7d1',
    position: { x: -1.2, y: 0, z: 0 },
    radius: 0.8,
    description: 'Handles memory and hearing',
  },
  occipital: {
    id: 'occipital',
    name: 'Occipital Lobe',
    color: '#96ceb4',
    position: { x: 0, y: -1.5, z: 0 },
    radius: 0.8,
    description: 'Processes visual information',
  },
  cerebellum: {
    id: 'cerebellum',
    name: 'Cerebellum',
    color: '#ffeaa7',
    position: { x: 0, y: -1.8, z: -1 },
    radius: 0.7,
    description: 'Coordinates movement and balance',
  },
  brainstem: {
    id: 'brainstem',
    name: 'Brain Stem',
    color: '#dfe6e9',
    position: { x: 0, y: -1, z: 0.5 },
    radius: 0.6,
    description: 'Controls vital functions',
  },
  leftHemisphere: {
    id: 'leftHemisphere',
    name: 'Left Hemisphere',
    color: '#a29bfe',
    position: { x: -0.5, y: 0, z: 0 },
    radius: 1.5,
    description: 'Right side motor and sensory control',
  },
  rightHemisphere: {
    id: 'rightHemisphere',
    name: 'Right Hemisphere',
    color: '#fd79a8',
    position: { x: 0.5, y: 0, z: 0 },
    radius: 1.5,
    description: 'Left side motor and sensory control',
  },
}

export function getRegionByName(name) {
  const lowerName = name.toLowerCase()
  return Object.values(BRAIN_REGIONS).find(
    region => region.name.toLowerCase().includes(lowerName) ||
               region.id === lowerName
  )
}

export function getRegionColor(severity) {
  if (severity >= 0.8) return '#ff6b6b' // High risk - red
  if (severity >= 0.6) return '#ff9f43' // Medium-high - orange
  if (severity >= 0.4) return '#ffd93d' // Medium - yellow
  return '#6bcf7f' // Low - green
}

export function calculateRiskLevel(severity) {
  if (severity >= 0.8) return 'Critical'
  if (severity >= 0.6) return 'High'
  if (severity >= 0.4) return 'Moderate'
  return 'Low'
}
