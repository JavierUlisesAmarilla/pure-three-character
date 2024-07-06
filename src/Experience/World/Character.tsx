import RAPIER from '@dimforge/rapier3d-compat'
import {
  AnimationAction,
  AnimationMixer,
  CapsuleGeometry,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from 'three'

import {
  BACK_DIRECTION_VEC3,
  FRONT_DIRECTION_VEC3,
  LEFT_DIRECTION_VEC3,
  RIGHT_DIRECTION_VEC3,
  Y_VEC3,
} from '../../utils/constants'
import {Experience} from '../Experience'
import AnimController from '../Utils/AnimController'

export class Character {
  scene
  time
  keyboard
  rapierPhysics
  model: Group
  animModelArr: Group[]
  animMixer: AnimationMixer
  rb?: RAPIER.RigidBody
  animController?: AnimController
  direction
  isJumping
  dummy
  moveState!: string
  walkSpeed

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.keyboard = experience.keyboard
    this.rapierPhysics = experience.rapierPhysics
    const items = experience.loaders?.items
    this.model = items?.masculineTPoseModel
    this.model.scale.multiplyScalar(0.01)
    this.animModelArr = [
      items?.fStandingIdle001Model,
      items?.fWalk002Model,
      items?.fWalkJump002Model,
      items?.mJog001Model,
      items?.mJogJump001Model,
    ]
    this.animMixer = new AnimationMixer(this.model)
    this.direction = new Vector3()
    this.isJumping = false
    this.dummy = new Object3D()
    this.walkSpeed = 0.05
    this.initModel()
    this.initAnim()
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    const object3d = new Object3D()
    object3d.add(this.model)
    const capsuleMesh = new Mesh(new CapsuleGeometry(0.5, 1))
    capsuleMesh.position.y = 1
    capsuleMesh.visible = false
    capsuleMesh.name = 'character'
    object3d.add(capsuleMesh)
    this.model.rotation.set(0, Math.PI, 0)
    this.rb = this.rapierPhysics.createCapsulesRigidBody({
      object3d,
      capsuleInfoArr: [{halfHeight: 0.5, radius: 0.5, position: [0, 1, 0]}],
      enabledRotations: [false, true, false],
    })
  }

  initAnim() {
    if (!this.animMixer) {
      return
    }
    const animActions: { [key: string]: AnimationAction } = {}
    this.animModelArr.forEach((animModel) => {
      const anim = animModel.animations[0]
      animActions[anim.name] = this.animMixer.clipAction(anim)
    })
    console.log('test: animActions:', animActions)
    this.animController = new AnimController(this.animMixer, animActions)
    this.updateAnim('F_Standing_Idle_001')
  }

  setDirection = (speed: number) => {
    if (!this.keyboard) {
      return
    }
    this.direction.set(0, 0, 0)
    if (this.keyboard.isFront) {
      this.direction.add(FRONT_DIRECTION_VEC3.clone().multiplyScalar(speed))
    }
    if (this.keyboard.isLeft) {
      this.direction.add(LEFT_DIRECTION_VEC3.clone().multiplyScalar(speed))
    }
    if (this.keyboard.isBack) {
      this.direction.add(BACK_DIRECTION_VEC3.clone().multiplyScalar(speed))
    }
    if (this.keyboard.isRight) {
      this.direction.add(RIGHT_DIRECTION_VEC3.clone().multiplyScalar(speed))
    }
  }

  updateAnim(animName: string) {
    if (this.moveState !== animName && this.animController) {
      this.moveState = animName
      this.animController.playNewActionOnly(animName)
    }
  }

  update() {
    if (!this.time || !this.animMixer) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)
    if (!this.keyboard || !this.rb) {
      return
    }
    const {isFront, isLeft, isBack, isRight, isFast, isJump} = this.keyboard

    const rbTranslation = this.rb.translation()
    const rbPos = new Vector3(
        rbTranslation.x,
        rbTranslation.y,
        rbTranslation.z,
    )
    this.dummy.position.copy(rbPos)

    if (isJump && !this.isJumping) {
      this.isJumping = true
      this.updateAnim('Jump')
      this.rb.applyImpulse(Y_VEC3.clone().multiplyScalar(15), true)

      setTimeout(() => {
        this.isJumping = false
        this.updateAnim('Idle')
      }, 1000)
    }

    if (
      (isFront || isBack || isLeft || isRight) &&
      (isFront !== isBack || isLeft !== isRight)
    ) {
      if (isFast) {
        this.setDirection(this.walkSpeed * 3)
        if (!this.isJumping) {
          this.updateAnim('Run')
        }
      } else {
        this.setDirection(this.walkSpeed)
        if (!this.isJumping) {
          this.updateAnim('Walk')
        }
      }

      const nextRbPos = rbPos.clone().add(this.direction)
      this.rb.setTranslation(nextRbPos, true)
      this.dummy.lookAt(rbPos.clone().sub(this.direction))
    } else if (!this.isJumping) {
      this.updateAnim('Idle')
    }

    this.rb.setRotation(this.dummy.quaternion, true)
  }
}
