import {Euler, PerspectiveCamera, Vector3} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Experience} from './Experience'
import {
  BACK_DIRECTION_VEC3,
  CAMERA_OFFSET,
  FRONT_DIRECTION_VEC3,
  IS_ORBIT_CONTROLS_USED,
  LEFT_DIRECTION_VEC3,
  LERP_ALPHA,
  RIGHT_DIRECTION_VEC3,
  Y_VEC3,
} from './constants'

const limitMovement = 300
const limitRotXFactor = 0.2
const localVec3 = new Vector3()

export class Camera {
  instance?: PerspectiveCamera
  canvas
  size
  scene
  characterRb
  cameraRotX
  cameraRotY
  controls?: OrbitControls

  constructor() {
    const experience = new Experience()
    this.canvas = experience.canvas
    this.size = experience.size
    this.scene = experience.scene
    this.characterRb = experience.world?.character.rb
    this.cameraRotX = 0
    this.cameraRotY = Math.PI
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
          let {movementX, movementY} = event
          if (movementX > limitMovement) {
            movementX = limitMovement
          }
          if (movementX < -limitMovement) {
            movementX = -limitMovement
          }
          if (movementY > limitMovement) {
            movementY = limitMovement
          }
          if (movementY < -limitMovement) {
            movementY = -limitMovement
          }
          const rotYOffset = -movementX * Math.PI * 0.0001
          const rotXOffset = -movementY * Math.PI * 0.00005
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
    if (!IS_ORBIT_CONTROLS_USED && this.instance && this.characterRb) {
      const characterRbTranslation = this.characterRb.translation()
      const characterRbPos = new Vector3(
          characterRbTranslation.x,
          characterRbTranslation.y,
          characterRbTranslation.z,
      )
      this.instance.position.lerp(characterRbPos, LERP_ALPHA)
      this.instance.quaternion.setFromEuler(
          new Euler(this.cameraRotX, this.cameraRotY, 0, 'ZYX'),
      )
      this.instance.position.add(
          localVec3
              .copy(CAMERA_OFFSET.clone().multiplyScalar(LERP_ALPHA))
              .applyQuaternion(this.instance.quaternion),
      )

      const frontDirectionVec3 = characterRbPos
          .sub(this.instance.position)
          .setY(0)
          .normalize()
      const backDirectionVec3 = frontDirectionVec3.clone().negate()
      const leftDirectionVec3 = frontDirectionVec3
          .clone()
          .applyAxisAngle(Y_VEC3, Math.PI / 2)
      const rightDirectionVec3 = leftDirectionVec3.clone().negate()
      FRONT_DIRECTION_VEC3.copy(frontDirectionVec3)
      BACK_DIRECTION_VEC3.copy(backDirectionVec3)
      LEFT_DIRECTION_VEC3.copy(leftDirectionVec3)
      RIGHT_DIRECTION_VEC3.copy(rightDirectionVec3)
    }
  }
}
