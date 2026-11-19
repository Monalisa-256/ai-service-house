import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { activateClip, captureRestPose, sampleClip } from './scene-animation.ts';
import type { SceneCue, SceneRoom } from './scene-cues.ts';
import { sceneAssets } from './scene-cues.ts';

class SceneError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="scene-fallback" role="status">The 3D view is unavailable on this device or connection. Continue with the complete lesson below.</p> : this.props.children; }
}
export type ViewportView = { room: SceneRoom; cue: SceneCue | null; noticeInContext?: boolean; proposalVisible?: boolean };
function Model({ room, cue, time, view }: { room: SceneRoom; cue: SceneCue | null; time: number; view: ViewportView }) {
  const gltf = useLoader(GLTFLoader, sceneAssets[room]);
  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf.scene]);
  const restorePose = useMemo(() => captureRestPose(gltf.scene), [gltf.scene]);
  const clip = gltf.animations.find(animation => animation.name === cue?.clip);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    mixer.stopAllAction();
    restorePose();
    if (clip) { activateClip(mixer, clip); sampleClip(mixer, clip, time); }
    invalidate();
    return () => { mixer.stopAllAction(); };
  }, [clip, mixer, invalidate, restorePose]);
  useEffect(() => { if (clip) sampleClip(mixer, clip, time); invalidate(); }, [time, clip, mixer, invalidate]);
  useEffect(() => {
    const animating = !!cue && time < cue.duration;
    const noticeVisible = view.noticeInContext || animating;
    if (room === 'briefing' || room === 'library' || room === 'service-counter') {
      for (const name of ['CurrentNoticeCard', 'NoticeLabel']) {
        const object = gltf.scene.getObjectByName(name);
        if (object) object.visible = room === 'service-counter' ? true : noticeVisible;
      }
      const proposal = gltf.scene.getObjectByName('ProposalCard');
      if (proposal) proposal.visible = !!view.proposalVisible || animating;
    }
    invalidate();
  }, [room, view.noticeInContext, view.proposalVisible, cue?.id, time, gltf.scene, invalidate]);
  return <primitive object={gltf.scene} />;
}
type SearchDesk = {cards: string[]; moveUp: (rank:number)=>void; widen:()=>void};
function PassageCards({desk}: {desk:SearchDesk}) {
  return <group>
    <mesh position={[1.88,1.47,-0.67]} onClick={event=>{event.stopPropagation();desk.widen();}}>
      <boxGeometry args={[0.52,0.34,0.055]}/><meshStandardMaterial color="#d57d40"/>
    </mesh>
    {desk.cards.map((id,i)=><mesh key={id} position={[-1.38+i*0.53,1.09,0.82]} onClick={event=>{event.stopPropagation();desk.moveUp(i);}}>
      <boxGeometry args={[0.47,0.035,0.38]}/><meshStandardMaterial color={id.startsWith('p-notice')?'#d57d40':id.startsWith('p-hours')?'#f4e4bc':'#78b2a4'}/>
    </mesh>)}
  </group>;
}
export function SceneViewport({ view, time, reduced, desk }: { view: ViewportView; time: number; reduced: boolean; desk?:SearchDesk }) {
  const { room, cue } = view;
  return <SceneError key={room}><div className="scene-canvas"><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [4.8, 3.5, 6.2], fov: 39, near: 0.1, far: 30 }} fallback={<p className="scene-fallback" role="status">WebGL is unavailable. Continue with the complete lesson below.</p>} gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }} onCreated={({ gl, camera }) => { gl.setClearColor('#e8e5da'); camera.lookAt(0, 1.1, 0); }}>{desk&&<PassageCards desk={desk}/>}<ambientLight intensity={2.1}/><directionalLight position={[2, 6, 4]} intensity={2.2}/><Suspense fallback={null}><Model room={room} cue={reduced ? null : cue} time={reduced ? 0 : time} view={view}/></Suspense></Canvas></div></SceneError>;
}
