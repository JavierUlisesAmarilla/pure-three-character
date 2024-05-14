import {AnimationMixer} from 'three'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'

export class Ground {
  scene
  time
  model: GLTF
  animMixer
  animActionArr

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.model = experience.loaders?.items.groundModel
    this.animMixer = new AnimationMixer(this.model.scene)
    this.animActionArr = this.model.animations.map((anim) =>
      this.animMixer.clipAction(anim),
    )
    this.initModel()
    this.initAnim()
  }

  initModel() {
    if (!this.scene || !this.model) {
      return
    }
    this.model.scene.scale.set(10, 10, 10)
    this.model.scene.position.y = 6
    this.scene.add(this.model.scene)
  }

  initAnim() {
    if (this.animActionArr.length) {
      this.animActionArr[0].play()
    }
  }

  update() {
    if (!this.time) {
      return
    }
    this.animMixer.update(this.time.delta * 0.001)
  }
}
