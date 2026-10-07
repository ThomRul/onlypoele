import type * as THREE from 'three';

export type TrackResource = <T extends { dispose(): void }>(resource: T) => T;

export interface FallingPan {
  group: THREE.Group;
  targetY: number;
  startY: number;
  start: number;
  flight: number;
  impact: number;
  yaw: number;
}

export interface PanSceneController {
  dispose: () => void;
}
