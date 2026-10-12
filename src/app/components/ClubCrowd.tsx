// @ts-nocheck - TypeScript types for React Three Fiber should work after restarting TS server
import { useMemo, useRef } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

// Everything in the club moves to one tempo: dancers dip on the beat, lights pulse on it.
export const BPM = 124;
/** Beats elapsed at scene time `t` (seconds). */
export const beats = (t: number) => (t * BPM) / 60;
/** Kick envelope: 1 on each beat, decaying quickly until the next one. */
export const kick = (b: number) => Math.exp(-(b - Math.floor(b)) * 5);

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Two rigged bodies on Mixamo-style skeletons (decimated, textures stripped, merged
// to one draw call each): a = masc, clothed with hair (three.js examples'
// readyplayer.me avatar), b = femme with hair (three.js examples' Michelle).
// zach = the DJ, a MetaPerson avatar of Zach that keeps its own textures.
const BODY_URLS = { a: '/models/dancer-a.glb', b: '/models/dancer-b.glb', zach: '/models/dj-zach.glb' } as const;
type Body = keyof typeof BODY_URLS;
export type DanceStyle = 'pump' | 'up' | 'groove' | 'sway';

const HEIGHT = 1.75; // meters, before per-dancer height variation

// One shared matte near-black material keeps everyone a silhouette; the backlight
// and beams still pick out their edges.
const SILHOUETTE_MAT = new THREE.MeshStandardMaterial({ color: '#050508', roughness: 0.62, metalness: 0.1 });
const PHONE_MAT = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#cfe4ff').multiplyScalar(2.2), // HDR so the bloom pass makes it glow
  toneMapped: false,
});
const PHONE_GEO = new THREE.PlaneGeometry(0.075, 0.15);
const HEADPHONE_MAT = new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.35, metalness: 0.4 });
const HEADBAND_GEO = new THREE.TorusGeometry(0.1, 0.018, 8, 20, Math.PI);
const EARCUP_GEO = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16);

const DRIVEN = [
  'Spine', 'Spine2', 'Head',
  'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm',
  'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg',
] as const;
type Bone = (typeof DRIVEN)[number];
type Rig = Record<Bone, { bone: THREE.Bone; rest: THREE.Quaternion; pw: THREE.Quaternion; pwInv: THREE.Quaternion }>;

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();

// Rotate `b` so the segment b→child points along `dir` (model space).
function alignBone(b: THREE.Object3D, child: THREE.Object3D, dir: THREE.Vector3) {
  const from = child.getWorldPosition(v1).sub(b.getWorldPosition(v2)).normalize();
  const r = new THREE.Quaternion().setFromUnitVectors(from, dir);
  const pw = b.parent!.getWorldQuaternion(new THREE.Quaternion());
  b.quaternion.premultiply(pw.clone().invert().multiply(r).multiply(pw));
  b.updateMatrixWorld(true);
}

// Clone a body and capture each driven bone's rest pose. Dance rotations are then
// written in model space (x = pitch forward/back, z = raise sideways) relative to an
// arms-down stance, so the same pose code works on any Mixamo-rigged body.
function useRig(body: Body) {
  const { scene } = useGLTF(BODY_URLS[body]);
  return useMemo(() => {
    const model = cloneSkinned(scene);
    model.traverse((o) => {
      if (o.isSkinnedMesh) {
        if (body !== 'zach') o.material = SILHOUETTE_MAT;
        o.frustumCulled = false; // bind-pose bounds don't cover raised arms
      }
    });
    const bone = (n: string) =>
      (model.getObjectByName(`mixamorig${n}`) ??
        model.getObjectByName(`mixamorig:${n}`) ??
        model.getObjectByName(n)) as THREE.Bone;
    model.updateMatrixWorld(true);
    for (const side of [1, -1]) {
      const s = side > 0 ? 'Left' : 'Right';
      const hang = new THREE.Vector3(0.12 * side, -1, 0).normalize();
      alignBone(bone(`${s}Arm`), bone(`${s}ForeArm`), hang);
      alignBone(bone(`${s}ForeArm`), bone(`${s}Hand`), hang);
    }
    const box = new THREE.Box3().setFromObject(model);
    const scale = HEIGHT / (box.max.y - box.min.y);
    const rig = {} as Rig;
    for (const n of DRIVEN) {
      const b = bone(n);
      const pw = b.parent!.getWorldQuaternion(new THREE.Quaternion());
      rig[n] = { bone: b, rest: b.quaternion.clone(), pw, pwInv: pw.clone().invert() };
    }
    // Lets head-mounted props be authored in model-space meters.
    const head = bone('Head');
    const headFrame = {
      quaternion: head.getWorldQuaternion(new THREE.Quaternion()).invert(),
      scale: 1 / head.getWorldScale(new THREE.Vector3()).x,
    };
    return { model, rig, scale, footY: -box.min.y * scale, hand: bone('RightHand'), head, headFrame };
  }, [scene, body]);
}

