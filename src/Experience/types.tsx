import {AnimationAction} from 'three'

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
