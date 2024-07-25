import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'

type DescriptorType =
  | 'dynamic'
  | 'kinematicPositionBased'
  | 'kinematicVelocityBased'
  | 'fixed';

type BallInfoType = {
  radius: number;
  position: number[];
};

type CapsuleInfoType = {
  halfHeight: number;
  radius: number;
  position: number[];
};

const offset = new THREE.Vector3()

export class RapierPhysics {
  rapierWorld?: RAPIER.World
  rb2object3d: Map<number, THREE.Object3D>
  scene: THREE.Scene
  lines: THREE.LineSegments

  constructor(scene: THREE.Scene) {
    this.rb2object3d = new Map()
    this.scene = scene

    // For debug renderer
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

  async init() {
    await RAPIER.init()
    this.rapierWorld = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0))
  }

  update(debugRender: boolean = false) {
    if (!this.rapierWorld) {
      return
    }

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
      const object3d = this.rb2object3d.get(elt.handle)

      if (object3d) {
        const object3dRoot = this.getObject3dRoot(object3d)

        if (object3dRoot) {
          offset.set(
              translation.x - object3d.position.x,
              translation.y - object3d.position.y,
              translation.z - object3d.position.z,
          )
          object3d.position.add(offset)
          object3d.updateMatrix()
        }
      }
    })
  }

  createTrimeshRigidBody({
    descriptor = 'dynamic',
    position = [0, 0, 0],
    enabledRotations,
    mesh,
    scale = 1,
  }: {
    descriptor?: DescriptorType;
    position?: number[];
    enabledRotations?: boolean[];
    mesh: THREE.Mesh;
    scale?: number;
  }) {
    if (!this.rapierWorld) {
      return
    }
    mesh.scale.set(scale, scale, scale)
    const geometry = mesh.geometry
    if (!geometry.index) {
      return
    }
    const body = this.createRigidBody({
      descriptor,
      position,
      enabledRotations,
    })
    if (!body) {
      return
    }
    const colliderDesc = RAPIER.ColliderDesc.trimesh(
      geometry.attributes.position.array.map(
          (value) => value * scale,
      ) as Float32Array,
      geometry.index.array as Uint32Array,
    )
    this.rapierWorld.createCollider(colliderDesc, body)
    this.rbToObject3d(body, mesh)
    return body
  }

  createBallsRigidBody({
    descriptor = 'dynamic',
    position = [0, 0, 0],
    enabledRotations,
    object3d,
    ballInfoArr,
  }: {
    descriptor?: DescriptorType;
    position?: number[];
    enabledRotations?: boolean[];
    object3d: THREE.Object3D;
    ballInfoArr: Array<BallInfoType>;
  }) {
    const body = this.createRigidBody({
      descriptor,
      position,
      enabledRotations,
    })
    if (!body) {
      return
    }

    ballInfoArr.forEach((ballInfo) => {
      if (!this.rapierWorld) {
        return
      }
      const colliderDesc = RAPIER.ColliderDesc.ball(ballInfo.radius)
      colliderDesc.setTranslation(
          ballInfo.position[0],
          ballInfo.position[1],
          ballInfo.position[2],
      )
      this.rapierWorld.createCollider(colliderDesc, body)
    })

    this.rbToObject3d(body, object3d)
    return body
  }

  createCapsulesRigidBody({
    descriptor = 'dynamic',
    enabledRotations,
    mass,
    linearDamping,
    angularDamping,
    position = [0, 0, 0],
    object3d,
    capsuleInfoArr,
  }: {
    descriptor?: DescriptorType;
    enabledRotations?: boolean[];
    mass?: number;
    linearDamping?: number;
    angularDamping?: number;
    position?: number[];
    object3d: THREE.Object3D;
    capsuleInfoArr: Array<CapsuleInfoType>;
  }) {
    const body = this.createRigidBody({
      descriptor,
      enabledRotations,
      mass,
      linearDamping,
      angularDamping,
      position,
    })
    if (!body) {
      return
    }

    capsuleInfoArr.forEach((capsuleInfo) => {
      if (!this.rapierWorld) {
        return
      }
      const colliderDesc = RAPIER.ColliderDesc.capsule(
          capsuleInfo.halfHeight,
          capsuleInfo.radius,
      )
      colliderDesc.setTranslation(
          capsuleInfo.position[0],
          capsuleInfo.position[1],
          capsuleInfo.position[2],
      )
      this.rapierWorld.createCollider(colliderDesc, body)
    })

    this.rbToObject3d(body, object3d)
    return body
  }

  createRigidBody({
    descriptor = 'dynamic',
    enabledRotations,
    mass,
    linearDamping,
    angularDamping,
    position = [0, 0, 0],
  }: {
    descriptor?: DescriptorType;
    enabledRotations?: boolean[];
    mass?: number;
    linearDamping?: number;
    angularDamping?: number;
    position?: number[];
  }) {
    if (!this.rapierWorld) {
      return
    }
    const bodyDesc = getRigidBodyDesc({
      descriptor,
      enabledRotations,
      mass,
      linearDamping,
      angularDamping,
    })
    bodyDesc.setTranslation(position[0], position[1], position[2])
    const body = this.rapierWorld.createRigidBody(bodyDesc)
    return body
  }

  rbToObject3d(rb: RAPIER.RigidBody, object3d: THREE.Object3D) {
    this.rb2object3d.set(rb.handle, object3d)
    this.scene.add(object3d)
  }

  getObject3dRoot(object3d: THREE.Object3D): THREE.Object3D {
    if (!object3d.parent || object3d.parent === this.scene) {
      return object3d
    }
    return this.getObject3dRoot(object3d.parent)
  }
}

const getRigidBodyDesc = ({
  descriptor,
  enabledRotations,
  mass = 1,
  linearDamping = 1,
  angularDamping = 1,
}: {
  descriptor: DescriptorType;
  enabledRotations?: boolean[];
  mass?: number;
  linearDamping?: number;
  angularDamping?: number;
}) => {
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

  if (enabledRotations && enabledRotations.length >= 3) {
    bodyDesc.enabledRotations(
        enabledRotations[0],
        enabledRotations[1],
        enabledRotations[2],
    )
  }

  bodyDesc.mass = mass
  bodyDesc.linearDamping = linearDamping
  bodyDesc.angularDamping = angularDamping
  return bodyDesc
}
