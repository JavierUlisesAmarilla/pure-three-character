import {AnimationClip, AnimationMixer, Vector3} from 'three'

import {getTrackFromAction} from '../../utils/common'
import {AnimationActionMap} from '../../utils/types'

const rootBonePosition0 = new Vector3()

export default class OffsetAnimController {
  mixer: AnimationMixer
  actions: AnimationActionMap
  modelScale: number
  rootBoneName?: string
  rootBonePositionTrackName?: string
  curActionName?: string

  constructor({
    mixer,
    clipArr,
    modelScale,
    rootBoneName,
    rootBonePositionTrackName,
  }: {
    mixer: AnimationMixer;
    clipArr: AnimationClip[];
    modelScale?: number;
    rootBoneName?: string;
    rootBonePositionTrackName?: string;
  }) {
    this.mixer = mixer
    this.actions = {}
    clipArr.forEach((clip) => {
      this.actions[clip.name] = this.mixer.clipAction(clip)
    })
    this.modelScale = modelScale ?? 1
    this.rootBoneName = rootBoneName
    this.rootBonePositionTrackName = rootBonePositionTrackName
  }

  playNewAction(actionName: string) {
    if (this.curActionName === actionName) {
      return
    }
    this.stopCurAction()
    this.actions[actionName].play()
    this.curActionName = actionName
  }

  stopCurAction() {
    if (this.curActionName) {
      const prevAction = this.actions[this.curActionName]

      if (this.rootBonePositionTrackName && this.rootBoneName) {
        const rootBonePositionTrack = getTrackFromAction(
            prevAction,
            this.rootBonePositionTrackName,
        )
        const model = prevAction.getRoot()
        const rootBone = model.getObjectByName(this.rootBoneName)

        if (rootBonePositionTrack && rootBone) {
          const rootBonePositionValueArr = rootBonePositionTrack.values
          rootBonePosition0.set(
              rootBonePositionValueArr[0],
              rootBonePositionValueArr[1],
              rootBonePositionValueArr[2],
          )
          console.log('test: rootBonePosition0:', rootBonePosition0)
          console.log('test: model.position:', model.position)
          console.log('test: rootBone.position:', rootBone.position)
        }
      }

      prevAction.stop()
    }
  }
}
