import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { SceneView } from './scene-view.ts';
import type { SceneCue, SceneRoom } from './scene-cues.ts';
import { sceneAssets } from './scene-cues.ts';

class SceneError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="scene-fallback" role="status">The 3D asset could not load. The complete 2D lesson remains below.</p> : this.props.children; }
}
function Model({ room, cue, time, view }: { room: SceneRoom; cue: SceneCue | null; time: number; view: SceneView }) {
  const gltf = useLoader(GLTFLoader, sceneAssets[room]);
  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf.scene]);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    mixer.stopAllAction();
    const clip = gltf.animations.find(animation => animation.name === cue?.clip);
    if (clip) mixer.clipAction(clip).reset().play();
    mixer.setTime(time); invalidate();
    return () => { mixer.stopAllAction(); };
  }, [cue?.clip, gltf.animations, mixer, invalidate]);
  useEffect(() => { mixer.setTime(time); invalidate(); }, [time, mixer, invalidate]);
  useEffect(() => {
    const animating = !!cue && time < cue.duration;
    const noticeVisible = view.noticeInContext || animating;
    for (const name of ['CurrentNoticeCard', 'NoticeLabel']) {
      const object = gltf.scene.getObjectByName(name);
      if (object) object.visible = room === 'service-counter' ? true : noticeVisible;
    }
    const proposal = gltf.scene.getObjectByName('ProposalCard');
    if (proposal) proposal.visible = view.proposalVisible || animating;
    invalidate();
  }, [room, view.noticeInContext, view.proposalVisible, cue?.id, time, gltf.scene, invalidate]);
  return <primitive object={gltf.scene} />;
}
export function SceneViewport({ view, time, reduced }: { view: SceneView; time: number; reduced: boolean }) {
  const { room, cue } = view;
  return <SceneError key={room}><div className="scene-canvas"><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [4.8, 3.5, 6.2], fov: 39, near: 0.1, far: 30 }} fallback={<p className="scene-fallback">WebGL is unavailable. Continue with the complete 2D lesson below.</p>} gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }} onCreated={({ gl, camera }) => { gl.setClearColor('#e8e5da'); camera.lookAt(0, 1.1, 0); }}><ambientLight intensity={2.1}/><directionalLight position={[2, 6, 4]} intensity={2.2}/><Suspense fallback={null}><Model room={room} cue={reduced ? null : cue} time={reduced ? 0 : time} view={view}/></Suspense></Canvas></div></SceneError>;
}
