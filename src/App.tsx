import {useEffect, useRef} from 'react'

import {Experience} from './Experience/Experience'

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      new Experience({canvas: canvasRef.current})
    }
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <canvas ref={canvasRef} className="fixed top-0 left-0 outline-none"/>
      <div className="loading-container">
        <img src="/me.jpg" className="loading-logo" alt=""/>
        <div className="loading-bar-container">
          <div className="loading-bar"/>
        </div>
      </div>
    </div>
  )
}
