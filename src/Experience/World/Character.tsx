import RAPIER from '@dimforge/rapier3d-compat'
import {
  AnimationClip,
  AnimationMixer,
  Group,
  Object3D,
  SkeletonHelper,
  Vector3,
} from 'three'

import {
  BACK_DIRECTION_VEC3,
  IS_SKELETON_VISIBLE,
} from '../../utils/constants'
import {Experience} from '../Experience'
import OffsetAnimController from '../Utils/OffsetAnimController'

const rootBoneName = 'Hips'
const modelDummyVec3 = new Vector3()
const rootBoneDummyVec3 = new Vector3()
const dummyVec3 = new Vector3()
const zeroVec3 = new Vector3()

export class Character {
  scene
  time
  keyboard
  rapierPhysics
  model: Group
  rootBone?: Object3D
  animModelArr: Group[]
  animMixer: AnimationMixer
  rb?: RAPIER.RigidBody
  offsetAnimController?: OffsetAnimController
  direction
  isJumping
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
    this.model.userData = {rootBoneName}
    this.rootBone = this.model.getObjectByName(rootBoneName)
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
    this.walkSpeed = 0.05
    this.initAnim()
    this.initModel()
  }

  initAnim() {
    if (!this.animMixer) {
      return
    }
    const clipArr: AnimationClip[] = []
    this.animModelArr.forEach((animModel) => {
      clipArr.push(animModel.animations[0])
    })
    this.offsetAnimController = new OffsetAnimController({
      mixer: this.animMixer,
      clipArr,
      rootBone: this.rootBone,
    })
    this.updateAnim('F_Standing_Idle_001')
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    console.log('test: this.model:', this.model)
    if (IS_SKELETON_VISIBLE) {
      this.scene.add(new SkeletonHelper(this.model))
    }
    this.rb = this.rapierPhysics.createCapsulesRigidBody({
      object3d: this.model,
      capsuleInfoArr: [{halfHeight: 0.5, radius: 0.5, position: [0, 0, 0]}],
      enabledRotations: [false, true, false],
    })
  }

  updateAnim(animName: string) {
    if (this.moveState !== animName && this.offsetAnimController) {
      this.moveState = animName
      this.offsetAnimController.playNewAction(animName)
    }
  }

  update() {
    if (this.rootBone) {
      this.model.getWorldPosition(modelDummyVec3)
      this.rootBone.getWorldPosition(rootBoneDummyVec3)
      dummyVec3.copy(rootBoneDummyVec3)
      modelDummyVec3.y = dummyVec3.y
      const distance = modelDummyVec3.distanceTo(rootBoneDummyVec3)
      dummyVec3.add(BACK_DIRECTION_VEC3.multiplyScalar(distance))
      this.model.position.copy(dummyVec3)
      this.model.lookAt(rootBoneDummyVec3)
    }

    const position = this.model.children[0].position
    if (!position.equals(zeroVec3)) {
      console.log('test: position:', position)
    }

    if (!this.time || !this.animMixer) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)
    if (!this.keyboard || !this.rb) {
      return
    }
    const {isFront, isLeft, isBack, isRight, isFast, isJump} = this.keyboard

    if (isJump && !this.isJumping) {
      this.isJumping = true
      if (isFast) {
        this.updateAnim('M_Jog_Jump_001')
      } else {
        this.updateAnim('F_Walk_Jump_002')
      }
    }

    if (
      (isFront || isBack || isLeft || isRight) &&
      (isFront !== isBack || isLeft !== isRight)
    ) {
      if (isFast) {
        if (!this.isJumping) {
          this.updateAnim('M_Jog_001')
        }
      } else if (!this.isJumping) {
        this.updateAnim('F_Walk_002')
      }
    } else if (!this.isJumping) {
      this.updateAnim('F_Standing_Idle_001')
    }
  }
}
