import {
  AnimationClip,
  AnimationMixer,
  Group,
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
const modelDummyVec3 = new Vector3()
const rootBoneName = 'Hips'

export class Character {
  scene
  time
  keyboard
  rapierPhysics
  model: Group
  root: Group
  animModelArr: Group[]
  animMixer: AnimationMixer
  offsetAnimController?: OffsetAnimController
  moveState!: string

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.keyboard = experience.keyboard
    this.rapierPhysics = experience.rapierPhysics
    const items = experience.loaders?.items
    this.model = items?.masculineTPoseModel
    this.model.scale.multiplyScalar(modelScale)
    this.root = new Group()
    this.root.add(this.model)
    this.animModelArr = [
      items?.fStandingIdle001Model,
      items?.fWalk002Model,
      items?.fWalkBackwards001Model,
      items?.fWalkJump002Model,
      items?.fWalkStrafeLeft001Model,
      items?.fWalkStrafeRight001Model,
      items?.mJog001Model,
      items?.mJogBackwards001Model,
      items?.mJogJump001Model,
      items?.mJogStrafeLeft001Model,
      items?.mJogStrafeRight001Model,
    ]
    this.animMixer = new AnimationMixer(this.model)
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
      root: this.root,
      rootBoneName,
      clipArr,
    })
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    if (IS_SKELETON_VISIBLE) {
      this.scene.add(new SkeletonHelper(this.model))
    }
    this.rapierPhysics.createCapsulesRigidBody({
      object3d: this.root,
      capsuleInfoArr: [{halfHeight: 0.5, radius: 0.5, position: [0, 1, 0]}],
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
    this.root.getWorldPosition(modelDummyVec3)
    modelDummyVec3.add(FRONT_DIRECTION_VEC3)
    this.root.lookAt(modelDummyVec3)
    if (!this.time || !this.offsetAnimController) {
      return
    }
    this.offsetAnimController.update(this.time.delta * 0.001)
    if (!this.keyboard) {
      return
    }
    const {isFront, isLeft, isBack, isRight, isFast, isJump} = this.keyboard

    if (
      (isFront || isBack || isLeft || isRight) &&
      (isFront !== isBack || isLeft !== isRight)
    ) {
      if (isFast) {
        if (isFront) {
          if (isJump) {
            this.updateAnim('M_Jog_Jump_001')
          } else {
            this.updateAnim('M_Jog_001')
          }
        } else if (isBack) {
          this.updateAnim('M_Jog_Backwards_001')
        } else if (isLeft) {
          this.updateAnim('M_Jog_Strafe_Left_001')
        } else if (isRight) {
          this.updateAnim('M_Jog_Strafe_Right_001')
        }
      } else if (isFront) {
        if (isJump) {
          this.updateAnim('F_Walk_Jump_002')
        } else {
          this.updateAnim('F_Walk_002')
        }
      } else if (isBack) {
        this.updateAnim('F_Walk_Backwards_001')
      } else if (isLeft) {
        this.updateAnim('F_Walk_Strafe_Left_001')
      } else if (isRight) {
        this.updateAnim('F_Walk_Strafe_Right_001')
      }
    } else {
      this.updateAnim('F_Standing_Idle_001')
    }
  }
}
