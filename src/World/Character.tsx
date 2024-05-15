import RAPIER from '@dimforge/rapier3d'
import {AnimationAction, AnimationMixer} from 'three'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'

export class Character {
  scene
  time
  rapierPhysics
  model: GLTF
  animMixer: AnimationMixer
  animActions: Map<string, AnimationAction>
  rb?: RAPIER.RigidBody

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.rapierPhysics = experience.rapierPhysics
    this.animActions = new Map()
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
    this.model?.animations.forEach((anim) => {
      if (this.animMixer) {
        this.animActions.set(anim.name, this.animMixer.clipAction(anim))
      }
    })
    this.animActions.get('Idle')?.play()
  }

  update() {
    if (!this.time || !this.animMixer) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)
  }
}
