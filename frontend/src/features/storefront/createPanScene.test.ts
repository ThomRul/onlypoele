import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPanScene } from './createPanScene';

const state = vi.hoisted(() => ({
  render: vi.fn(),
  setAnimationLoop: vi.fn(),
  dispose: vi.fn(),
  visibility: undefined as ((entries: { isIntersecting: boolean }[]) => void) | undefined,
  disconnect: vi.fn(),
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = document.createElement('canvas');
      setPixelRatio() {}
      setSize() {}
      render = state.render;
      setAnimationLoop = state.setAnimationLoop;
      dispose = state.dispose;
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
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

describe('cycle de vie de la scène Three.js', () => {
  it('suspend le rendu hors écran et permet une pause manuelle', () => {
    const host = document.createElement('div');
    const scene = createPanScene(host);
    expect(state.setAnimationLoop).toHaveBeenLastCalledWith(expect.any(Function));
    state.visibility?.([{ isIntersecting: false }]);
    expect(state.setAnimationLoop).toHaveBeenLastCalledWith(null);
    state.visibility?.([{ isIntersecting: true }]);
    scene.setPaused(true);
    expect(state.setAnimationLoop).toHaveBeenLastCalledWith(null);
    scene.setPaused(false);
    expect(state.setAnimationLoop).toHaveBeenLastCalledWith(expect.any(Function));
    scene.dispose();
  });

  it('suspend le rendu dans un onglet masqué', () => {
    const scene = createPanScene(document.createElement('div'));
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new window.Event('visibilitychange'));
    expect(state.setAnimationLoop).toHaveBeenLastCalledWith(null);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new window.Event('visibilitychange'));
    expect(state.setAnimationLoop).toHaveBeenLastCalledWith(expect.any(Function));
    scene.dispose();
  });

  it('libère le renderer, retire le canvas et garde le secours lors de la perte de contexte', () => {
    const host = document.createElement('div');
    const unavailable = vi.fn();
    const scene = createPanScene(host, unavailable);
    expect(host.querySelector('canvas')).not.toBeNull();
    host
      .querySelector('canvas')
      ?.dispatchEvent(new window.Event('webglcontextlost', { cancelable: true }));
    expect(state.dispose).toHaveBeenCalledTimes(1);
    expect(state.disconnect).toHaveBeenCalled();
    expect(host.querySelector('canvas')).toBeNull();
    expect(host.dataset.sceneReady).toBeUndefined();
    expect(unavailable).toHaveBeenCalledOnce();
    scene.dispose();
    expect(state.dispose).toHaveBeenCalledTimes(1);
  });
});