const euler = new THREE.Euler();
const q = new THREE.Quaternion();
function drive(r: Rig[Bone], x: number, y = 0, z = 0) {
  q.setFromEuler(euler.set(x, y, z));
  r.bone.quaternion.copy(r.pwInv).multiply(q).multiply(r.pw).multiply(r.rest);
}

// Poses the rig for beat position `b`; returns how far the hips drop (meters).
function pose(rig: Rig, style: DanceStyle, b: number, energy: number, dj: boolean, phone: boolean) {
  const down = 0.5 + 0.5 * Math.cos(2 * Math.PI * b); // 1 on the beat: knees bent
  const s2 = Math.sin(Math.PI * b); // two-beat swing
  const s4 = Math.sin((Math.PI * b) / 2); // four-beat sway
  const knee = (dj ? 0.06 + 0.1 * down : 0.1 + 0.25 * down) * energy;
  drive(rig.LeftUpLeg, -knee);
  drive(rig.RightUpLeg, -knee);
  drive(rig.LeftLeg, 2 * knee);
  drive(rig.RightLeg, 2 * knee);

  if (dj) {
    // Leaning over the decks, nodding on every beat, right hand riding the jog wheel
    drive(rig.Spine, 0.2, 0.04 * s4);
    drive(rig.Spine2, 0.15);
    drive(rig.Head, 0.12 + 0.18 * down, 0, 0.05 * s4);
    drive(rig.LeftArm, -0.8, 0, 0.12);
    drive(rig.RightArm, -0.8 + 0.06 * s2, 0, -0.12);
    // y twists the forearms palm-down onto the gear
    drive(rig.LeftForeArm, -0.78, 1.3);
    drive(rig.RightForeArm, -0.66 + 0.1 * Math.sin(2 * Math.PI * b), 1.3);
    return 0.9 * (1 - Math.cos(knee));
  }

  const lean = (0.04 + 0.08 * down) * energy;
  drive(rig.Head, 0.06 + 0.16 * down * energy, 0, style === 'sway' ? -0.1 * s4 : 0);

  if (style === 'pump') {
    // Fist pumping on the beat, other arm bent at the side
    drive(rig.Spine, lean, 0.08 * s2);
    drive(rig.Spine2, lean);
    drive(rig.LeftArm, -0.25 - 0.35 * down * energy, 0, 2.55);
    drive(rig.LeftForeArm, -0.25 - 0.5 * down);
    drive(rig.RightArm, -0.35, 0, -0.2);
    drive(rig.RightForeArm, -1.4);
  } else if (style === 'up') {
    // Both hands up, swaying across two beats
    drive(rig.Spine, lean * 0.5, 0, 0.05 * s2);
    drive(rig.Spine2, -0.05);
    drive(rig.LeftArm, -0.2, 0, 2.35 + 0.15 * s2);
    drive(rig.RightArm, -0.2, 0, -2.35 + 0.15 * s2);
    drive(rig.LeftForeArm, -0.3 - 0.3 * down);
    drive(rig.RightForeArm, -0.3 - 0.3 * down);
  } else if (style === 'groove') {
    // Two-step: bent arms swinging opposite each other, torso twisting with them
    drive(rig.Spine, lean, 0.18 * s2 * energy);
    drive(rig.Spine2, lean, 0.08 * s2);
    drive(rig.LeftArm, -0.5 + 0.4 * s2, 0, 0.2);
    drive(rig.RightArm, -0.5 - 0.4 * s2, 0, -0.2);
    drive(rig.LeftForeArm, -1.35);
    drive(rig.RightForeArm, -1.35);
  } else {
    // Slow side-to-side sway over four beats
    drive(rig.Spine, lean * 0.6, 0.05 * s4, 0.07 * s4);
    drive(rig.Spine2, 0, 0, 0.04 * s4);
    drive(rig.LeftArm, -0.2, 0, 0.35 + 0.12 * s4);
    drive(rig.RightArm, -0.2, 0, -0.35 + 0.12 * s4);
    drive(rig.LeftForeArm, -0.7);
    drive(rig.RightForeArm, -0.7);
  }

  // Filming the DJ: right arm held up and forward, steady
  if (phone) {
    drive(rig.RightArm, -2.0, 0, -0.35);
    drive(rig.RightForeArm, -0.35);
  }
  return 0.9 * (1 - Math.cos(knee));
}

