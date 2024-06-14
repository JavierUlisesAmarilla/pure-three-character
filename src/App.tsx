import {useEffect, useRef} from 'react'

import {Experience} from './Experience/Experience'

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loadingContainerRef = useRef<HTMLDivElement>(null)
  const loadingBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      canvasRef.current &&
      loadingContainerRef.current &&
      loadingBarRef.current
    ) {
      new Experience({
        canvas: canvasRef.current,
        loadingContainerDiv: loadingContainerRef.current,
        loadingBarDiv: loadingBarRef.current,
      })
    }
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <canvas ref={canvasRef} className="fixed top-0 left-0 outline-none"/>
      <div ref={loadingContainerRef} className="absolute h-full w-full">
        <img
          src="/me.jpg"
          className="absolute top-0 left-1/2 h-full -translate-x-1/2"
          alt=""
        />
        <div className="absolute left-1/4 bottom-4 h-1 w-1/2 cursor-wait rounded-full bg-white">
          <div
            ref={loadingBarRef}
            className="h-full w-full origin-top-left scale-0 rounded-full bg-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
