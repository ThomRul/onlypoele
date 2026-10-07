// Intégration React/TypeScript de l'animation d'empilement fournie par l'utilisateur.
import * as THREE from 'three';
import { createPanLighting, createPanMaterials } from './pan-animation/materials';
import { createPanStack } from './pan-animation/model';
import { createPanMotion } from './pan-animation/motion';
import type { PanSceneController, TrackResource } from './pan-animation/types';
export type { PanSceneController } from './pan-animation/types';

export function createPanScene(host: HTMLDivElement): PanSceneController {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 4, -4, 0.1, 60);
  const resources = new Set<{ dispose(): void }>();
  const cleanup: (() => void)[] = [];
  const abort = new AbortController();
  let disposed = false;
  let frameId = 0;
  const track: TrackResource = (resource) => {
    resources.add(resource);
    return resource;
  };

  function dispose() {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    abort.abort();
    cleanup.splice(0).forEach((remove) => remove());
    resources.forEach((resource) => resource.dispose());
    resources.clear();
    scene.clear();
    scene.environment = null;
    renderer.dispose();
    renderer.domElement.remove();
    delete host.dataset.sceneReady;
    delete host.dataset.stacked;
    delete host.dataset.finished;
  }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    let seed = 84513;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const materials = createPanMaterials(renderer, scene, random, track);
    const shadow = createPanLighting(scene, track);
    const pans = createPanStack(scene, materials, random, track);
    const motion = createPanMotion(scene, pans, shadow, random, track);
    let time = 0;
    let finished = false;
    let visible = typeof IntersectionObserver === 'undefined';
    let previousFrame = performance.now();
    const yaw = 0.32;
    const pitch = 0.88;
    const target = new THREE.Vector3(0, 2.15, 0);

    function publish(stacked: number) {
      host.dataset.stacked = String(stacked);
      host.dataset.finished = String(finished);
    }
    function requestRender() {
      if (!disposed && visible && !document.hidden && !frameId)
        frameId = window.requestAnimationFrame(frame);
    }
    function frame(now: number) {
      frameId = 0;
      if (disposed || !visible || document.hidden) return;
      if (!host.isConnected) {
        dispose();
        return;
      }
      const delta = Math.min(Math.max(0, (now - previousFrame) / 1000), 0.04);
      previousFrame = now;
      if (!finished) time = Math.min(time + delta, motion.finishTime);
      finished = time >= motion.finishTime;
      publish(motion.draw(time));
      renderer.render(scene, camera);
      if (!finished) requestRender();
    }
    function updateCamera() {
      camera.position.set(
        16 * Math.sin(pitch) * Math.sin(yaw),
        target.y + 16 * Math.cos(pitch),
        16 * Math.sin(pitch) * Math.cos(yaw),
      );
      camera.lookAt(target);
      camera.updateMatrixWorld();
    }
    function resize() {
      if (disposed) return;
      const { width, height } = host.getBoundingClientRect();
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      const aspect = w / h;
      const span = Math.max(6.8, 7.3 / aspect);
      camera.left = (-span * aspect) / 2;
      camera.right = (span * aspect) / 2;
      camera.top = span / 2;
      camera.bottom = -span / 2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(Math.round(w), Math.round(h), false);
      updateCamera();
      requestRender();
    }
    function suspend() {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      previousFrame = performance.now();
    }
    const canvas = renderer.domElement;
    canvas.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        dispose();
      },
      { signal: abort.signal },
    );
    document.addEventListener(
      'visibilitychange',
      () => {
        suspend();
        requestRender();
      },
      { signal: abort.signal },
    );
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(host);
    cleanup.push(() => resizeObserver?.disconnect());
    window.addEventListener('resize', resize, { signal: abort.signal });
    const intersection =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            suspend();
            requestRender();
          });
    intersection?.observe(host);
    cleanup.push(() => intersection?.disconnect());
    resize();
    publish(motion.draw(time));
    renderer.render(scene, camera);
    host.append(canvas);
    host.dataset.sceneReady = 'true';
    requestRender();
    return { dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
