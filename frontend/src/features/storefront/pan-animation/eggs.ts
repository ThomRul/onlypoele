import * as THREE from 'three';
import type { PanMaterials } from './materials';
import type { TrackResource } from './types';

export function createPanEggs(
  parent: THREE.Group,
  materials: PanMaterials,
  random: () => number,
  track: TrackResource,
) {
  const pepperGeometry = track(new THREE.SphereGeometry(1, 8, 6));
  const yolkGeometry = track(new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2));
  for (const [x, z, angle, scale] of [
    [-0.37, -0.26, -0.4, 1],
    [0.35, 0.37, 0.36, 0.91],
  ]) {
    const egg = new THREE.Group();
    egg.position.set(x, 0.109, z);
    egg.rotation.y = angle;
    egg.scale.setScalar(scale);
    const outline = new THREE.Shape();
    const phase = random() * Math.PI * 2;
    for (let index = 0; index <= 72; index++) {
      const a = (index * Math.PI * 2) / 72;
      const radius = 1 + 0.072 * Math.sin(a * 3 + phase) + 0.038 * Math.sin(a * 7 - phase);
      const ex = 0.46 * Math.cos(a) * radius;
      const ey = 0.335 * Math.sin(a) * radius;
      if (index === 0) outline.moveTo(ex, ey);
      else outline.lineTo(ex, ey);
    }
    outline.closePath();
    const geometry = track(
      new THREE.ExtrudeGeometry(outline, {
        depth: 0.014,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.012,
        bevelSegments: 3,
        curveSegments: 32,
      }),
    );
    geometry.rotateX(-Math.PI / 2);
    const cookedEdge = new THREE.Mesh(geometry, materials.toast);
    cookedEdge.scale.set(1.025, 0.8, 1.025);
    cookedEdge.position.y = 0.008;
    egg.add(cookedEdge);
    const white = new THREE.Mesh(geometry, materials.eggWhite);
    white.position.y = 0.016;
    white.castShadow = white.receiveShadow = true;
    egg.add(white);
    const yolk = new THREE.Mesh(yolkGeometry, materials.yolk);
    yolk.position.set(0.022, 0.039, -0.012);
    yolk.scale.set(0.18, 0.113, 0.171);
    yolk.castShadow = true;
    egg.add(yolk);
    for (let index = 0; index < 14; index++) {
      const a = random() * Math.PI * 2;
      const radius = 0.23 + random() * 0.12;
      const speck = new THREE.Mesh(pepperGeometry, materials.pepper);
      speck.position.set(Math.cos(a) * radius, 0.04, Math.sin(a) * radius * 0.65);
      const size = 0.004 + random() * 0.003;
      speck.scale.set(size, size * 0.7, size);
      egg.add(speck);
    }
    parent.add(egg);
  }
}
