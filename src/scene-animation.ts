import { AnimationMixer, LoopOnce, type AnimationClip, type Object3D } from 'three';

/** A mixer sampled exactly at or beyond a clip boundary can wrap to its first key. */
export function sampleClip(mixer: AnimationMixer, clip: AnimationClip, time: number): void {
  mixer.setTime(Math.min(Math.max(time, 0), Math.max(0, clip.duration - 0.0001)));
}

export function activateClip(mixer: AnimationMixer, clip: AnimationClip): void {
  const action = mixer.clipAction(clip).reset();
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
}

export function captureRestPose(root: Object3D): () => void {
  const rest: Array<{ object: Object3D; position: Object3D['position']; quaternion: Object3D['quaternion']; scale: Object3D['scale'] }> = [];
  root.traverse(object => rest.push({ object, position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() }));
  return () => { for (const entry of rest) { entry.object.position.copy(entry.position); entry.object.quaternion.copy(entry.quaternion); entry.object.scale.copy(entry.scale); } };
}
