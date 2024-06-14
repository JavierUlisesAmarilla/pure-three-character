import {CineonToneMapping, WebGLRenderer} from 'three'

import {Experience} from './Experience'

export class Renderer {
  canvas
  size
  scene
  camera
  instance?: WebGLRenderer

  constructor() {
    const experience = new Experience()
    this.canvas = experience.canvas
    this.size = experience.size
    this.scene = experience.scene
    this.camera = experience.camera
    this.setInstance()
  }

  setInstance() {
    if (!this.size) {
      return
    }
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.instance.toneMapping = CineonToneMapping
    this.instance.setSize(this.size.width, this.size.height)
    this.instance.setPixelRatio(Math.min(this.size.pixelRatio, 2))
  }

  resize() {
    if (!this.size || !this.instance) {
      return
    }
    this.instance.setSize(this.size.width, this.size.height)
    this.instance.setPixelRatio(Math.min(this.size.pixelRatio, 2))
  }

  update() {
    if (!this.scene || !this.camera?.instance || !this.instance) {
      return
    }
    this.instance.render(this.scene, this.camera.instance)
  }
}
