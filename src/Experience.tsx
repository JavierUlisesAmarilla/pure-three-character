import {AxesHelper, Scene} from 'three'
import {Camera} from './Camera'
import {Environment} from './Environment'
import {Light} from './Light'
import {Renderer} from './Renderer'
import {Loaders} from './Utils/Loaders'
import {RapierPhysics} from './Utils/RapierPhysics'
import {Size} from './Utils/Size'
import {Time} from './Utils/Time'
import {World} from './World/World'
import {AXES_LENGTH, IS_DEV_MODE, assetArr} from './constants'

let instance: Experience

export class Experience {
  canvas?: HTMLCanvasElement
  loaders
  size?: Size
  time?: Time
  scene?: Scene
  camera?: Camera
  light?: Light
  renderer?: Renderer
  environment?: Environment
  rapierPhysics?: RapierPhysics
  world?: World

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
    this.loaders.on('ready', () => {
      this.size = new Size()
      this.time = new Time()
      this.scene = new Scene()
      this.camera = new Camera()
      this.light = new Light()
      this.renderer = new Renderer()
      this.environment = new Environment()
      this.rapierPhysics = new RapierPhysics(this.scene)
      this.world = new World()
      if (IS_DEV_MODE) {
        this.scene.add(new AxesHelper(AXES_LENGTH))
      }
      this.size.on('resize', () => {
        this.resize()
      })
      this.time.on('tick', () => {
        this.update()
      })
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
    if (this.renderer) {
      this.renderer.update()
    }
    if (this.rapierPhysics) {
      this.rapierPhysics.update(IS_DEV_MODE)
    }
    if (this.world) {
      this.world.update()
    }
  }
}
