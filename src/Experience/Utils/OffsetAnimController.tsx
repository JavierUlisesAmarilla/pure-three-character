import gsap from 'gsap'
import {
  AnimationClip,
  AnimationMixer,
  Object3D,
  SkinnedMesh,
  Vector3,
} from 'three'

import {AnimationActionMap, BoneTransformsType} from '../../utils/types'

const vec3 = new Vector3()

export default class OffsetAnimController {
  model: Object3D
  rootBone?: Object3D
  rootBonePosition0: Vector3
  mixer: AnimationMixer
  actions: AnimationActionMap
  curActionName?: string
  transitionDuration: number
  timeline?: gsap.core.Timeline

  constructor({
    mixer,
    clipArr,
    rootBone,
  }: {
    mixer: AnimationMixer;
    clipArr: AnimationClip[];
    rootBone?: Object3D;
  }) {
    this.mixer = mixer
    this.actions = {}
    clipArr.forEach((clip) => {
      this.actions[clip.name] = this.mixer.clipAction(clip)
    })
    this.model = this.mixer.getRoot() as Object3D
    this.rootBone = rootBone
    this.rootBonePosition0 = new Vector3()
    this.transitionDuration = 0.08
  }

  playNewAction(actionName: string) {
    if (this.curActionName === actionName) {
      return
    }
    this.stopAction()
    this.playAction(actionName)
    this.curActionName = actionName
  }

  stopAction() {
    if (!this.curActionName) {
      return
    }
    this.timeline?.kill()
    const transforms = this.getBoneTransforms()

    if (this.rootBone && this.rootBonePosition0) {
      this.rootBone.getWorldPosition(vec3)
      this.model.position.add(this.rootBonePosition0.sub(vec3).negate())
    }

    this.actions[this.curActionName].stop()
    this.setBoneTransforms(transforms)
  }

  getBoneTransforms() {
    const transforms: BoneTransformsType = {}

    this.model.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        transforms[child.name] = child.skeleton.bones.map((bone) => ({
          position: bone.position.clone(),
          quaternion: bone.quaternion.clone(),
          scale: bone.scale.clone(),
        }))
      }
    })

    return transforms
  }

  setBoneTransforms(transforms: BoneTransformsType) {
    this.model.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        const transform = transforms[child.name]

        child.skeleton.bones.forEach((bone, idx) => {
          bone.quaternion.copy(transform[idx].quaternion)
          bone.scale.copy(transform[idx].scale)
        })
      }
    })
  }

  playAction(actionName: string) {
    const oldTransforms = this.getBoneTransforms()
    this.actions[actionName].play()
    this.mixer.update(0)
    const newTransforms = this.getBoneTransforms()
    this.rootBone?.getWorldPosition(this.rootBonePosition0)
    this.actions[actionName].stop()
    this.setBoneTransforms(oldTransforms)

    this.animateBoneTransforms(newTransforms, () => {
      this.actions[actionName].play()
    })
  }

  animateBoneTransforms(
      transforms: BoneTransformsType,
      onComplete: () => void,
  ) {
    this.timeline = gsap.timeline()

    this.model.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        const transform = transforms[child.name]

        child.skeleton.bones.forEach((bone, idx) => {
          const quaternion = transform[idx].quaternion
          const position = transform[idx].position
          this.timeline?.to(
              bone.position,
              {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: this.transitionDuration,
              },
              0,
          )
          this.timeline?.to(
              bone.quaternion,
              {
                x: quaternion.x,
                y: quaternion.y,
                z: quaternion.z,
                w: quaternion.w,
                duration: this.transitionDuration,
              },
              0,
          )
          const scale = transform[idx].scale
          this.timeline?.to(
              bone.scale,
              {
                x: scale.x,
                y: scale.y,
                z: scale.z,
                duration: this.transitionDuration,
              },
              0,
          )
        })
      }
    })

    this.timeline.to(null, {
      duration: this.transitionDuration,
      onComplete,
    })
  }
}
