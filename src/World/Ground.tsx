import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'
import {mergeModelMeshes} from '../common'

export class Ground {
  scene
  time
  model: GLTF
  rapierPhysics

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.rapierPhysics = experience.rapierPhysics
    this.model = experience.loaders?.items.groundModel
    this.initModel()
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    const mesh = mergeModelMeshes(this.model.scene)
    this.rapierPhysics.createTrimeshRigidBody({
      mesh,
      scale: 10,
      position: [0, 6.5, 0],
      descriptor: 'fixed',
    })
  }
}
