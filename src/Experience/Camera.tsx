import {Euler, Object3D, PerspectiveCamera, Vector3} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import {
  BACK_DIRECTION_VEC3,
  CAMERA_OFFSET,
  FRONT_DIRECTION_VEC3,
  IS_ORBIT_CONTROLS_USED,
  LEFT_DIRECTION_VEC3,
  RIGHT_DIRECTION_VEC3,
  Y_VEC3,
} from '../utils/constants'
import {Experience} from './Experience'

const rotSpeed = 0.006
const limitRotXFactor = 0.1
const centerVec3 = new Vector3()
const dummyVec3 = new Vector3()

export class Camera {
  instance?: PerspectiveCamera
  canvas
  size
  scene
  model
  rootBone?: Object3D
  cameraRotX
  cameraRotY
  controls?: OrbitControls

  constructor() {
    const experience = new Experience()
    this.canvas = experience.canvas
    this.size = experience.size
    this.scene = experience.scene
    this.model = experience.world?.character.model
    if (this.model?.userData.rootBoneName) {
      this.rootBone = this.model.getObjectByName(
          this.model.userData.rootBoneName,
      )
    }
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
    if (this.canvas && !IS_ORBIT_CONTROLS_USED) {
      this.canvas.addEventListener('mousedown', () => {
        document.body.requestPointerLock()
      })

      document.addEventListener('mousemove', (event) => {
        if (
          document.pointerLockElement === document.body &&
          this.instance &&
          this.model
        ) {
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
    if (!IS_ORBIT_CONTROLS_USED && this.instance && this.model) {
      if (this.rootBone) {
        this.rootBone.getWorldPosition(centerVec3)
        this.instance.position.copy(centerVec3)
      } else {
        this.model.getWorldPosition(centerVec3)
        this.instance.position.copy(centerVec3)
      }

      this.instance.quaternion.setFromEuler(
          new Euler(this.cameraRotX, this.cameraRotY, 0, 'ZYX'),
      )
      this.instance.position.add(
          dummyVec3.copy(CAMERA_OFFSET).applyQuaternion(this.instance.quaternion),
      )

      const frontDirectionVec3 = centerVec3
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
