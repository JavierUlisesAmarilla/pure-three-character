import RAPIER from '@dimforge/rapier3d'
import * as THREE from 'three'

type DescriptorType =
  | 'dynamic'
  | 'kinematicPositionBased'
  | 'kinematicVelocityBased'
  | 'fixed';

export class RapierPhysics {
  rapierWorld: RAPIER.World
  rb2mesh: Map<number, THREE.Mesh>
  scene: THREE.Scene
  lines: THREE.LineSegments

  constructor(scene: THREE.Scene) {
    this.rapierWorld = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0))
    this.rb2mesh = new Map()
    this.scene = scene

    // For the debug-renderer
    {
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
      })
      this.lines = new THREE.LineSegments(geometry, material)
      scene.add(this.lines)
    }
  }

  createTrimeshRigidBody({
    mesh,
    scale = 1,
    position = [0, 0, 0],
    descriptor = 'dynamic',
  }: {
    mesh: THREE.Mesh;
    scale?: number;
    position?: number[];
    descriptor?: DescriptorType;
  }) {
    mesh.scale.set(scale, scale, scale)
    const geometry = mesh.geometry
    if (!geometry.index) {
      return
    }
    const bodyDesc = getRigidBodyDesc(descriptor)
    bodyDesc.setTranslation(position[0], position[1], position[2])
    const body = this.rapierWorld.createRigidBody(bodyDesc)
    const colliderDesc = RAPIER.ColliderDesc.trimesh(
      geometry.attributes.position.array.map(
          (value) => value * scale,
      ) as Float32Array,
      geometry.index.array as Uint32Array,
    )
    this.rapierWorld.createCollider(colliderDesc, body)
    this.addRigidBody(body, mesh)
  }

  addRigidBody(rb: RAPIER.RigidBody, mesh: THREE.Mesh) {
    this.rb2mesh.set(rb.handle, mesh)
    this.scene.add(mesh)
  }

  update(debugRender: boolean = false) {
    if (debugRender) {
      const buffers = this.rapierWorld.debugRender()
      this.lines.visible = true
      this.lines.geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(buffers.vertices, 3),
      )
      this.lines.geometry.setAttribute(
          'color',
          new THREE.BufferAttribute(buffers.colors, 4),
      )
    } else {
      this.lines.visible = false
    }

    this.rapierWorld.step()

    this.rapierWorld.forEachRigidBody((elt) => {
      const translation = elt.translation()
      const rotation = elt.rotation()
      const mesh = this.rb2mesh.get(elt.handle)

      if (mesh) {
        mesh.position.set(translation.x, translation.y, translation.z)
        mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
        mesh.updateMatrix()
      }
    })
  }
}

const getRigidBodyDesc = (descriptor: DescriptorType) => {
  let bodyDesc

  switch (descriptor) {
    case 'kinematicPositionBased':
      bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      break
    case 'kinematicVelocityBased':
      bodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased()
      break
    case 'fixed':
      bodyDesc = RAPIER.RigidBodyDesc.fixed()
      break
    default:
      bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      break
  }

  return bodyDesc
}
