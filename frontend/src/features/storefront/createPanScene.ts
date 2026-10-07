import * as THREE from 'three';

export interface PanSceneController {
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

export function createPanScene(
  host: HTMLDivElement,
  onUnavailable?: () => void,
): PanSceneController {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.65;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.addEventListener('webglcontextlost', contextLost);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 30);
  camera.position.set(0.35, 4.8, 5.4);
  camera.lookAt(0.45, 0, 0);
  scene.add(new THREE.HemisphereLight('#fff6eb', '#6073a9', 3));
  const key = new THREE.DirectionalLight('#ffffff', 4.5);
  key.position.set(-3, 5, 3);
  scene.add(key);
  const rimLight = new THREE.DirectionalLight('#ffb781', 3);
  rimLight.position.set(3, 2, -3);
  scene.add(rimLight);

  const pan = new THREE.Group();
  scene.add(pan);
  const metal = new THREE.MeshStandardMaterial({
    color: '#263447',
    roughness: 0.38,
    metalness: 0.55,
  });
  const brass = new THREE.MeshStandardMaterial({
    color: '#d5824c',
    roughness: 0.3,
    metalness: 0.65,
  });
  const wood = new THREE.MeshStandardMaterial({ color: '#c26539', roughness: 0.8 });
  const profile = [
    [0, -0.24],
    [0.87, -0.24],
    [0.98, -0.16],
    [1.05, 0.13],
    [1.02, 0.17],
    [0.97, 0.13],
    [0.9, -0.1],
    [0, -0.1],
  ];
  pan.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(
        profile.map(([x, y]) => new THREE.Vector2(x, y)),
        72,
      ),
      metal,
    ),
  );
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.025, 12, 72), brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.15;
  pan.add(rim);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.42, 24), brass);
  collar.rotation.z = Math.PI / 2;
  collar.position.set(1.12, 0.03, 0);
  pan.add(collar);
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1.1, 8, 24), wood);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(1.91, 0.08, 0);
  pan.add(handle);

  const white = new THREE.MeshStandardMaterial({ color: '#fff4dc', roughness: 0.78 });
  const yellow = new THREE.MeshStandardMaterial({ color: '#ffa915', roughness: 0.38 });
  for (const [x, z, scale] of [
    [-0.26, -0.27, 1],
    [0.32, 0.35, 0.8],
  ]) {
    const egg = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), white);
    egg.scale.set(0.47 * scale, 0.045, 0.35 * scale);
    egg.position.set(x, -0.04, z);
    pan.add(egg);
    const yolk = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), yellow);
    yolk.scale.set(0.17 * scale, 0.075, 0.17 * scale);
    yolk.position.set(x + 0.04, 0.02, z);
    pan.add(yolk);
  }
  const green = new THREE.MeshStandardMaterial({ color: '#457244', roughness: 0.9 });
  for (let index = 0; index < 7; index++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), green);
    leaf.scale.set(0.045, 0.015, 0.1);
    const angle = index * 2.4;
    leaf.position.set(Math.cos(angle) * 0.65, -0.045, Math.sin(angle) * 0.64);
    leaf.rotation.y = angle;
    pan.add(leaf);
  }

  let paused = false;
  let visible = true;
  let disposed = false;
  let time = 0;
  let lastFrame = 0;
  const pointer = new THREE.Vector2();
  const easedPointer = new THREE.Vector2();
  const orientation = new THREE.Vector2();

  function render(frame: number) {
    const delta = lastFrame ? Math.min((frame - lastFrame) / 1000, 0.05) : 0;
    lastFrame = frame;
    time += delta;
    easedPointer.lerp(pointer, 1 - Math.exp(-delta * 4));
    orientation.set(Math.sin(time * 0.38) * 0.045, Math.sin(time * 0.25) * 0.09);
    pan.rotation.set(
      orientation.x + easedPointer.y * 0.05,
      -0.55 + orientation.y + easedPointer.x * 0.07,
      -0.12,
    );
    pan.position.y = Math.sin(time * 0.75) * 0.045;
    renderer.render(scene, camera);
  }
  function updateLoop() {
    lastFrame = 0;
    renderer.setAnimationLoop(!paused && visible && !document.hidden && !disposed ? render : null);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || disposed) return;
    camera.aspect = width / height;
    camera.position.set(0.35, camera.aspect < 1 ? 6 : 4.8, camera.aspect < 1 ? 6.8 : 5.4);
    camera.lookAt(0.45, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  }
  function move(event: PointerEvent) {
    if (paused || event.pointerType === 'touch') return;
    const bounds = host.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
    );
  }
  function leave() {
    pointer.set(0, 0);
  }
  function contextLost(event: Event) {
    event.preventDefault();
    dispose();
    onUnavailable?.();
  }
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  const intersection =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          updateLoop();
        });

  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    observer?.disconnect();
    intersection?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', updateLoop);
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerleave', leave);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        for (const material of Array.isArray(object.material) ? object.material : [object.material])
          materials.add(material);
      }
    });
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    delete host.dataset.sceneReady;
  }

  observer?.observe(host);
  intersection?.observe(host);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', updateLoop);
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerleave', leave);
  pan.rotation.set(0, -0.55, -0.12);
  resize();
  host.append(renderer.domElement);
  host.dataset.sceneReady = 'true';
  updateLoop();
  return {
    setPaused(value) {
      paused = value;
      updateLoop();
    },
    dispose,
  };
}
