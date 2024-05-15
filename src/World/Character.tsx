import RAPIER from '@dimforge/rapier3d'
import {AnimationAction, AnimationMixer} from 'three'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'
import AnimController from '../Utils/animController'

export class Character {
  scene
  time
  keyboard
  rapierPhysics
  model: GLTF
  animMixer: AnimationMixer
  rb?: RAPIER.RigidBody
  animController?: AnimController

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.keyboard = experience.keyboard
    this.rapierPhysics = experience.rapierPhysics
    this.model = experience.loaders?.items.characterModel
    this.animMixer = new AnimationMixer(this.model.scene)
    this.initModel()
    this.initAnim()
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    this.scene.add(this.model.scene)
    this.rb = this.rapierPhysics.createBallsRigidBody({
      object3d: this.model.scene,
      ballInfoArr: [
        {radius: 0.5, position: [0, 0.5, 0], scale: 1},
        {radius: 0.5, position: [0, 1.5, 0], scale: 1},
      ],
      enabledRotations: [false, true, false],
    })
  }

  initAnim() {
    if (!this.animMixer) {
      return
    }
    const animActions: {[key: string]: AnimationAction} = {}
    this.model?.animations.forEach((anim) => {
      animActions[anim.name] = this.animMixer.clipAction(anim)
    })
    const animControllerActions = {
      Idle: animActions['Idle'],
      Walk: animActions['Walk'],
      Run: animActions['Run'],
      Jump: animActions['Combat_Idle'],
    }
    this.animController = new AnimController(this.animMixer, animControllerActions)
    this.animController.playNewActionOnly('Idle')
  }

  update() {
    if (!this.time || !this.animMixer || !this.keyboard) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)

    if (this.keyboard.isFront) {
      console.log('isFront')
    }
  }
}