// Crowd members change moves every phrase, staggered per dancer, blending into
// the new move over the first beats of the phrase instead of snapping.
const PHRASE_BEATS = 16;
const BLEND_BEATS = 1.5;
const STYLES: DanceStyle[] = ['groove', 'groove', 'pump', 'sway', 'up', 'groove', 'pump', 'sway'];
const hash = (x: number) => {
  const h = Math.sin(x) * 43758.5453;
  return h - Math.floor(h);
};
// Mostly the dancer's own favorite move, sometimes something else.
const styleFor = (home: DanceStyle, seed: number, phrase: number) => {
  const h = hash(seed * 12.9898 + phrase * 78.233);
  return h < 0.55 ? home : STYLES[Math.floor(hash(h * 91.7) * STYLES.length)];
};
const nextQ = DRIVEN.map(() => new THREE.Quaternion());
const prevQ = new THREE.Quaternion();

export function Dancer({
  position,
  yaw = 0,
  body = 'a',
  style = 'groove',
  phase = 0,
  energy = 1,
  heightScale = 1,
  seed = 0,
  halfTime = false,
  dj = false,
  headphones = false,
  phone = false,
}: {
  position: [number, number, number];
  yaw?: number;
  body?: Body;
  style?: DanceStyle;
  /** Offset in beats — real crowds aren't perfectly quantized. */
  phase?: number;
  energy?: number;
  heightScale?: number;
  /** Per-dancer randomness for timing drift, turning and move changes. */
  seed?: number;
  /** Bounces every other beat. */
  halfTime?: boolean;
  dj?: boolean;
  headphones?: boolean;
  phone?: boolean;
}) {
  const { model, rig, scale, footY, hand, head, headFrame } = useRig(body);
  const outer = useRef<THREE.Group>(null);
  const dipper = useRef<THREE.Group>(null);
  const phoneRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = prefersReducedMotion ? 0 : clock.elapsedTime;
    let dip: number;
    if (dj) {
      dip = pose(rig, style, beats(t) + phase, energy, true, false);
    } else {
      // Loose timing: a fixed offset plus a slow drift around the beat
      const b = beats(t) * (halfTime ? 0.5 : 1) + phase + 0.12 * Math.sin(t * 0.37 + seed);
      const pb = beats(t) + (seed % PHRASE_BEATS);
      const phrase = Math.floor(pb / PHRASE_BEATS);
      const next = styleFor(style, seed, phrase);
      const prev = styleFor(style, seed, phrase - 1);
      const w = Math.min(1, (pb - phrase * PHRASE_BEATS) / BLEND_BEATS);
      dip = pose(rig, next, b, energy, false, phone);
      if (w < 1 && prev !== next) {
        DRIVEN.forEach((n, i) => nextQ[i].copy(rig[n].bone.quaternion));
        const dipPrev = pose(rig, prev, b, energy, false, phone);
        const e = w * w * (3 - 2 * w);
        DRIVEN.forEach((n, i) => rig[n].bone.quaternion.slerpQuaternions(prevQ.copy(rig[n].bone.quaternion), nextQ[i], e));
        dip = dipPrev + (dip - dipPrev) * e;
      }
      if (outer.current) outer.current.rotation.y = yaw + 0.25 * Math.sin(t * 0.11 + seed);
    }
    if (dipper.current) dipper.current.position.y = -dip * heightScale;
    if (phone && phoneRef.current && outer.current) {
      hand.updateWorldMatrix(true, false);
      outer.current.worldToLocal(hand.getWorldPosition(phoneRef.current.position));
      phoneRef.current.position.y += 0.08;
    }
  });

  return (
    <group ref={outer} position={position} rotation={[0, yaw, 0]}>
      <group ref={dipper}>
        <group scale={scale * heightScale} position={[0, footY * heightScale, 0]}>
          <primitive object={model} />
        </group>
      </group>
      {/* Screen faces its holder, i.e. back toward the camera behind the crowd */}
      {phone && <mesh ref={phoneRef} geometry={PHONE_GEO} material={PHONE_MAT} rotation={[-0.25, Math.PI, 0]} />}
      {headphones &&
        createPortal(
          <group quaternion={headFrame.quaternion} scale={headFrame.scale}>
            <mesh geometry={HEADBAND_GEO} material={HEADPHONE_MAT} position={[0, 0.1, 0.01]} />
            <mesh geometry={EARCUP_GEO} material={HEADPHONE_MAT} position={[0.095, 0.08, 0.01]} rotation={[0, 0, Math.PI / 2]} />
            <mesh geometry={EARCUP_GEO} material={HEADPHONE_MAT} position={[-0.095, 0.08, 0.01]} rotation={[0, 0, Math.PI / 2]} />
          </group>,
          head,
        )}
    </group>
  );
}

