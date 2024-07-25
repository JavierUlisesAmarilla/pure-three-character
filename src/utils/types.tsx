import {AnimationAction, Quaternion, Vector3} from 'three'

export type AssetType = {
  name: string;
  type: string;
  path: string;
};

export type AnimationActionMap = {
  [key: string]: AnimationAction;
};

export type AnimationMixerEvent = {
  action: AnimationAction;
  loopDelta: number;
};

export type TransformType = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

export type BoneTransformsType = {
  [key: string]: TransformType[];
};
