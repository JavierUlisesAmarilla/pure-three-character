import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'

import {mergeModelMeshes} from '../../utils/common'
import {Experience} from '../Experience'

export class Ground {
  scene
  time
  model?: GLTF
  rapierPhysics

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.rapierPhysics = experience.rapierPhysics
    this.model = experience.loaders?.items.capsuleModel
    this.initModel()
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    const mesh = mergeModelMeshes(this.model.scene)
    mesh.name = 'ground'
    mesh.position.y = 9
    // this.rapierPhysics.createTrimeshRigidBody({
    //   mesh,
    //   scale: 0.04,
    //   position: [0, 0, -1],
    //   descriptor: 'fixed',
    // })
    this.rapierPhysics.createTrimeshRigidBody({
      mesh,
      scale: 15,
      descriptor: 'fixed',
    })
  }
}
