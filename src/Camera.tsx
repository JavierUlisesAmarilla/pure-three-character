import {PerspectiveCamera} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Experience} from './Experience'
import {IS_ORBIT_CONTROLS_USED} from './constants'

const limitMovement = 200

export class Camera {
  instance?: PerspectiveCamera
  canvas
  size
  scene
  characterRb
  cameraRotY
  controls?: OrbitControls

  constructor() {
    const experience = new Experience()
    this.canvas = experience.canvas
    this.size = experience.size
    this.scene = experience.scene
    this.characterRb = experience.world?.character.rb
    this.cameraRotY = 0
    this.initInstance()
    this.initControls()
    this.initEvents()
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
    this.instance.position.set(0, 2, -3)
    this.instance.rotation.set(0, Math.PI, 0)
    this.scene.add(this.instance)
  }

  initControls() {
    if (this.instance && IS_ORBIT_CONTROLS_USED) {
      this.controls = new OrbitControls(this.instance, this.canvas)
    }
  }

  initEvents() {
    if (!IS_ORBIT_CONTROLS_USED) {
      document.addEventListener('mousedown', () => {
        document.body.requestPointerLock()
      })

      document.addEventListener('mousemove', (event) => {
        if (
          document.pointerLockElement === document.body &&
          this.instance &&
          this.characterRb
        ) {
          let {movementX} = event
          if (movementX > limitMovement) {
            movementX = limitMovement
          }
          if (movementX < -limitMovement) {
            movementX = -limitMovement
          }
          this.cameraRotY -= movementX * Math.PI * 0.0001
        }
      })
    }
  }

  resize() {
    if (!this.size || !this.instance) {
      return
    }
    this.instance.aspect = this.size.width / this.size.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    // TODO
  }
}
