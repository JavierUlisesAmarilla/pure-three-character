import {
  AnimationAction,
  BufferGeometry,
  Group,
  Matrix4,
  Mesh,
  Object3D,
  SkinnedMesh,
} from 'three'
import {mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils'

export const mergeModelMeshes = (
    modelScene: Group,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
    customMaterial: any = undefined,
) => {
  const bufferGeometries: BufferGeometry[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  const materials: any[] = []
  const matrix4 = new Matrix4()

  modelScene.traverse((child) => {
    if (child instanceof Mesh) {
      if (child.geometry.isBufferGeometry) {
        matrix4.compose(child.position, child.quaternion, child.scale)
        child.geometry.applyMatrix4(matrix4)
        bufferGeometries.push(child.geometry)
      }

      if (child.material.isMaterial) {
        materials.push(child.material)
      }
    }
  })

  const material = customMaterial ? customMaterial : materials
  const useGroups = Array.isArray(material)
  const mergedBufferGeometry = mergeBufferGeometries(
      bufferGeometries,
      useGroups,
  )
  mergedBufferGeometry.computeBoundingBox()
  const mergedMesh = new Mesh(mergedBufferGeometry, material)
  return mergedMesh
}

export const getChildMeshArr = (object: Object3D) => {
  const childMeshArr: Object3D[] = []
  object.traverse((child) => {
    if (child instanceof Mesh && !(child instanceof SkinnedMesh)) {
      childMeshArr.push(child)
    }
  })
  return childMeshArr
}

export const getTrackFromAction = (
    action: AnimationAction,
    trackName: string,
) => action.getClip().tracks.find((value) => value.name === trackName)
