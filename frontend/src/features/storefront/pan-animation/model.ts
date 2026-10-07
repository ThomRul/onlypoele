// Géométries de l'empilement fourni : corps texturés, manches inox et œufs.
import * as THREE from 'three';
import { createPanEggs } from './eggs';
import { PAN_COLORS } from './materials';
import type { PanMaterials } from './materials';
import type { FallingPan, TrackResource } from './types';

export const PAN_GRAVITY = 18;

export function createPanStack(
  scene: THREE.Scene,
  materials: PanMaterials,
  random: () => number,
  track: TrackResource,
) {
  const outerProfile = [
    [0, 0],
    [1.14, 0],
    [1.17, 0.009],
    [1.19, 0.024],
    [1.2, 0.045],
    [1.205, 0.1],
    [1.213, 0.18],
    [1.22, 0.25],
    [1.236, 0.345],
    [1.254, 0.435],
    [1.264, 0.478],
    [1.265, 0.495],
  ];
  const innerProfile = [
    [1.239, 0.487],
    [1.236, 0.468],
    [1.228, 0.425],
    [1.22, 0.39],
    [1.21, 0.335],
    [1.19, 0.235],
    [1.17, 0.145],
    [1.159, 0.119],
    [1.144, 0.104],
    [1.12, 0.1],
    [0, 0.1],
  ];
  const outerGeometry = track(
    new THREE.LatheGeometry(
      outerProfile.map(([x, y]) => new THREE.Vector2(x, y)),
      128,
    ),
  );
  const innerGeometry = track(
    new THREE.LatheGeometry(
      innerProfile.map(([x, y]) => new THREE.Vector2(x, y)),
      128,
    ),
  );
  const handleShape = new THREE.Shape();
  handleShape.moveTo(1.28, -0.13);
  handleShape.bezierCurveTo(1.56, -0.1, 1.77, -0.082, 1.96, -0.09);
  handleShape.lineTo(2.94, -0.15);
  handleShape.bezierCurveTo(3.16, -0.17, 3.16, 0.17, 2.94, 0.15);
  handleShape.lineTo(1.96, 0.09);
  handleShape.bezierCurveTo(1.77, 0.082, 1.56, 0.1, 1.28, 0.13);
  handleShape.closePath();
  const hole = new THREE.Path();
  hole.absellipse(2.95, 0, 0.073, 0.051, 0, Math.PI * 2, true);
  handleShape.holes.push(hole);
  const handleGeometry = track(
    new THREE.ExtrudeGeometry(handleShape, {
      depth: 0.075,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.014,
      bevelSegments: 5,
      curveSegments: 28,
      steps: 1,
    }),
  );
  handleGeometry.translate(0, 0, -0.0375);
  handleGeometry.rotateX(Math.PI / 2);
  const rimGeometry = track(new THREE.TorusGeometry(1.25, 0.026, 12, 128));
  const bottomRimGeometry = track(new THREE.TorusGeometry(1.155, 0.014, 12, 128));
  const baseGeometry = track(new THREE.CylinderGeometry(1.08, 1.08, 0.018, 96));
  const sphereGeometry = track(new THREE.SphereGeometry(1, 40, 24));
  const brackets = [-0.11, 0.11].map((z) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.215, 0.34, z),
      new THREE.Vector3(1.34, 0.36, z),
      new THREE.Vector3(1.53, 0.478, z * 0.68),
    ]);
    return track(new THREE.TubeGeometry(curve, 16, 0.032, 8, false));
  });
  const pans: FallingPan[] = [];
  for (let index = 0; index < 8; index++) {
    const group = new THREE.Group();
    group.name = `pan-${index + 1}`;
    const body = new THREE.Mesh(outerGeometry, materials.outside);
    body.castShadow = body.receiveShadow = true;
    group.add(body);
    const inside = new THREE.Mesh(innerGeometry, materials.coating);
    inside.receiveShadow = true;
    group.add(inside);
    const rim = new THREE.Mesh(rimGeometry, materials.material(PAN_COLORS.edge));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.495;
    group.add(rim);
    const bottomRim = new THREE.Mesh(bottomRimGeometry, materials.material(PAN_COLORS.darkPeach));
    bottomRim.rotation.x = -Math.PI / 2;
    bottomRim.position.y = 0.018;
    group.add(bottomRim);
    const base = new THREE.Mesh(baseGeometry, materials.brushed);
    base.position.y = -0.008;
    group.add(base);
    const handle = new THREE.Mesh(handleGeometry, materials.brushed);
    handle.position.y = 0.426;
    handle.rotation.z = 0.045;
    handle.castShadow = true;
    group.add(handle);
    [-0.11, 0.11].forEach((z, bracketIndex) => {
      const bracket = new THREE.Mesh(brackets[bracketIndex], materials.brushed);
      bracket.castShadow = true;
      group.add(bracket);
      const rivet = new THREE.Mesh(sphereGeometry, materials.material(PAN_COLORS.edge));
      rivet.position.set(1.205, 0.34, z);
      rivet.scale.set(0.032, 0.035, 0.035);
      rivet.castShadow = true;
      group.add(rivet);
    });
    if (index === 7) {
      createPanEggs(group, materials, random, track);
      for (let leafIndex = 0; leafIndex < 11; leafIndex++) {
        const angle = leafIndex * 2.4;
        const leaf = new THREE.Mesh(sphereGeometry, materials.material(PAN_COLORS.green));
        leaf.position.set(Math.sin(angle) * 0.87, 0.132, Math.cos(angle) * 0.87);
        leaf.scale.set(0.085, 0.01, 0.03);
        leaf.rotation.y = angle + 0.5;
        leaf.castShadow = true;
        group.add(leaf);
      }
    }
    scene.add(group);
    const targetY = 0.018 + index * 0.255;
    const startY = 7.4;
    const start = 0.15 + index * 1.04;
    const flight = Math.sqrt((2 * (startY - targetY)) / PAN_GRAVITY);
    pans.push({
      group,
      targetY,
      startY,
      start,
      flight,
      impact: start + flight,
      yaw: 0.45 + index * 2.399963,
    });
  }
  return pans;
}
