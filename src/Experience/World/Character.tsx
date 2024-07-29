import {
  AnimationClip,
  AnimationMixer,
  Group,
  Object3D,
  SkeletonHelper,
  Vector3,
} from 'three'

import {
  FRONT_DIRECTION_VEC3,
  IS_SKELETON_VISIBLE,
} from '../../utils/constants'
import {Experience} from '../Experience'
import OffsetAnimController from '../Utils/OffsetAnimController'

const modelScale = 0.01
const rootBoneName = 'Hips'
const modelDummyVec3 = new Vector3()
const rootBoneDummyVec3 = new Vector3()

export class Character {
  scene
  time
  keyboard
  rapierPhysics
  model: Group
  rootBone?: Object3D
  animModelArr: Group[]
  animMixer: AnimationMixer
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
    this.model.scale.multiplyScalar(modelScale)
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
    if (IS_SKELETON_VISIBLE) {
      this.scene.add(new SkeletonHelper(this.model))
    }
    this.rapierPhysics.createCapsulesRigidBody({
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
      const x = rootBoneDummyVec3.x - modelDummyVec3.x
      const y = modelDummyVec3.y
      const z = rootBoneDummyVec3.z - modelDummyVec3.z
      this.model.position.x += x
      this.model.position.y = 0
      this.model.position.z += z
      this.model.getWorldPosition(modelDummyVec3)
      modelDummyVec3.add(FRONT_DIRECTION_VEC3)
      this.model.lookAt(modelDummyVec3)
      this.model.position.x -= x
      this.model.position.y = y
      this.model.position.z -= z
    }

    if (!this.time || !this.animMixer) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)
    if (!this.keyboard) {
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
