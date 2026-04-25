// Mock API service for demonstration
export const analyzeMRIFile = async (fileName, fileSize) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return {
    id: Math.random().toString(36).substr(2, 9),
    fileName,
    fileSize,
    analysisTimestamp: new Date().toISOString(),
    detectedDiseases: [
      {
        id: 'microbleed-1',
        name: 'Microbleed',
        type: 'detected',
        confidence: 0.94,
        location: {
          x: 45.2,
          y: -22.5,
          z: 38.1,
          region: 'Right Temporal Lobe',
        },
        severity: 'high',
        description: 'Small hemorrhage detected in right temporal region',
      },
      {
        id: 'microbleed-2',
        name: 'Microbleed',
        type: 'detected',
        confidence: 0.87,
        location: {
          x: -38.5,
          y: -15.3,
          z: 42.8,
          region: 'Left Parietal Lobe',
        },
        severity: 'medium',
        description: 'Small hemorrhage in left parietal area',
      },
      {
        id: 'tumor-1',
        name: 'Brain Tumor',
        type: 'detected',
        confidence: 0.91,
        location: {
          x: 12.3,
          y: 5.8,
          z: 25.5,
          region: 'Frontal Lobe',
        },
        severity: 'high',
        size: 'Large',
        description: 'Potential tumor mass in frontal region',
      },
      {
        id: 'edema',
        name: 'Cerebral Edema',
        type: 'detected',
        confidence: 0.76,
        location: {
          x: 8.5,
          y: 2.3,
          z: 28.9,
          region: 'Frontal Lobe',
        },
        severity: 'medium',
        description: 'Brain swelling detected adjacent to tumor',
      },
    ],
    predictedDiseases: [
      {
        id: 'stroke-risk',
        name: 'Stroke Risk',
        type: 'predicted',
        riskScore: 0.73,
        timeframe: '6-12 months',
        location: {
          x: 35.2,
          y: -18.5,
          z: 40.1,
          region: 'Right Middle Cerebral Artery Territory',
        },
        causeFactor: 'Multiple microbleeds indicating vasculopathy',
        preventiveMeasures: [
          'Anticoagulation therapy',
          'Blood pressure management',
          'Lifestyle modifications',
        ],
      },
      {
        id: 'alzheimers-risk',
        name: 'Alzheimer\'s Disease Risk',
        type: 'predicted',
        riskScore: 0.58,
        timeframe: '2-5 years',
        location: {
          x: -2.5,
          y: -15.8,
          z: 8.5,
          region: 'Hippocampus',
        },
        causeFactor: 'Combination of microbleeds and potential atrophy',
        preventiveMeasures: [
          'Cognitive training',
          'Regular exercise',
          'Mediterranean diet',
          'Cognitive screening',
        ],
      },
      {
        id: 'hydrocephalus-risk',
        name: 'Hydrocephalus Risk',
        type: 'predicted',
        riskScore: 0.42,
        timeframe: '1-3 years',
        location: {
          x: 0.5,
          y: 8.2,
          z: 12.3,
          region: 'Ventricular System',
        },
        causeFactor: 'Potential obstruction from tumor growth',
        preventiveMeasures: [
          'Regular imaging follow-up',
          'Neurosurgical consultation',
          'ICP monitoring if needed',
        ],
      },
    ],
    riskAnalysis: {
      overallRiskScore: 7.2, // 0-10 scale
      brainHealthStatus: 'At Risk',
      regionalHeatmap: [
        { region: 'Frontal Lobe', severity: 8, riskLevel: 'High' },
        { region: 'Temporal Lobe', severity: 6, riskLevel: 'Medium' },
        { region: 'Parietal Lobe', severity: 7, riskLevel: 'High' },
        { region: 'Occipital Lobe', severity: 2, riskLevel: 'Low' },
        { region: 'Cerebellum', severity: 3, riskLevel: 'Low' },
      ],
      riskTimeline: [
        { month: 0, riskScore: 7.2, status: 'Current' },
        { month: 3, riskScore: 7.5, status: 'Projected' },
        { month: 6, riskScore: 7.8, status: 'Projected' },
        { month: 12, riskScore: 8.2, status: 'Projected' },
      ],
      riskFactors: {
        'Microbleed Count': 2,
        'Tumor Presence': 1,
        'Edema Severity': 'Medium',
        'Vascular Changes': 'Significant',
        'Age Factor': 'High Risk Group',
      },
    },
    modelMetrics: {
      processingTime: 2.3, // seconds
      modelVersion: 'Mamba 2.0',
      accuracy: 0.94,
      vramUsed: 2.1, // GB
      vramAvailable: 8.0, // GB
    },
  }
}

export const getMockDiseaseInfo = (diseaseId) => {
  const diseaseDatabase = {
    'microbleed-1': {
      fullDescription:
        'Microbleeds are small areas of bleeding within the brain. They are often associated with cerebral amyloid angiopathy or hypertension.',
      treatments: ['Blood pressure control', 'Antiplatelet therapy if needed'],
      monitoring: 'Regular MRI follow-ups every 3-6 months',
    },
    'tumor-1': {
      fullDescription:
        'A brain tumor is an abnormal growth of cells in the brain. This could be primary (originated in brain) or secondary (metastatic).',
      treatments: [
        'Surgical resection',
        'Chemotherapy',
        'Radiation therapy',
        'Targeted therapy',
      ],
      monitoring: 'Monthly MRI monitoring post-treatment',
    },
  }
  return diseaseDatabase[diseaseId] || null
}