// A dense crowd facing the booth. Spots too close to a camera waypoint are left
// empty so the camera never ends up inside someone's head.
export function Crowd({
  rows,
  perRow,
  facing,
  avoid,
}: {
  rows: number;
  perRow: number;
  facing: [number, number]; // xz point everyone faces (the booth)
  avoid: readonly (readonly [number, number, number])[];
}) {
  const dancers = useMemo(() => {
    let seed = 1337;
    const rand = () => {
      // Deterministic pseudo-random so the crowd layout is stable
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < perRow; c++) {
        const x = (c - (perRow - 1) / 2) * 1.05 + (rand() - 0.5) * 0.5 + (r % 2) * 0.5;
        const z = 1.2 + r * 1.1 + (rand() - 0.5) * 0.4;
        const femme = rand() > 0.5;
        const d = {
          position: [x, 0, z] as [number, number, number],
          yaw: Math.atan2(facing[0] - x, facing[1] - z) + (rand() - 0.5) * 0.5,
          body: (femme ? 'b' : 'a') as Body,
          style: STYLES[Math.floor(rand() * STYLES.length)],
          phase: (rand() - 0.5) * 0.45,
          energy: 0.75 + rand() * 0.45,
          heightScale: (femme ? 0.93 : 1) + (rand() - 0.5) * 0.1,
          phone: rand() < 0.14,
          seed: rand() * 1000,
          halfTime: rand() < 0.25,
        };
        if (avoid.some(([cx, , cz]) => Math.hypot(cx - x, cz - z) < 0.9)) continue;
        out.push(d);
      }
    }
    return out;
  }, [rows, perRow, facing, avoid]);

  return (
    <group>
      {dancers.map((d, i) => (
        <Dancer key={i} {...d} />
      ))}
    </group>
  );
}

useGLTF.preload(BODY_URLS.a);
useGLTF.preload(BODY_URLS.b);
