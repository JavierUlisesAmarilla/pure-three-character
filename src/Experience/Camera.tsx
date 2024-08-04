import {Euler, PerspectiveCamera, Vector3} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import {
  CAMERA_OFFSET,
  FRONT_DIRECTION_VEC3,
  IS_ORBIT_CONTROLS_USED,
} from '../utils/constants'
import {Experience} from './Experience'

const rotSpeed = 0.006
const limitRotXFactor = 0.2
const dummyVec3 = new Vector3()
const dummyEuler = new Euler(0, 0, 0, 'ZYX')

export class Camera {
  instance?: PerspectiveCamera
  canvas
  size
  scene
  character
  cameraRotX
  cameraRotY
  controls?: OrbitControls

  constructor() {
    const experience = new Experience()
    this.canvas = experience.canvas
    this.size = experience.size
    this.scene = experience.scene
    this.character = experience.world?.character.root
    this.cameraRotX = 0
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
    this.instance.position.copy(CAMERA_OFFSET)
    this.scene.add(this.instance)
  }

  initControls() {
    if (this.instance && IS_ORBIT_CONTROLS_USED) {
      this.controls = new OrbitControls(this.instance, this.canvas)
    }
  }

  initEvents() {
    if (this.canvas && !IS_ORBIT_CONTROLS_USED) {
      this.canvas.addEventListener('mousedown', () => {
        document.body.requestPointerLock()
      })

      document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body && this.instance) {
          let {movementX, movementY} = event
          if (movementX > 0) {
            movementX = Math.log(movementX)
          }
          if (movementX < 0) {
            movementX = -Math.log(-movementX)
          }
          if (movementY > 0) {
            movementY = Math.log(movementY)
          }
          if (movementY < 0) {
            movementY = -Math.log(-movementY)
          }
          const rotYOffset = -movementX * Math.PI * rotSpeed
          const rotXOffset = -movementY * Math.PI * rotSpeed
          this.cameraRotY += rotYOffset
          const newRotX = this.cameraRotX + rotXOffset
          if (
            newRotX > -Math.PI * limitRotXFactor &&
            newRotX < Math.PI * limitRotXFactor
          ) {
            this.cameraRotX = newRotX
          }
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
    if (!IS_ORBIT_CONTROLS_USED && this.instance && this.character) {
      this.character.getWorldPosition(this.instance.position)
      this.instance.quaternion.setFromEuler(
          dummyEuler.set(this.cameraRotX, this.cameraRotY, 0),
      )
      this.instance.position.add(
          dummyVec3.copy(CAMERA_OFFSET).applyQuaternion(this.instance.quaternion),
      )
      FRONT_DIRECTION_VEC3.copy(dummyVec3.setY(0).negate().normalize())
    }
  }
}
