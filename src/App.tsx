import {useEffect} from 'react'

import {Experience} from './Experience/Experience'

export const App = () => {
  useEffect(() => {
    console.log('test:', document.querySelector('.three-canvas'))
    new Experience(
      document.querySelector('.three-canvas') as HTMLCanvasElement,
    )
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <canvas className="three-canvas fixed top-0 left-0 outline-none"/>
      <div className="loading-container">
        <img src="/me.jpg" className="loading-logo" alt=""/>
        <div className="loading-bar-container">
          <div className="loading-bar"/>
        </div>
      </div>
    </div>
  )
}
