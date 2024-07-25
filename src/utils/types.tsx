import {AnimationAction, Euler, Vector3} from 'three'

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
  rotation: Euler;
  scale: Vector3;
};

export type BoneTransformsType = {
  [key: string]: TransformType[];
};
