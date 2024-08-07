import {Vector3} from 'three'

import {AssetType} from './types'

export const IS_AXES_HELPER_VISIBLE = false
export const IS_PHYSICS_HELPER_VISIBLE = false
export const IS_ORBIT_CONTROLS_USED = false
export const IS_SKELETON_VISIBLE = false
export const AXES_LENGTH = 10
export const LIGHT_COLOR = '#FFF'
export const LIGHT_INTENSITY = 0.2
export const Y_VEC3 = new Vector3(0, 1, 0)
export const Z_VEC3 = new Vector3(0, 0, 1)
export const CAMERA_OFFSET = new Vector3(0, 1, 5)
export const FRONT_DIRECTION_VEC3 = new Vector3()

export const assetArr: AssetType[] = [
  // {
  //   name: 'capsuleModel',
  //   type: 'glb',
  //   path: 'models/space_capsule.glb',
  // },
  {
    name: 'capsuleModel',
    type: 'glb',
    path: 'models/capsule.glb',
  },
  // {
  //   name: 'readyPlayerMeModel',
  //   type: 'glb',
  //   path: 'models/ready_player_me/ready_player_me.glb',
  // },
  {
    name: 'fStandingIdle001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/F_Standing_Idle_001.fbx',
  },
  {
    name: 'fWalk002Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/F_Walk_002.fbx',
  },
  {
    name: 'fWalkBackwards001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/F_Walk_Backwards_001.fbx',
  },
  {
    name: 'fWalkJump002Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/F_Walk_Jump_002.fbx',
  },
  {
    name: 'fWalkStrafeLeft001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/F_Walk_Strafe_Left_001.fbx',
  },
  {
    name: 'fWalkStrafeRight001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/F_Walk_Strafe_Right_001.fbx',
  },
  {
    name: 'mJog001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/M_Jog_001.fbx',
  },
  {
    name: 'mJogBackwards001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/M_Jog_Backwards_001.fbx',
  },
  {
    name: 'mJogJump001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/M_Jog_Jump_001.fbx',
  },
  {
    name: 'mJogStrafeLeft001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/M_Jog_Strafe_Left_001.fbx',
  },
  {
    name: 'mJogStrafeRight001Model',
    type: 'fbx',
    path: 'models/ready_player_me/animations/M_Jog_Strafe_Right_001.fbx',
  },
  {
    name: 'masculineTPoseModel',
    type: 'fbx',
    path: 'models/ready_player_me/animations/Masculine_TPose.fbx',
  },
]
