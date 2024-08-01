import gsap from 'gsap'
import {
  AnimationClip,
  AnimationMixer,
  Object3D,
  SkinnedMesh,
  Vector3,
} from 'three'

import {AnimationActionMap, BoneTransformsType} from '../../utils/types'

const rootBoneDummyVec3 = new Vector3()

export default class OffsetAnimController {
  root: Object3D
  model: Object3D
  rootBone?: Object3D
  mixer: AnimationMixer
  actions: AnimationActionMap
  curActionName?: string
  timeline?: gsap.core.Timeline
  transitionDuration: number

  constructor({
    root,
    rootBoneName,
    clipArr,
  }: {
    root: Object3D;
    rootBoneName?: string;
    clipArr: AnimationClip[];
  }) {
    this.root = root
    this.model = this.root.children[0]

    if (rootBoneName) {
      const rootBone = this.model.getObjectByName(rootBoneName)
      if (rootBone) {
        this.rootBone = rootBone
      }
    }

    this.mixer = new AnimationMixer(this.model)
    this.mixer.addEventListener('loop', () => {
      this.model.position.set(0, 0, 0)
    })
    this.actions = {}
    clipArr.forEach((clip) => {
      this.actions[clip.name] = this.mixer.clipAction(clip)
    })
    this.transitionDuration = 0.08
  }

  update(delta: number) {
    this.mixer.update(delta)

    if (this.rootBone) {
      this.rootBone.getWorldPosition(rootBoneDummyVec3)
      rootBoneDummyVec3.setY(0)
      this.root.position.copy(rootBoneDummyVec3)
      this.model.position.set(
          -this.rootBone.position.x * this.model.scale.x,
          0,
          -this.rootBone.position.z * this.model.scale.z,
      )
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
    this.timeline?.kill()
    const transforms = this.getBoneTransforms()
    this.model.position.set(0, 0, 0)
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
    // Get action's first bone transforms
    const oldTransforms = this.getBoneTransforms()
    this.actions[actionName].play()
    this.mixer.update(0)
    const newTransforms = this.getBoneTransforms()
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
