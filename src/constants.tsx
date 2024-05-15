import {AssetType} from './types'

export const IS_DEV_MODE = true

export const assetArr: AssetType[] = [
  {
    name: 'groundModel',
    type: 'model',
    path: 'models/container.glb',
  },
  {
    name: 'characterModel',
    type: 'model',
    path: 'models/character/scene.gltf',
  },
]

export const LIGHT_COLOR = '#FFF'
export const LIGHT_INTENSITY = 0.2
export const AXES_LENGTH = 10
export const IS_ORBIT_CONTROLS_USED = false
