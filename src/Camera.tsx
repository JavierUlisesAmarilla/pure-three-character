import {PerspectiveCamera} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Experience} from './Experience'

export class Camera {
  instance!: PerspectiveCamera
  experience
  size
  scene
  canvas
  controls!: OrbitControls

  constructor() {
    this.experience = new Experience()
    this.size = this.experience.size
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.setInstance()
    this.setControls()
  }

  setInstance() {
    if (!this.size || !this.scene) {
      return
    }
    this.instance = new PerspectiveCamera(
        75,
        this.size.width / this.size.height,
        0.1,
        2000,
    )

    if (this.size.width <= 550) {
      this.instance.position.set(8, 3.5, 8)
    } else if (this.size.width <= 1024) {
      this.instance.position.set(7, 3.5, 6.5)
    } else {
      this.instance.position.set(5.9, 3.5, 4.45)
    }

    this.scene.add(this.instance)
  }

  setControls() {
    if (!this.canvas) {
      return
    }
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.target.set(0.2, 1.8, -1.4)
    this.controls.enableZoom = false
    this.controls.maxAzimuthAngle = Math.PI * 0.4
    this.controls.minAzimuthAngle = Math.PI * 0.1
    this.controls.maxPolarAngle = Math.PI * 0.45
    this.controls.minPolarAngle = Math.PI * 0.3
  }

  resize() {
    if (!this.size) {
      return
    }

    if (this.size.width <= 550) {
      this.instance.position.set(8, 3.5, 8)
    } else if (this.size.width <= 1024) {
      this.instance.position.set(7, 3.5, 6.5)
    } else {
      this.instance.position.set(5.9, 3.5, 4.45)
    }

    this.instance.aspect = this.size.width / this.size.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
