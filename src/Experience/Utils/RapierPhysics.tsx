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

const object3dPosition = new THREE.Vector3()
const rootWorldPosition = new THREE.Vector3()
const colliderPosition = new THREE.Vector3()

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

    // Update colliders position
    this.rapierWorld.forEachRigidBody((elt) => {
      const object3d = this.rb2object3d.get(elt.handle)

      if (object3d) {
        object3d.getWorldPosition(colliderPosition)

        if (object3d.userData.rootBoneName) {
          const rootBone = object3d.getObjectByName(
              object3d.userData.rootBoneName,
          )
          if (rootBone) {
            rootBone.getWorldPosition(colliderPosition)
            const translation = elt.translation()
            colliderPosition.y = translation.y
          }
        }

        elt.setTranslation(colliderPosition, true)
      }
    })

    this.rapierWorld.step()

    // Update objects position
    this.rapierWorld.forEachRigidBody((elt) => {
      const translation = elt.translation()
      const object3d = this.rb2object3d.get(elt.handle)

      if (object3d) {
        object3dPosition.set(translation.x, translation.y, translation.z)

        if (object3d.userData.rootBoneName) {
          const rootBone = object3d.getObjectByName(
              object3d.userData.rootBoneName,
          )

          if (rootBone) {
            rootBone.getWorldPosition(rootWorldPosition)
            object3dPosition.sub(rootWorldPosition.sub(object3d.position))
          }
        }

        object3d.position.copy(object3dPosition)
        object3d.updateMatrix()
      }
    })
  }

  createTrimeshRigidBody({
    descriptor = 'dynamic',
    enabledRotations,
    mesh,
    scale = 1,
  }: {
    descriptor?: DescriptorType;
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
    enabledRotations,
    object3d,
    ballInfoArr,
  }: {
    descriptor?: DescriptorType;
    enabledRotations?: boolean[];
    object3d: THREE.Object3D;
    ballInfoArr: Array<BallInfoType>;
  }) {
    const body = this.createRigidBody({
      descriptor,
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
    object3d,
    capsuleInfoArr,
  }: {
    descriptor?: DescriptorType;
    enabledRotations?: boolean[];
    mass?: number;
    linearDamping?: number;
    angularDamping?: number;
    object3d: THREE.Object3D;
    capsuleInfoArr: Array<CapsuleInfoType>;
  }) {
    const body = this.createRigidBody({
      descriptor,
      enabledRotations,
      mass,
      linearDamping,
      angularDamping,
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
  }: {
    descriptor?: DescriptorType;
    enabledRotations?: boolean[];
    mass?: number;
    linearDamping?: number;
    angularDamping?: number;
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
