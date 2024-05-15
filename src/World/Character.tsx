import {AnimationAction, AnimationMixer} from 'three'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'

export class Character {
  scene
  time
  rapierPhysics
  model: GLTF
  animMixer
  animActions: Map<string, AnimationAction>

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.rapierPhysics = experience.rapierPhysics
    this.model = experience.loaders?.items.characterModel
    this.animMixer = new AnimationMixer(this.model.scene)
    this.animActions = new Map()
    this.initModel()
    this.initAnim()
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    this.scene.add(this.model.scene)
    this.rapierPhysics.createBallsRigidBody({
      object3d: this.model.scene,
      ballInfoArr: [
        {radius: 0.5, position: [0, 0.5, 0], scale: 1},
        {radius: 0.5, position: [0, 1.5, 0], scale: 1},
      ],
      enabledRotations: [false, true, false],
    })
  }

  initAnim() {
    this.model.animations.forEach((anim) => {
      this.animActions.set(anim.name, this.animMixer.clipAction(anim))
    })
    this.animActions.get('Idle')?.play()
  }

  update() {
    if (!this.time) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)
  }
}
