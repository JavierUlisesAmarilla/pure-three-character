import {useEffect, useRef} from 'react'

import {Progress} from './components/Progress'
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
        // loadingContainerDiv: loadingContainerRef.current,
        loadingBarDiv: loadingBarRef.current,
      })
    }
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <canvas ref={canvasRef} className="fixed top-0 left-0 outline-none"/>
      <div
        ref={loadingContainerRef}
        className="absolute flex h-full w-full bg-gradient-to-br from-purple-500 to-indigo-500 p-4"
      >
        <div>
          <img src="/me.jpg" className="w-60 rounded-xl" alt=""/>
        </div>
        <Progress
          progressBarRef={loadingBarRef}
          className="absolute left-1/4 bottom-4 w-1/2 cursor-wait"
        />
      </div>
    </div>
  )
}
