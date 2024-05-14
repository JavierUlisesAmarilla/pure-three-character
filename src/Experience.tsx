import {AxesHelper, Scene} from 'three'
import {Camera} from './Camera'
import {Light} from './Light'
import {Renderer} from './Renderer'
import {Loaders} from './Utils/Loaders'
import {Size} from './Utils/Size'
import {Time} from './Utils/Time'
import {World} from './World/World'
import {AXES_LENGTH, assetArr} from './constants'

let instance: Experience

export class Experience {
  canvas!: HTMLCanvasElement
  loaders
  size
  time
  scene
  camera
  light
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
    this.loaders = new Loaders(assetArr)
    this.size = new Size()
    this.time = new Time()
    this.scene = new Scene()
    this.camera = new Camera()
    this.light = new Light()
    this.renderer = new Renderer()
    this.world = new World()
    this.scene.add(new AxesHelper(AXES_LENGTH))
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
