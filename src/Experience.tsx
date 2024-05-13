import {Scene} from 'three'
import {Camera} from './Camera'
import {Renderer} from './Renderer'
import {Loaders} from './Utils/Loaders'
import {Size} from './Utils/Size'
import {Time} from './Utils/Time'
import {World} from './World/World'
import {assetArr} from './constants'

let instance: Experience

export class Experience {
  canvas!: HTMLCanvasElement
  size
  time
  scene
  loaders
  camera
  renderer
  world

  constructor(canvas: HTMLCanvasElement | undefined = undefined) {
    if (instance) {
      return instance
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- TODO
    instance = this
    if (canvas) {
      this.canvas = canvas
    }
    this.size = new Size()
    this.time = new Time()
    this.scene = new Scene()
    this.loaders = new Loaders(assetArr)
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()
    this.size.on('resize', () => {
      this.resize()
    })
    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    if (this.camera) {
      this.camera.resize()
    }
    if (this.renderer) {
      this.renderer.resize()
    }
  }

  update() {
    if (this.camera) {
      this.camera.update()
    }
    if (this.world) {
      this.world.update()
    }
    if (this.renderer) {
      this.renderer.update()
    }
  }
}
