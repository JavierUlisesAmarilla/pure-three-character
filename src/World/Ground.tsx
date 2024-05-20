import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Experience} from '../Experience'
import {mergeModelMeshes} from '../common'

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
    // For container.glb
    // this.model = experience.loaders?.items.groundModel
    // For room.glb
    // this.model = experience.loaders?.items.roomModel
    this.model = experience.loaders?.items.capsuleModel
    this.initModel()
  }

  initModel() {
    if (!this.scene || !this.model || !this.rapierPhysics) {
      return
    }
    const mesh = mergeModelMeshes(this.model.scene)
    // For container.glb
    // this.rapierPhysics.createTrimeshRigidBody({
    //   mesh,
    //   scale: 10,
    //   position: [0, 6.5, 0],
    //   descriptor: 'fixed',
    // })
    // For room.glb
    // this.rapierPhysics.createTrimeshRigidBody({
    //   mesh,
    //   scale: 10,
    //   position: [0, 1, 1],
    //   descriptor: 'fixed',
    // })
    this.rapierPhysics.createTrimeshRigidBody({
      mesh,
      scale: 0.04,
      position: [0, 0, -1],
      descriptor: 'fixed',
    })
  }
}
