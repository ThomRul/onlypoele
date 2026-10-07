import * as THREE from 'three';
import { PAN_COLORS } from './materials';
import { PAN_GRAVITY } from './model';
import type { FallingPan, TrackResource } from './types';

export function createPanMotion(
  scene: THREE.Scene,
  pans: FallingPan[],
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
  random: () => number,
  track: TrackResource,
) {
  const confettiGeometry = track(new THREE.CapsuleGeometry(0.18, 0.65, 5, 12));
  const confettiMaterials = [0xffcd78, PAN_COLORS.cyan, PAN_COLORS.pink].map((color) =>
    track(new THREE.MeshBasicMaterial({ color })),
  );
  const particles = Array.from({ length: 8 * 12 }, (_, index) => {
    const mesh = new THREE.Mesh(confettiGeometry, confettiMaterials[index % 3]);
    mesh.visible = false;
    scene.add(mesh);
    const angle = random() * Math.PI * 2;
    const speed = 0.9 + random() * 1.2;
    return {
      mesh,
      pan: Math.floor(index / 12),
      vx: Math.cos(angle) * speed,
      vz: Math.sin(angle) * speed,
      vy: 1.4 + random() * 1.3,
      radius: 0.98 + random() * 0.25,
    };
  });
  const finishTime = pans[pans.length - 1].impact + 1.6;

  function draw(time: number) {
    let stacked = 0;
    pans.forEach((pan, index) => {
      const local = time - pan.start;
      pan.group.visible = local >= 0;
      if (local < 0) return;
      const progress = Math.min(1, local / pan.flight);
      let y = pan.startY - 0.5 * PAN_GRAVITY * Math.min(local, pan.flight) ** 2;
      let tiltX = 0.38 * (1 - progress) ** 2;
      let tiltZ = -0.22 * (1 - progress) ** 2;
      if (local >= pan.flight) {
        stacked++;
        const after = local - pan.flight;
        const bounce = Math.abs(Math.sin(after * 10.5));
        y = pan.targetY + 0.28 * Math.exp(-after * 4) * bounce;
        tiltX = Math.sin(after * 13) * 0.08 * Math.exp(-after * 4.5) * bounce;
        tiltZ = Math.sin(after * 11) * 0.045 * Math.exp(-after * 4.5) * bounce;
        y += 1.26 * (Math.abs(Math.sin(tiltX)) + Math.abs(Math.sin(tiltZ)));
      }
      pan.group.position.set(
        0.22 * Math.sin(index * 1.7) * (1 - progress),
        y,
        0.15 * Math.cos(index * 2.1) * (1 - progress),
      );
      pan.group.rotation.set(tiltX, pan.yaw + 1.15 * (1 - progress) ** 2, tiltZ, 'YXZ');
    });
    for (const particle of particles) {
      const pan = pans[particle.pan];
      const elapsed = time - pan.impact;
      particle.mesh.visible = elapsed >= 0 && elapsed < 0.55;
      if (!particle.mesh.visible) continue;
      const angle = Math.atan2(particle.vz, particle.vx);
      particle.mesh.position.set(
        Math.cos(angle) * particle.radius + particle.vx * elapsed,
        pan.targetY + 0.35 + particle.vy * elapsed - 5 * elapsed * elapsed,
        Math.sin(angle) * particle.radius + particle.vz * elapsed,
      );
      particle.mesh.rotation.set(elapsed * 5, elapsed * 7, elapsed * 9);
      const size = 0.1 * (1 - elapsed / 0.55);
      particle.mesh.scale.set(size, size, size * 0.28);
    }
    shadow.material.opacity = 0.42 + 0.58 * Math.min(1, stacked / 3);
    return stacked;
  }
  return { draw, finishTime };
}
