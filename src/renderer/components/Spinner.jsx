import React from 'react'
import '../styles/spinner.css'

export function Spinner({ message = 'Processing...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="spinner-message">{message}</p>
    </div>
  )
}
