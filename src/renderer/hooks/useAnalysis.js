import { useState, useCallback } from 'react'
import { analyzeKSpaceFile } from '../services/mockApi'

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [highlightedRegions, setHighlightedRegions] = useState([])

  const analyzeFile = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await analyzeKSpaceFile(file)
      setAnalysisResult(result)
      setSelectedDisease(null)
      setHighlightedRegions([])
      return result
    } catch (err) {
      setError(err.message || 'Analysis failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const selectDisease = useCallback((disease) => {
    setSelectedDisease(disease)
    if (disease && disease.locations) {
      setHighlightedRegions(disease.locations)
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null)
    setSelectedDisease(null)
    setHighlightedRegions([])
    setError(null)
  }, [])

  return {
    loading,
    error,
    analysisResult,
    selectedDisease,
    highlightedRegions,
    analyzeFile,
    selectDisease,
    clearAnalysis,
  }
}
