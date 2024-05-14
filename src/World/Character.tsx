import {AnimationAction, AnimationMixer} from 'three'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'

export class Character {
  scene
  time
  model: GLTF
  animMixer
  animActions: Map<string, AnimationAction>

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.model = experience.loaders?.items.characterModel
    this.animMixer = new AnimationMixer(this.model.scene)
    this.animActions = new Map()
    this.initModel()
    this.initAnim()
  }

  initModel() {
    if (!this.scene || !this.model) {
      return
    }
    this.scene.add(this.model.scene)
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
