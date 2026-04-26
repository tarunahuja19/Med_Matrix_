/**
 * API Client Service
 * This file is a wrapper for making requests to the backend API.
 * Currently uses mock API, but can be easily switched to real backend.
 */

import { analyzeMRIFile as mockAnalyzeMRIFile } from './mockApi'

// Configuration
const API_CONFIG = {
  USE_MOCK_API: true, // Set to false when backend is ready
  API_URL: 'http://localhost:8000/api', // Your backend URL
}

/**
 * Analyze an MRI file
 * @param {string} fileName - Name of the file
 * @param {number} fileSize - Size of the file in bytes
 * @returns {Promise<object>} Analysis result
 */
export const analyzeMRIFile = async (fileName, fileSize) => {
  if (API_CONFIG.USE_MOCK_API) {
    // Use mock API for development/demo
    return mockAnalyzeMRIFile(fileName, fileSize)
  }

  // Real API call (when backend is ready)
  try {
    const response = await fetch(`${API_CONFIG.API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileSize,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[v0] API error:', error)
    throw new Error('Failed to analyze file')
  }
}

/**
 * Get analysis history
 * @returns {Promise<array>} List of previous analyses
 */
export const getAnalysisHistory = async () => {
  if (API_CONFIG.USE_MOCK_API) {
    return []
  }

  try {
    const response = await fetch(`${API_CONFIG.API_URL}/history`)
    if (!response.ok) throw new Error('Failed to fetch history')
    return await response.json()
  } catch (error) {
    console.error('[v0] Error fetching history:', error)
    return []
  }
}

/**
 * Export analysis report
 * @param {string} analysisId - ID of the analysis
 * @param {string} format - Export format (pdf, json, png)
 * @returns {Promise<blob>} Exported file
 */
export const exportReport = async (analysisId, format = 'pdf') => {
  if (API_CONFIG.USE_MOCK_API) {
    console.log('[v0] Report export would be ready in production')
    return null
  }

  try {
    const response = await fetch(
      `${API_CONFIG.API_URL}/export/${analysisId}?format=${format}`
    )
    if (!response.ok) throw new Error('Failed to export report')
    return await response.blob()
  } catch (error) {
    console.error('[v0] Error exporting report:', error)
    throw error
  }
}

/**
 * Toggle between mock and real API
 * @param {boolean} useMock - Whether to use mock API
 */
export const setMockMode = (useMock) => {
  API_CONFIG.USE_MOCK_API = useMock
  console.log('[v0] API mode switched to:', useMock ? 'MOCK' : 'PRODUCTION')
}

/**
 * Set backend URL
 * @param {string} url - Backend API URL
 */
export const setApiUrl = (url) => {
  API_CONFIG.API_URL = url
  console.log('[v0] API URL set to:', url)
}
