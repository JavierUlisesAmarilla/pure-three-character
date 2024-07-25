import {
  AnimationClip,
  AnimationMixer,
  Object3D,
  SkinnedMesh,
  Vector3,
} from 'three'

import {AnimationActionMap, BoneTransformsType} from '../../utils/types'

export default class OffsetAnimController {
  mixer: AnimationMixer
  actions: AnimationActionMap
  model: Object3D
  modelScale: number
  rootBone?: Object3D
  curActionName?: string
  rootBonePosition0?: Vector3

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
    if (rootBoneName) {
      this.rootBone = this.model.getObjectByName(rootBoneName)
    }
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
          // position: bone.position.clone(),
          rotation: bone.rotation.clone(),
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
          // bone.position.copy(transform[idx].position)
          bone.rotation.copy(transform[idx].rotation)
          bone.scale.copy(transform[idx].scale)
        })
      }
    })
  }

  playAction(actionName: string) {
    this.actions[actionName].play()
    this.rootBonePosition0 = this.rootBone?.position.clone()
  }
}
