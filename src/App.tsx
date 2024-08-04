import {useEffect, useRef, useState} from 'react'

import {Progress} from './components/Progress'
import {Experience} from './Experience/Experience'

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [hideLoader, setHideLoader] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      new Experience({
        canvas: canvasRef.current,
        onProgress: setProgress,
      })
    }
  }, [])

  // useEffect(() => {
  //   if (progress >= 1) {
  //     setHideLoader(true)
  //   }
  // }, [progress])

  return (
    <div className="fixed h-screen w-screen font-[Cascade] text-white">
      <canvas ref={canvasRef} className="fixed top-0 left-0 outline-none"/>
      {!hideLoader && (
        <div className="absolute flex h-full w-full flex-col items-center gap-8 overflow-auto bg-gradient-to-br from-purple-500 to-indigo-500 p-12 lg:flex-row lg:items-start">
          <div className="flex flex-col items-center gap-8">
            <img src="/me.jpg" className="w-full rounded-xl shadow-xl" alt=""/>
          </div>
          <div className="flex flex-col gap-8 text-xl">
            <div>
              Three.js and other WebGL technology expert with a strong passion
              for performance optimization and post-processing effects.
            </div>
            <div>
              Even for high complex projects, I always make sure that technology
              does not prevent them from looking awesome.
            </div>
            <div>
              I pay attention to your vision sincerely and implement it with
              efficiency and speed.
            </div>
            <div>
              My experience can be useful to guarantee that your project will be
              unique and have a lasting impact on your users.
            </div>
            {progress < 1 ? (
              <Progress progress={progress}/>
            ) : (
              <div
                className="relative w-fit cursor-pointer rounded bg-indigo-500 px-3 py-1"
                onClick={() => setHideLoader(true)}
              >
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"/>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"/>
                </span>
                <div>Projects</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
