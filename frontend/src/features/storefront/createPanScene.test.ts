import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Scene } from 'three';
import { createPanScene } from './createPanScene';

const state = vi.hoisted(() => ({
  render: vi.fn(),
  dispose: vi.fn(),
  environmentDispose: vi.fn(),
  visibility: undefined as ((entries: { isIntersecting: boolean }[]) => void) | undefined,
  disconnect: vi.fn(),
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = document.createElement('canvas');
      shadowMap = { enabled: false, type: 0 };
      capabilities = { getMaxAnisotropy: () => 8 };
      setPixelRatio() {}
      setClearColor() {}
      setSize() {}
      render = state.render;
      dispose = state.dispose;
    },
    PMREMGenerator: class {
      fromScene() {
        return { texture: new actual.Texture(), dispose: state.environmentDispose };
      }
      dispose() {}
    },
  };
});

let now = 0;
let nextFrame = 0;
const frames = new Map<number, FrameRequestCallback>();
const controllers: ReturnType<typeof createPanScene>[] = [];
const hosts: HTMLDivElement[] = [];

function advance(milliseconds: number) {
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 40) {
    now += 40;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
  }
}

function mountScene() {
  const host = document.createElement('div');
  host.append(document.createElement('img'));
  document.body.append(host);
  hosts.push(host);
  const controller = createPanScene(host);
  controllers.push(controller);
  return { host, controller };
}

beforeEach(() => {
  vi.clearAllMocks();
  now = nextFrame = 0;
  frames.clear();
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => frames.delete(id));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }),
    putImageData() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    fillRect() {},
  } as unknown as CanvasRenderingContext2D);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof state.visibility) {
        state.visibility = callback;
      }
      observe() {}
      disconnect = state.disconnect;
    },
  );
});

afterEach(() => {
  controllers.splice(0).forEach((controller) => controller.dispose());
  hosts.splice(0).forEach((host) => host.remove());
  frames.clear();
  vi.unstubAllGlobals();
});

describe('empilement Three.js joué une seule fois', () => {
  it('empile les huit poêles puis garde la pose finale après un retour dans la section', () => {
    const { host } = mountScene();
    expect(frames.size).toBe(0);
    state.visibility?.([{ isIntersecting: true }]);
    const counts = new Set<string>();
    for (let elapsed = 0; elapsed < 12000; elapsed += 200) {
      counts.add(host.dataset.stacked!);
      advance(200);
    }
    expect([...counts]).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
    expect(host.dataset.finished).toBe('true');
    expect(frames.size).toBe(0);
    const scene = state.render.mock.lastCall![0] as Scene;
    expect(scene.children.filter((child) => /^pan-[1-8]$/.test(child.name))).toHaveLength(8);
    const positions = scene.children.map((child) => child.position.toArray());
    state.visibility?.([{ isIntersecting: false }]);
    advance(5000);
    state.visibility?.([{ isIntersecting: true }]);
    window.dispatchEvent(new Event('resize'));
    advance(1000);
    expect(host.dataset.stacked).toBe('8');
    expect(host.dataset.finished).toBe('true');
    expect(scene.children.map((child) => child.position.toArray())).toEqual(positions);
    expect(frames.size).toBe(0);
  });

  it('suspend hors écran et dans un onglet masqué sans recommencer ni sauter la suite', () => {
    const { host } = mountScene();
    state.visibility?.([{ isIntersecting: true }]);
    advance(1800);
    const count = host.dataset.stacked;
    expect(Number(count)).toBeGreaterThan(0);
    expect(Number(count)).toBeLessThan(8);
    state.visibility?.([{ isIntersecting: false }]);
    advance(5000);
    expect(frames.size).toBe(0);
    expect(host.dataset.stacked).toBe(count);
    state.visibility?.([{ isIntersecting: true }]);
    advance(40);
    expect(host.dataset.stacked).toBe(count);
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    advance(5000);
    expect(frames.size).toBe(0);
    expect(host.dataset.stacked).toBe(count);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    advance(40);
    expect(host.dataset.stacked).toBe(count);
    advance(12000);
    expect(host.dataset.stacked).toBe('8');
    expect(host.dataset.finished).toBe('true');
  });

  it('libère le GPU une seule fois et conserve le secours lors de la perte de contexte', () => {
    const { host, controller } = mountScene();
    state.visibility?.([{ isIntersecting: true }]);
    host
      .querySelector('canvas')!
      .dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(state.dispose).toHaveBeenCalledOnce();
    expect(state.environmentDispose).toHaveBeenCalledOnce();
    expect(state.disconnect).toHaveBeenCalled();
    expect(host.querySelector('canvas')).toBeNull();
    expect(host.querySelector('img')).not.toBeNull();
    expect(host.dataset.sceneReady).toBeUndefined();
    expect(frames.size).toBe(0);
    controller.dispose();
    expect(state.dispose).toHaveBeenCalledOnce();
    expect(state.environmentDispose).toHaveBeenCalledOnce();
  });
});
