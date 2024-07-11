import {useEffect, useRef, useState} from 'react'

import {Progress} from './components/Progress'
import {Experience} from './Experience/Experience'

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (canvasRef.current) {
      new Experience({
        canvas: canvasRef.current,
        onProgress: setProgress,
      })
    }
  }, [])

  return (
    <div className="fixed h-screen w-screen font-[Cascade] text-white">
      <canvas ref={canvasRef} className="fixed top-0 left-0 outline-none"/>
      {progress < 1 && (
        <div className="absolute h-full w-full items-center bg-gradient-to-br from-purple-500 to-indigo-500">
          <div className="absolute bottom-4 w-full p-12">
            <Progress progress={progress}/>
          </div>
        </div>
      )}
    </div>
  )
}
