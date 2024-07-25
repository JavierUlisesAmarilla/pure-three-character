import gsap from 'gsap'
import {
  AnimationClip,
  AnimationMixer,
  Object3D,
  SkinnedMesh,
  Vector3,
} from 'three'

import {AnimationActionMap, BoneTransformsType} from '../../utils/types'

export default class OffsetAnimController {
  model: Object3D
  modelScale: number
  rootBone?: Object3D
  rootBonePosition0?: Vector3
  mixer: AnimationMixer
  actions: AnimationActionMap
  curActionName?: string
  transitionDuration: number
  isTransitioning: boolean

  constructor({
    mixer,
    clipArr,
    modelScale,
    rootBoneName,
  }: {
    mixer: AnimationMixer;
    clipArr: AnimationClip[];
    modelScale?: number;
    rootBoneName?: string;
  }) {
    this.mixer = mixer
    this.actions = {}
    clipArr.forEach((clip) => {
      this.actions[clip.name] = this.mixer.clipAction(clip)
    })
    this.model = this.mixer.getRoot() as Object3D
    this.modelScale = modelScale ?? 1
    this.transitionDuration = 0.1
    this.isTransitioning = false
    if (rootBoneName) {
      this.rootBone = this.model.getObjectByName(rootBoneName)
    }
  }

  playNewAction(actionName: string) {
    if (this.curActionName === actionName || this.isTransitioning) {
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
    const transforms = this.getBoneTransforms()

    if (this.rootBone && this.rootBonePosition0) {
      this.model.position.add(
          this.rootBonePosition0
              .sub(this.rootBone.position)
              .negate()
              .multiplyScalar(this.modelScale),
      )
    }

    this.actions[this.curActionName].stop()
    this.setBoneTransforms(transforms)
  }

  getBoneTransforms() {
    const transforms: BoneTransformsType = {}

    this.model.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        transforms[child.name] = child.skeleton.bones.map((bone) => ({
          quaternion: bone.quaternion.clone(),
          // rotation: bone.rotation.clone(),
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
          // bone.rotation.copy(transform[idx].rotation)
          bone.scale.copy(transform[idx].scale)
        })
      }
    })
  }

  async playAction(actionName: string) {
    // Animate old transforms to new transforms before playing new action
    this.isTransitioning = true
    const oldTransforms = this.getBoneTransforms()
    this.actions[actionName].play()
    this.mixer.update(0)
    const newTransforms = this.getBoneTransforms()
    this.actions[actionName].stop()
    this.setBoneTransforms(oldTransforms)
    await this.animateBoneTransforms(newTransforms)
    this.rootBonePosition0 = this.rootBone?.position.clone()
    this.isTransitioning = false

    // Play new action
    this.actions[actionName].play()
  }

  animateBoneTransforms(transforms: BoneTransformsType) {
    return new Promise((resolve) => {
      const timeline = gsap.timeline()

      this.model.traverse((child) => {
        if (child instanceof SkinnedMesh) {
          const transform = transforms[child.name]

          child.skeleton.bones.forEach((bone, idx) => {
            const quaternion = transform[idx].quaternion
            timeline.to(
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
            // const rotation = transform[idx].rotation
            // timeline.to(
            //     bone.rotation,
            //     {
            //       x: rotation.x,
            //       y: rotation.y,
            //       z: rotation.z,
            //       duration: this.transitionDuration,
            //     },
            //     0,
            // )
            const scale = transform[idx].scale
            timeline.to(
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

      timeline.to(null, {
        duration: this.transitionDuration,
        onComplete: resolve,
      })
    })
  }
}
