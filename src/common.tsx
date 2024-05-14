import {Group, Matrix4, Mesh} from 'three'
import {mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils'

export const mergeModelMeshes = (
    modelScene: Group,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
    customMaterial: any = undefined,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  const bufferGeometries: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  const materials: any[] = []
  const matrix4 = new Matrix4()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  modelScene.traverse((child: any) => {
    if (child.isMesh) {
      if (child.geometry?.isBufferGeometry) {
        matrix4.compose(child.position, child.quaternion, child.scale)
        child.geometry.applyMatrix4(matrix4)
        bufferGeometries.push(child.geometry)
      }

      if (child.material?.isMaterial) {
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
