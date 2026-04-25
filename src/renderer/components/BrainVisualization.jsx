import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const BrainVisualization = ({ diseases = [], selectedDisease = null }) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const brainRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0e27)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0, 120)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    )
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 100, 100)
    scene.add(directionalLight)

    // Create brain geometry (hemisphere)
    const brainGeometry = new THREE.IcosahedronGeometry(80, 5)
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a5578,
      emissive: 0x2a3558,
      shininess: 30,
      wireframe: false,
    })
    const brain = new THREE.Mesh(brainGeometry, brainMaterial)
    brain.castShadow = true
    brain.receiveShadow = true
    scene.add(brain)
    brainRef.current = brain

    // Add disease markers
    const createMarker = (disease, type) => {
      const { location } = disease
      const isSelected = selectedDisease?.id === disease.id

      let color
      let size

      if (type === 'detected') {
        color =
          disease.severity === 'high'
            ? 0xff4444
            : disease.severity === 'medium'
              ? 0xff8800
              : 0xffaa00
        size = disease.severity === 'high' ? 8 : 6
      } else {
        color = 0xffff00
        size = isSelected ? 10 : 6
      }

      const markerGeometry = new THREE.SphereGeometry(size, 32, 32)
      const markerMaterial = new THREE.MeshBasicMaterial({ color })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)

      marker.position.set(location.x, location.y, location.z)
      marker.userData = { disease, type }

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(size * 1.5, 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(marker.position)
      scene.add(glow)

      scene.add(marker)
      return marker
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => scene.remove(marker))
    markersRef.current = []

    // Add all disease markers
    diseases.forEach((disease) => {
      if (disease.type === 'detected') {
        const marker = createMarker(disease, 'detected')
        markersRef.current.push(marker)
      }
    })

    diseases.forEach((disease) => {
      if (disease.type === 'predicted') {
        const marker = createMarker(disease, 'predicted')
        markersRef.current.push(marker)
      }
    })

    // Mouse interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(markersRef.current)

      if (intersects.length > 0) {
        const clicked = intersects[0].object
        console.log('[v0] Disease clicked:', clicked.userData.disease)
      }
    }

    renderer.domElement.addEventListener('click', onMouseClick)

    // Orbit controls simulation
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    })

    renderer.domElement.addEventListener('mousemove', (e) => {
      if (isDragging && brainRef.current) {
        const deltaX = e.clientX - previousMousePosition.x
        const deltaY = e.clientY - previousMousePosition.y

        brainRef.current.rotation.y += deltaX * 0.01
        brainRef.current.rotation.x += deltaY * 0.01
      }
      previousMousePosition = { x: e.clientX, y: e.clientY }
    })

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false
    })

    // Mouse wheel zoom
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault()
      camera.position.z += e.deltaY * 0.1
      camera.position.z = Math.max(50, Math.min(200, camera.position.z))
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Auto-rotate brain slightly
      if (!isDragging && brainRef.current) {
        brainRef.current.rotation.y += 0.0005
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', onMouseClick)
      renderer.domElement.removeEventListener('mousedown', (e) => {})
      renderer.domElement.removeEventListener('mousemove', (e) => {})
      renderer.domElement.removeEventListener('mouseup', () => {})
      renderer.domElement.removeEventListener('wheel', (e) => {})
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [diseases, selectedDisease])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0a0e27',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 10,
        }}
      >
        <div>Drag to rotate • Scroll to zoom</div>
        <div style={{ marginTop: '4px' }}>
          <span style={{ color: '#ff4444' }}>● Detected</span>
          <span style={{ marginLeft: '12px', color: '#ffff00' }}>● Predicted</span>
        </div>
      </div>
    </div>
  )
}

export default BrainVisualization
