// Matériaux, grain et éclairage repris de l'animation fournie par l'utilisateur.
import * as THREE from 'three';
import type { TrackResource } from './types';

export const PAN_COLORS = {
  navy: 0x1c2026,
  inside: 0x22252a,
  edge: 0xcdd1d5,
  handle: 0xbac0c7,
  darkPeach: 0x53575e,
  cyan: 0x82d8e7,
  pink: 0xf0b7d9,
  white: 0xf9f8f5,
  green: 0xa5d28f,
};

export function createPanMaterials(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  random: () => number,
  track: TrackResource,
) {
  const studio = new THREE.Scene();
  studio.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(30, 24, 30),
      new THREE.MeshBasicMaterial({ color: 0x555e70, side: THREE.BackSide }),
    ),
  );
  const softbox = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    red: number,
    green: number,
    blue: number,
  ) => {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(red, green, blue),
        side: THREE.DoubleSide,
      }),
    );
    panel.position.set(x, y, z);
    panel.lookAt(0, 1, 0);
    studio.add(panel);
  };
  softbox(-5, 6, 6, 6, 9, 5, 4.8, 4.4);
  softbox(6, 3, 1, 2, 8, 3, 3.6, 4.2);
  softbox(0, 9, -3, 7, 3, 3.6, 3.7, 4);
  softbox(-3, 2, -7, 2, 6, 1.6, 1.5, 1.4);
  let pmrem: THREE.PMREMGenerator | undefined;
  try {
    pmrem = new THREE.PMREMGenerator(renderer);
    const environment = track(pmrem.fromScene(studio, 0.025));
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.62;
  } finally {
    pmrem?.dispose();
    studio.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
  }

  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = grainCanvas.height = 256;
  const context = grainCanvas.getContext('2d');
  if (!context) throw new Error('Texture de la poêle indisponible');
  const pixels = context.createImageData(256, 256);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const value = Math.floor(173 + random() * 82);
    pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = value;
    pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const grain = track(new THREE.CanvasTexture(grainCanvas));
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(3, 2);
  grain.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const coating = track(
    new THREE.MeshPhysicalMaterial({
      color: PAN_COLORS.inside,
      metalness: 0.09,
      roughness: 0.73,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.007,
      clearcoat: 0.13,
      clearcoatRoughness: 0.48,
      envMapIntensity: 0.78,
    }),
  );
  const outside = track(
    new THREE.MeshStandardMaterial({
      color: PAN_COLORS.navy,
      metalness: 0.24,
      roughness: 0.46,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.003,
      envMapIntensity: 0.95,
    }),
  );
  const brushed = track(
    new THREE.MeshPhysicalMaterial({
      color: PAN_COLORS.handle,
      metalness: 0.96,
      roughness: 0.32,
      anisotropy: 0.4,
      anisotropyRotation: 0,
      envMapIntensity: 1,
    }),
  );
  const polished = track(
    new THREE.MeshStandardMaterial({
      color: PAN_COLORS.edge,
      metalness: 0.98,
      roughness: 0.21,
    }),
  );
  const palette = new Map<number, THREE.Material>([
    [PAN_COLORS.edge, polished],
    [PAN_COLORS.handle, brushed],
    [PAN_COLORS.navy, outside],
    [PAN_COLORS.inside, coating],
  ]);
  const material = (color: number) => {
    let cached = palette.get(color);
    if (!cached) {
      cached = track(
        new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.54,
          metalness: 0,
          clearcoat: 0.05,
          clearcoatRoughness: 0.5,
        }),
      );
      palette.set(color, cached);
    }
    return cached;
  };
  const eggWhite = track(
    new THREE.MeshPhysicalMaterial({
      color: PAN_COLORS.white,
      roughness: 0.45,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.45,
    }),
  );
  const yolk = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf7ba35,
      roughness: 0.23,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
      metalness: 0,
      envMapIntensity: 0.7,
    }),
  );
  const toast = track(new THREE.MeshStandardMaterial({ color: 0xb98241, roughness: 0.76 }));
  const pepper = track(new THREE.MeshStandardMaterial({ color: 0x412e20, roughness: 0.9 }));
  return { coating, outside, brushed, eggWhite, yolk, toast, pepper, material };
}

export type PanMaterials = ReturnType<typeof createPanMaterials>;

export function createPanLighting(scene: THREE.Scene, track: TrackResource) {
  scene.add(new THREE.HemisphereLight(0xfff4e7, 0x406090, 0.65));
  const key = new THREE.DirectionalLight(0xffedda, 3);
  key.position.set(-4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 8, bottom: -3, far: 25 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.045;
  key.shadow.radius = 3;
  track(key.shadow);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb8dfff, 0.8);
  fill.position.set(5, 4, -3);
  scene.add(fill);

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Ombre de la poêle indisponible');
  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,29,74,.52)');
  gradient.addColorStop(0.5, 'rgba(0,29,74,.24)');
  gradient.addColorStop(1, 'rgba(0,29,74,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = track(new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(5.5, 3.4)),
    track(new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.25, -0.055, 0.18);
  scene.add(shadow);
  return shadow;
}
