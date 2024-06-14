import {
  Euler,
  Intersection,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import {getChildMeshArr} from './common'
import {
  BACK_DIRECTION_VEC3,
  CAMERA_OFFSET,
  FRONT_DIRECTION_VEC3,
  IS_ORBIT_CONTROLS_USED,
  LEFT_DIRECTION_VEC3,
  RIGHT_DIRECTION_VEC3,
  Y_VEC3,
} from './constants'
import {Experience} from './Experience'

const limitMovement = 30
const limitRotXFactor = 0.1
const localVec3 = new Vector3()
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO
const zeroVec2 = new Vector2()

export class Camera {
  instance?: PerspectiveCamera
  canvas
  size
  scene
  characterRb
  cameraRotX
  cameraRotY
  raycaster: Raycaster
  raycasterMeshArr?: Object3D[]
  controls?: OrbitControls

  constructor() {
    const experience = new Experience()
    this.canvas = experience.canvas
    this.size = experience.size
    this.scene = experience.scene
    this.characterRb = experience.world?.character.rb
    this.cameraRotX = 0
    this.cameraRotY = 0
    this.raycaster = new Raycaster()
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
    this.raycasterMeshArr = getChildMeshArr(this.scene)
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
          const rotYOffset = -movementX * Math.PI * 0.0005
          const rotXOffset = -movementY * Math.PI * 0.0005
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO
  computeCameraOffset(intersectArr: Intersection[]) {
    //
  }

  update() {
    if (
      !IS_ORBIT_CONTROLS_USED &&
      this.instance &&
      this.characterRb &&
      this.raycaster &&
      this.raycasterMeshArr
    ) {
      // this.raycaster.setFromCamera(zeroVec2, this.instance)
      // const intersectArr = this.raycaster.intersectObjects(
      //     this.raycasterMeshArr, false,
      // )
      // this.computeCameraOffset(intersectArr)
      const characterRbTranslation = this.characterRb.translation()
      const characterRbPos = new Vector3(
          characterRbTranslation.x,
          characterRbTranslation.y,
          characterRbTranslation.z,
      )
      this.instance.position.copy(characterRbPos)
      this.instance.quaternion.setFromEuler(
          new Euler(this.cameraRotX, this.cameraRotY, 0, 'ZYX'),
      )
      this.instance.position.add(
          localVec3.copy(CAMERA_OFFSET).applyQuaternion(this.instance.quaternion),
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
