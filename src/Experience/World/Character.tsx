import RAPIER from '@dimforge/rapier3d-compat'
import {
  AnimationClip,
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
} from '../../utils/constants'
import {Experience} from '../Experience'
import OffsetAnimController from '../Utils/OffsetAnimController'

const modelScale = 0.01

export class Character {
  scene
  time
  keyboard
  rapierPhysics
  model: Group
  animModelArr: Group[]
  animMixer: AnimationMixer
  rb?: RAPIER.RigidBody
  animController?: OffsetAnimController
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
    this.model.scale.multiplyScalar(modelScale)
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
    const clipArr: AnimationClip[] = []
    this.animModelArr.forEach((animModel) => {
      clipArr.push(animModel.animations[0])
    })
    this.animController = new OffsetAnimController({
      mixer: this.animMixer,
      clipArr,
      modelScale: modelScale,
      rootBoneName: 'Hips',
      rootBonePositionTrackName: 'Hips.position',
    })
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
      this.animController.playNewAction(animName)
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
      if (isFast) {
        this.updateAnim('M_Jog_Jump_001')
      } else {
        this.updateAnim('F_Walk_Jump_002')
      }
      // this.rb.applyImpulse(Y_VEC3.clone().multiplyScalar(15), true)

      setTimeout(() => {
        this.isJumping = false
        this.updateAnim('F_Standing_Idle_001')
      }, 3000)
    }

    if (
      (isFront || isBack || isLeft || isRight) &&
      (isFront !== isBack || isLeft !== isRight)
    ) {
      if (isFast) {
        this.setDirection(this.walkSpeed * 3)
        if (!this.isJumping) {
          this.updateAnim('M_Jog_001')
        }
      } else {
        this.setDirection(this.walkSpeed)
        if (!this.isJumping) {
          this.updateAnim('F_Walk_002')
        }
      }

      // const nextRbPos = rbPos.clone().add(this.direction)
      // this.rb.setTranslation(nextRbPos, true)
      this.dummy.lookAt(rbPos.clone().sub(this.direction))
    } else if (!this.isJumping) {
      this.updateAnim('F_Standing_Idle_001')
    }

    this.rb.setRotation(this.dummy.quaternion, true)
  }
}
