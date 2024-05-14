import {PerspectiveCamera} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Experience} from './Experience'

export class Camera {
  instance!: PerspectiveCamera
  size
  scene
  canvas
  controls!: OrbitControls

  constructor() {
    const experience = new Experience()
    this.size = experience.size
    this.scene = experience.scene
    this.canvas = experience.canvas
    this.initInstance()
    this.initControls()
  }

  initInstance() {
    if (!this.size || !this.scene) {
      return
    }
    this.instance = new PerspectiveCamera(
        75,
        this.size.width / this.size.height,
        0.1,
        2000,
    )
    this.instance.position.set(3, 3, 3)
    this.scene.add(this.instance)
  }

  initControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
  }

  resize() {
    if (!this.size) {
      return
    }
    this.instance.aspect = this.size.width / this.size.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
