import {AnimationAction, AnimationMixer} from 'three'

import {AnimationActionMap, AnimationMixerEvent} from '../types'

export default class AnimController {
  mixer: AnimationMixer
  actions: AnimationActionMap
  prevActionKey: string

  constructor(mixer: AnimationMixer, actions: AnimationActionMap) {
    this.mixer = mixer
    this.actions = actions
    this.prevActionKey = ''
    this.mixer.timeScale = 1
    this.setAllWeight(0)
    this.activateAllActions()
  }

  deactivateAllActions() {
    Object.keys(this.actions).forEach((actionKey: string) => {
      this.actions[actionKey].stop()
      this.setWeight(this.actions[actionKey], 0)
    })
  }

  activateAllActions() {
    Object.keys(this.actions).forEach((actionKey) => {
      this.actions[actionKey].play()
      this.setWeight(this.actions[actionKey], 0)
    })

    if (this.prevActionKey) {
      this.setWeight(this.actions[this.prevActionKey], 1)
    }
  }

  unPauseAllActions() {
    Object.keys(this.actions).forEach((actionKey) => {
      this.actions[actionKey].paused = false
    })
  }

  pauseAllActions() {
    Object.keys(this.actions).forEach((actionKey) => {
      this.actions[actionKey].paused = true
    })
  }

  setAllWeight(weight: number) {
    Object.keys(this.actions).forEach((actionKey) => {
      this.setWeight(this.actions[actionKey], weight)
    })
  }

  setWeight(action: AnimationAction, weight: number) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
  }

  executeCrossFade(
      startAction: AnimationAction,
      endAction: AnimationAction,
      duration: number,
  ) {
    this.setWeight(endAction, 1)
    endAction.time = 0
    if (startAction) {
      startAction.crossFadeTo(endAction, duration, true)
    }
  }

  synchronizeCrossFade(
      startAction: AnimationAction,
      endAction: AnimationAction,
      duration: number,
  ) {
    const onLoopFinished = (event: AnimationMixerEvent) => {
      if (event.action === startAction || !startAction) {
        this.mixer.removeEventListener('loop', onLoopFinished)
        this.executeCrossFade(startAction, endAction, duration)
      }
    }

    this.mixer.addEventListener('loop', onLoopFinished)
  }

  prepareCrossFade(
      startAction: AnimationAction,
      endAction: AnimationAction,
      duration: number,
  ) {
    this.unPauseAllActions()
    this.executeCrossFade(startAction, endAction, duration)
  }

  prepareSyncCrossFade(
      startAction: AnimationAction,
      endAction: AnimationAction,
      duration: number,
  ) {
    this.unPauseAllActions()
    this.synchronizeCrossFade(startAction, endAction, duration)
  }

  playNewActionOnly(actionKey: string) {
    if (this.prevActionKey === actionKey) {
      return
    }
    const newAction = this.actions[actionKey]
    if (!newAction) {
      return
    }
    if (this.actions[actionKey]) {
      this.prepareCrossFade(
          this.actions[this.prevActionKey],
          this.actions[actionKey],
          0.5,
      )
    }
    this.prevActionKey = actionKey
  }

  playNewSyncActionOnly(actionKey: string) {
    if (this.prevActionKey === actionKey) {
      return
    }
    const newAction = this.actions[actionKey]
    if (!newAction) {
      return
    }
    if (this.actions[actionKey]) {
      this.prepareSyncCrossFade(
          this.actions[this.prevActionKey],
          this.actions[actionKey],
          0.5,
      )
    }
    this.prevActionKey = actionKey
  }
}
