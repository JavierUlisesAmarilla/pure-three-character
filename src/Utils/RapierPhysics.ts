import RAPIER from '@dimforge/rapier3d'
import * as THREE from 'three'

const BOX_INSTANCE_INDEX = 0
const BALL_INSTANCE_INDEX = 1
const CYLINDER_INSTANCE_INDEX = 2
const CONE_INSTANCE_INDEX = 3
const dummy = new THREE.Object3D()

interface InstanceDesc {
  groupId: number
  instanceId: number
  elementId: number
  highlighted: boolean
  scale?: THREE.Vector3
}

const genHeightfieldGeometry = (collider: RAPIER.Collider) => {
  const heights = collider.heightfieldHeights()
  const nRows = collider.heightfieldNRows()
  const nCols = collider.heightfieldNCols()
  const scale = collider.heightfieldScale()

  const vertices = []
  const indices = []
  const eltWX = 1.0 / nRows
  const eltWY = 1.0 / nCols

  let i: number
  let j: number

  for (j = 0; j <= nCols; ++j) {
    for (i = 0; i <= nRows; ++i) {
      const x = ((j * eltWX) - 0.5) * scale.x
      const y = heights[(j * (nRows + 1)) + i] * scale.y
      const z = ((i * eltWY) - 0.5) * scale.z
      vertices.push(x, y, z)
    }
  }

  for (j = 0; j < nCols; ++j) {
    for (i = 0; i < nRows; ++i) {
      const i1 = ((i + 0) * (nCols + 1)) + (j + 0)
      const i2 = ((i + 0) * (nCols + 1)) + (j + 1)
      const i3 = ((i + 1) * (nCols + 1)) + (j + 0)
      const i4 = ((i + 1) * (nCols + 1)) + (j + 1)
      indices.push(i1, i3, i2)
      indices.push(i3, i4, i2)
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
  }
}

export class RapierPhysics {
  rapierWorld: RAPIER.World
  coll2instance: Map<number, InstanceDesc>
  coll2mesh: Map<number, THREE.Mesh>
  rb2colls: Map<number, Array<RAPIER.Collider>>
  scene: THREE.Scene
  instanceGroupArr: Array<Array<THREE.InstancedMesh>>
  highlightInstanceArr: Array<THREE.InstancedMesh>
  lines: THREE.LineSegments
  highlightedCollider!: number | undefined

  constructor(scene: THREE.Scene) {
    this.rapierWorld = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0))
    this.coll2instance = new Map()
    this.coll2mesh = new Map()
    this.rb2colls = new Map()
    this.scene = scene
    this.instanceGroupArr = []
    this.highlightInstanceArr = []

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

  update(debugRender: boolean) {
    if (debugRender) {
      const buffers = this.rapierWorld.debugRender()
      this.lines.visible = true
      this.lines.geometry.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3))
      this.lines.geometry.setAttribute('color', new THREE.BufferAttribute(buffers.colors, 4))
    } else {
      this.lines.visible = false
    }

    this.rapierWorld.forEachCollider((elt) => {
      const gfx = this.coll2instance.get(elt.handle)
      const translation = elt.translation()
      const rotation = elt.rotation()

      if (gfx) {
        const instance = this.instanceGroupArr[gfx.groupId][gfx.instanceId]
        if (gfx.scale) {
          dummy.scale.set(gfx.scale.x, gfx.scale.y, gfx.scale.z)
        }
        dummy.position.set(translation.x, translation.y, translation.z)
        dummy.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
        dummy.updateMatrix()
        instance.setMatrixAt(gfx.elementId, dummy.matrix)
        instance.instanceMatrix.needsUpdate = true
        const highlightInstance = this.highlightInstanceArr[gfx.groupId]

        if (gfx.highlighted && highlightInstance) {
          highlightInstance.count = 1
          highlightInstance.setMatrixAt(0, dummy.matrix)
          highlightInstance.instanceMatrix.needsUpdate = true
        }
      }

      const mesh = this.coll2mesh.get(elt.handle)

      if (mesh) {
        mesh.position.set(translation.x, translation.y, translation.z)
        mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
        mesh.updateMatrix()
      }
    })
  }

  highlightCollider(handle: number | undefined) {
    // Avoid flickering when moving the mouse on a single collider
    if (handle === this.highlightedCollider) {
      return
    }

    if (this.highlightedCollider !== undefined) {
      const desc = this.coll2instance.get(this.highlightedCollider)

      if (desc && this.highlightInstanceArr[desc.groupId]) {
        desc.highlighted = false
        this.highlightInstanceArr[desc.groupId].count = 0
      }
    }

    if (handle !== undefined) {
      const desc = this.coll2instance.get(handle)

      // Don't highlight static/kinematic bodies
      if (desc && desc.instanceId !== 0) {
        desc.highlighted = true
      }
    }

    this.highlightedCollider = handle
  }

  reset() {
    this.instanceGroupArr.forEach((groups) => {
      groups.forEach((instance) => {
        instance.userData.elementId2coll = new Map()
        instance.count = 0
      })
    })

    this.coll2mesh.forEach((mesh) => {
      this.scene.remove(mesh)
    })

    this.coll2instance = new Map()
    this.rb2colls = new Map()
  }

  removeRigidBody(body: RAPIER.RigidBody) {
    const colls = this.rb2colls.get(body.handle)

    if (colls) {
      colls.forEach((coll) => this.removeCollider(coll))
      this.rb2colls.delete(body.handle)
    }
  }

  removeCollider(collider: RAPIER.Collider) {
    const gfx = this.coll2instance.get(collider.handle)
    if (!gfx) {
      return
    }
    const instance = this.instanceGroupArr[gfx.groupId][gfx.instanceId]

    if (instance.count > 1) {
      const coll2 = instance.userData.elementId2coll.get(
          instance.count - 1,
      )
      instance.userData.elementId2coll.delete(instance.count - 1)
      instance.userData.elementId2coll.set(gfx.elementId, coll2)
      const gfx2 = this.coll2instance.get(coll2.handle)
      if (gfx2) {
        gfx2.elementId = gfx.elementId
      }
    }

    instance.count -= 1
    this.coll2instance.delete(collider.handle)
  }

  addCollider(collider: RAPIER.Collider) {
    const parent = collider.parent()
    if (!parent) {
      return
    }
    if (!this.rb2colls.get(parent.handle)) {
      this.rb2colls.set(parent.handle, [collider])
    } else {
      this.rb2colls.get(parent.handle)?.push(collider)
    }

    let instance
    const instanceDesc: InstanceDesc = {
      groupId: 0,
      instanceId: parent.isFixed() ? 0 : 0,
      elementId: 0,
      highlighted: false,
    }

    switch (collider.shapeType()) {
      case RAPIER.ShapeType.Cuboid:
        // eslint-disable-next-line no-case-declarations -- TODO
        const hExt = collider.halfExtents()
        instance = this.instanceGroupArr[BOX_INSTANCE_INDEX][instanceDesc.instanceId]
        instanceDesc.groupId = BOX_INSTANCE_INDEX
        instanceDesc.scale = new THREE.Vector3(hExt.x, hExt.y, hExt.z)
        break
      case RAPIER.ShapeType.Ball:
        // eslint-disable-next-line no-case-declarations -- TODO
        const rad = collider.radius()
        instance = this.instanceGroupArr[BALL_INSTANCE_INDEX][instanceDesc.instanceId]
        instanceDesc.groupId = BALL_INSTANCE_INDEX
        instanceDesc.scale = new THREE.Vector3(rad, rad, rad)
        break
      case RAPIER.ShapeType.Cylinder:
      case RAPIER.ShapeType.RoundCylinder:
        // eslint-disable-next-line no-case-declarations -- TODO
        const cylRad = collider.radius()
        // eslint-disable-next-line no-case-declarations -- TODO
        const cylHeight = collider.halfHeight() * 2.0
        instance = this.instanceGroupArr[CYLINDER_INSTANCE_INDEX][instanceDesc.instanceId]
        instanceDesc.groupId = CYLINDER_INSTANCE_INDEX
        instanceDesc.scale = new THREE.Vector3(cylRad, cylHeight, cylRad)
        break
      case RAPIER.ShapeType.Cone:
        // eslint-disable-next-line no-case-declarations -- TODO
        const coneRad = collider.radius()
        // eslint-disable-next-line no-case-declarations -- TODO
        const coneHeight = collider.halfHeight() * 2.0
        instance = this.instanceGroupArr[CONE_INSTANCE_INDEX][instanceDesc.instanceId]
        instanceDesc.groupId = CONE_INSTANCE_INDEX
        instanceDesc.scale = new THREE.Vector3(coneRad, coneHeight, coneRad)
        break
      case RAPIER.ShapeType.TriMesh:
      case RAPIER.ShapeType.HeightField:
      case RAPIER.ShapeType.ConvexPolyhedron:
      case RAPIER.ShapeType.RoundConvexPolyhedron:
        // eslint-disable-next-line no-case-declarations -- TODO
        const geometry = new THREE.BufferGeometry()
        // eslint-disable-next-line no-case-declarations -- TODO
        let vertices: Float32Array
        // eslint-disable-next-line no-case-declarations -- TODO
        let indices: Uint32Array | undefined

        if (collider.shapeType() !== RAPIER.ShapeType.HeightField) {
          vertices = collider.vertices()
          indices = collider.indices()
        } else {
          const g = genHeightfieldGeometry(collider)
          vertices = g.vertices
          indices = g.indices
        }

        if (indices) {
          geometry.setIndex(Array.from(indices))
        }
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(vertices, 3),
        )

        // eslint-disable-next-line no-case-declarations -- TODO
        const material = new THREE.MeshPhongMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide,
          flatShading: true,
        })

        // eslint-disable-next-line no-case-declarations -- TODO
        const mesh = new THREE.Mesh(geometry, material)
        this.scene.add(mesh)
        this.coll2mesh.set(collider.handle, mesh)
        return
      default:
        console.log('Unknown shape to render')
        break
    }

    if (instance) {
      instanceDesc.elementId = instance.count
      instance.userData.elementId2coll.set(instance.count, collider)
      instance.count += 1
    }

    const highlightInstance = this.highlightInstanceArr[instanceDesc.groupId]
    highlightInstance.count = 0

    const t = collider.translation()
    const r = collider.rotation()
    dummy.position.set(t.x, t.y, t.z)
    dummy.quaternion.set(r.x, r.y, r.z, r.w)
    if (instanceDesc.scale) {
      dummy.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z)
    }
    dummy.updateMatrix()

    if (instance) {
      instance.setMatrixAt(instanceDesc.elementId, dummy.matrix)
      instance.instanceMatrix.needsUpdate = true
    }

    this.coll2instance.set(collider.handle, instanceDesc)
  }
}
