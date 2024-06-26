import {Vector3} from 'three'

import {AssetType} from './types'

export const IS_DEV_MODE = false

export const assetArr: AssetType[] = [
  {
    name: 'characterModel',
    type: 'model',
    path: 'models/character/scene.gltf',
  },
  {
    name: 'capsuleModel',
    type: 'model',
    path: 'models/space_capsule.glb',
  },
]

export const LIGHT_COLOR = '#FFF'
export const LIGHT_INTENSITY = 0.2
export const AXES_LENGTH = 10
export const IS_ORBIT_CONTROLS_USED = false
export const Y_VEC3 = new Vector3(0, 1, 0)
export const CAMERA_OFFSET = new Vector3(0, 1, 5)
export const FRONT_DIRECTION_VEC3 = new Vector3(0, 0, -1)
export const BACK_DIRECTION_VEC3 = new Vector3(0, 0, 1)
export const LEFT_DIRECTION_VEC3 = new Vector3(-1, 0, 0)
export const RIGHT_DIRECTION_VEC3 = new Vector3(1, 0, 0)
