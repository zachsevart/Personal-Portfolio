// @ts-nocheck - TypeScript types for React Three Fiber should work after restarting TS server
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, MeshReflectorMaterial, useGLTF, Text, useVideoTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';
import { useInView, usePageVisible } from './useInView';
import { AudioPlayer } from './AudioPlayer';
import { getAudioUrl } from '@/config/audio-urls';
import audioPeaks from '@/config/audio-peaks.json';
import { mixes } from '@/content/mixes';
import { upcomingEvents, pastEvents } from '@/content/events';
import { bio } from '@/content/bio';
import { primarySocials, CONTACT_EMAIL } from '@/content/socials';
import { useBookingForm } from '@/content/useBookingForm';
import { ConnectList } from './ConnectList';

// Evaluated once at load: mobile GPUs get lighter settings (no shadows, lower
// DPR, a cheaper floor, and a smaller crowd).
const isMobile =
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 768px)').matches;

// Club light colors — pulled from the site's bubble palette for cohesion
const BEAM_COLORS = ['#dd4aff', '#00dcff', '#1271ff']; // magenta, cyan, blue

// The Pioneer CDJ + mixer model — same one used in the hero deck
const DECK_MODEL = '/pioneer_cdj_3000_pioneer_djm_a9/scene.gltf';

type DanceStyle = 'up' | 'groove' | 'sway';
type HairStyle = 'short' | 'long' | 'bun' | 'bald';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// An articulated low-poly dancer with human variety: hair styles, masc/femme
// builds, height variation, jointed limbs, and one of three dance styles.
function Dancer({
  position,
  phase,
  speed,
  style,
  rotationY = 0,
  hair = 'short',
  femme = false,
  heightScale = 1,
  dj = false,
  headphones = false,
}: {
  position: [number, number, number];
  phase: number;
  speed: number;
  style: DanceStyle;
  rotationY?: number;
  hair?: HairStyle;
  femme?: boolean;
  heightScale?: number;
  dj?: boolean;
  headphones?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lFore = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);

  // Near-black skin + a slightly warmer near-black for hair, so silhouettes
  // stay dark but hair still reads as a distinct shape.
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#050507', roughness: 0.78, metalness: 0.08 }),
    [],
  );
  const hairMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0c0910', roughness: 0.9, metalness: 0.05 }),
    [],
  );
  // Black headphones with a faint sheen
  const hpMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.35, metalness: 0.4 }),
    [],
  );

  const shoulder = femme ? 0.17 : 0.22; // narrower shoulders on femme builds
  const legR = femme ? 0.06 : 0.075; // slimmer legs on femme builds
  const legX = femme ? 0.07 : 0.09; // legs closer together on femme builds

  useFrame(({ clock }) => {
    if (prefersReducedMotion || !root.current) return;
    const t = clock.elapsedTime * speed + phase;
    const s = Math.sin(t);
    const bounce = Math.abs(s); // up-only, like stepping to a beat

    // DJ: planted at the decks, leaning in, nodding, hands working the gear
    if (dj) {
      root.current.position.y = bounce * 0.03;
      root.current.rotation.z = Math.sin(t * 0.5) * 0.02;
      root.current.rotation.y = rotationY + Math.sin(t * 0.4) * 0.05;
      if (torso.current) {
        torso.current.rotation.x = 0.2 + s * 0.03; // leaning over the decks
        torso.current.rotation.y = Math.sin(t * 0.5) * 0.05;
      }
      if (head.current) {
        head.current.rotation.x = 0.14 + Math.abs(Math.sin(t * 2)) * 0.12; // nodding to the beat
        head.current.rotation.z = Math.sin(t) * 0.06;
      }
      if (lLeg.current) lLeg.current.rotation.x = s * 0.04;
      if (rLeg.current) rLeg.current.rotation.x = -s * 0.04;
      // Hands reaching forward/down onto the deck; right hand rides the jog wheel
      if (lArm.current) (lArm.current.rotation.x = -1.15), (lArm.current.rotation.z = 0.22);
      if (rArm.current)
        (rArm.current.rotation.x = -1.05 + Math.sin(t * 3) * 0.14), (rArm.current.rotation.z = -0.22);
      if (lFore.current) lFore.current.rotation.x = -0.5;
      if (rFore.current) rFore.current.rotation.x = -0.55 + Math.sin(t * 3 + 1) * 0.12;
      return;
    }

    // Whole body bob + sway from the feet (rotationY sets which way they face)
    root.current.position.y = bounce * 0.15;
    root.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    root.current.rotation.y = rotationY + Math.sin(t * 0.25 + phase) * 0.12;

    // Torso lean + twist
    if (torso.current) {
      torso.current.rotation.x = s * 0.06;
      torso.current.rotation.y = Math.sin(t * 0.5) * 0.12;
    }
    // Head bob
    if (head.current) {
      head.current.rotation.z = Math.sin(t + 0.4) * 0.14;
      head.current.rotation.x = bounce * 0.1;
    }
    // Weight-shifting legs (pivot at hips)
    if (lLeg.current) lLeg.current.rotation.x = s * 0.22;
    if (rLeg.current) rLeg.current.rotation.x = -s * 0.22;

    // Arms vary by dance style
    if (style === 'up') {
      const wave = Math.sin(t * 2);
      if (lArm.current) (lArm.current.rotation.z = 2.5), (lArm.current.rotation.x = wave * 0.3);
      if (rArm.current) (rArm.current.rotation.z = -2.5), (rArm.current.rotation.x = -wave * 0.3);
      if (lFore.current) lFore.current.rotation.x = 0.3 + wave * 0.2;
      if (rFore.current) rFore.current.rotation.x = 0.3 - wave * 0.2;
    } else if (style === 'groove') {
      if (lArm.current) (lArm.current.rotation.x = s * 0.7), (lArm.current.rotation.z = 0.18);
      if (rArm.current) (rArm.current.rotation.x = -s * 0.7), (rArm.current.rotation.z = -0.18);
      if (lFore.current) lFore.current.rotation.x = 0.5 + bounce * 0.3;
      if (rFore.current) rFore.current.rotation.x = 0.5 + bounce * 0.3;
    } else {
      const sway = Math.sin(t * 0.5);
      if (lArm.current) lArm.current.rotation.z = 0.5 + sway * 0.3;
      if (rArm.current) rArm.current.rotation.z = -0.5 - sway * 0.3;
      if (lFore.current) lFore.current.rotation.x = 0.4;
      if (rFore.current) rFore.current.rotation.x = 0.4;
    }
  });

  return (
    <group position={position} scale={heightScale}>
      <group ref={root}>
        {/* Torso pivots at the hips */}
        <group ref={torso} position={[0, 0.9, 0]}>
          <mesh position={[0, 0.24, 0]} scale={[femme ? 0.9 : 1, 1, 1]} material={mat} castShadow>
            <capsuleGeometry args={[0.16, 0.38, 6, 12]} />
          </mesh>
          {/* Head + hair */}
          <group ref={head} position={[0, 0.6, 0]}>
            <mesh material={mat} castShadow>
              <sphereGeometry args={[0.145, 16, 16]} />
            </mesh>
            {hair !== 'bald' && (
              // Hair cap covering the top/back of the head
              <mesh position={[0, 0.02, -0.02]} scale={[1.1, 1.05, 1.12]} material={hairMat} castShadow>
                <sphereGeometry args={[0.15, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              </mesh>
            )}
            {hair === 'long' && (
              // Hair falling down the back
              <mesh position={[0, -0.2, -0.07]} material={hairMat} castShadow>
                <capsuleGeometry args={[0.13, 0.3, 4, 8]} />
              </mesh>
            )}
            {hair === 'bun' && (
              <mesh position={[0, 0.17, -0.05]} material={hairMat} castShadow>
                <sphereGeometry args={[0.075, 10, 10]} />
              </mesh>
            )}
            {headphones && (
              <group>
                {/* Headband over the top, ear to ear */}
                <mesh position={[0, 0.03, 0]} material={hpMat} castShadow>
                  <torusGeometry args={[0.155, 0.028, 8, 20, Math.PI]} />
                </mesh>
                {/* Ear cups */}
                <mesh position={[0.155, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={hpMat} castShadow>
                  <cylinderGeometry args={[0.058, 0.058, 0.05, 16]} />
                </mesh>
                <mesh position={[-0.155, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={hpMat} castShadow>
                  <cylinderGeometry args={[0.058, 0.058, 0.05, 16]} />
                </mesh>
              </group>
            )}
          </group>
          {/* Left arm: shoulder + elbow */}
          <group ref={lArm} position={[shoulder, 0.48, 0]}>
            <mesh position={[0, -0.16, 0]} material={mat} castShadow>
              <capsuleGeometry args={[0.055, 0.24, 4, 8]} />
            </mesh>
            <group ref={lFore} position={[0, -0.32, 0]}>
              <mesh position={[0, -0.14, 0]} material={mat} castShadow>
                <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
              </mesh>
            </group>
          </group>
          {/* Right arm */}
          <group ref={rArm} position={[-shoulder, 0.48, 0]}>
            <mesh position={[0, -0.16, 0]} material={mat} castShadow>
              <capsuleGeometry args={[0.055, 0.24, 4, 8]} />
            </mesh>
            <group ref={rFore} position={[0, -0.32, 0]}>
              <mesh position={[0, -0.14, 0]} material={mat} castShadow>
                <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
              </mesh>
            </group>
          </group>
        </group>
        {/* Solid A-line dress for femme builds (truncated cone: narrow waist → wide hem) */}
        {femme && (
          <mesh position={[0, 0.6, 0]} material={mat} castShadow>
            <cylinderGeometry args={[0.16, 0.36, 0.62, 16, 1]} />
          </mesh>
        )}
        {/* Legs pivot at the hips */}
        <group ref={lLeg} position={[legX, 0.9, 0]}>
          <mesh position={[0, -0.45, 0]} material={mat} castShadow>
            <capsuleGeometry args={[legR, 0.62, 4, 8]} />
          </mesh>
        </group>
        <group ref={rLeg} position={[-legX, 0.9, 0]}>
          <mesh position={[0, -0.45, 0]} material={mat} castShadow>
            <capsuleGeometry args={[legR, 0.62, 4, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// A crowd of dancers arranged facing the booth
function Crowd() {
  const dancers = useMemo(() => {
    const arr: {
      position: [number, number, number];
      phase: number;
      speed: number;
      style: DanceStyle;
      hair: HairStyle;
      femme: boolean;
      heightScale: number;
    }[] = [];
    let seed = 1337;
    const rand = () => {
      // Deterministic pseudo-random so the crowd layout is stable
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const styles: DanceStyle[] = ['up', 'groove', 'sway'];
    const femmeHair: HairStyle[] = ['long', 'bun', 'long', 'short'];
    const mascHair: HairStyle[] = ['short', 'short', 'bald', 'bun'];
    // Smaller crowd on mobile for performance
    const rows = isMobile ? 3 : 4;
    const perRow = isMobile ? 5 : 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < perRow; c++) {
        const z = 1 + r * 1.5 + (rand() - 0.5) * 0.6;
        const x = (c - (perRow - 1) / 2) * 1.5 + (rand() - 0.5) * 0.7;
        const femme = rand() > 0.5;
        const hair = (femme ? femmeHair : mascHair)[Math.floor(rand() * 4)];
        // Femme builds run a touch shorter on average
        const heightScale = (femme ? 0.9 : 0.98) + rand() * 0.14;
        arr.push({
          position: [x, 0, z],
          phase: rand() * Math.PI * 2,
          speed: 3.0 + rand() * 1.8,
          style: styles[Math.floor(rand() * styles.length)],
          hair,
          femme,
          heightScale,
        });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {dancers.map((d, i) => (
        <Dancer key={i} {...d} />
      ))}
    </group>
  );
}

// The real Pioneer CDJ + mixer model, raised onto the console at hand height
function BoothDeck() {
  const { scene } = useGLTF(DECK_MODEL);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return (
    <primitive object={cloned} scale={0.25} position={[0, 1.25, 0.1]} rotation={[0, Math.PI, 0]} />
  );
}

// The big screen behind the DJ plays these clips, crossfading between them.
// Empty array => standby placeholder. Clips are pre-cropped to 16:9 at
// compression time so they map cleanly onto the screen plane.
const VIDEO_SRCS: string[] = ['/video/dj-set.mp4', '/video/casablanca.mp4'];
const VIDEO_SWITCH_SECONDS = 18;

function ScreenPlaceholder() {
  return (
    <mesh position={[0, 0, 0.1]}>
      <planeGeometry args={[6, 3.375]} />
      <meshStandardMaterial color="#0c1740" emissive="#24397f" emissiveIntensity={0.9} roughness={0.4} />
    </mesh>
  );
}

// Both clips decode continuously (muted, looping); a base plane shows clip A and
// an overlay plane crossfades clip B in/out on a timer.
function ScreenVideos() {
  const texA = useVideoTexture(VIDEO_SRCS[0], {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  });
  const texB = useVideoTexture(VIDEO_SRCS[1], {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  });
  const overlay = useRef<THREE.MeshBasicMaterial>(null);
  const showB = useRef(false);
  const lastSwitch = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (t - lastSwitch.current > VIDEO_SWITCH_SECONDS) {
      lastSwitch.current = t;
      showB.current = !showB.current;
    }
    if (overlay.current) {
      const target = showB.current ? 1 : 0;
      overlay.current.opacity += (target - overlay.current.opacity) * (1 - Math.pow(0.02, delta));
    }
  });

  return (
    <>
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[6, 3.375]} />
        <meshBasicMaterial map={texA} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.101]}>
        <planeGeometry args={[6, 3.375]} />
        <meshBasicMaterial ref={overlay} map={texB} toneMapped={false} transparent opacity={0} />
      </mesh>
    </>
  );
}

function VideoScreen() {
  return (
    <group position={[0, 2.7, -2.1]}>
      {/* Bezel / frame */}
      <mesh castShadow>
        <boxGeometry args={[6.4, 3.7, 0.18]} />
        <meshStandardMaterial color="#040405" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Crossfading clips, else standby placeholder */}
      {VIDEO_SRCS.length > 0 ? (
        <Suspense fallback={<ScreenPlaceholder />}>
          <ScreenVideos />
        </Suspense>
      ) : (
        <ScreenPlaceholder />
      )}
      {/* Faint screen backlight spilling forward onto the booth */}
      <pointLight position={[0, -0.6, 1.6]} intensity={5} color="#2a4bd0" distance={8} />
    </group>
  );
}

// Glowing "zachtrax" neon sign — HDR emissive script text picked up by the Bloom
// pass, with a subtle neon flicker. Baby-blue tube color.
const NEON_COLOR = '#9fd8ff'; // baby blue
function NeonSign() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  // Color lifted above 1.0 (HDR) with toneMapped off so selective bloom catches it
  const base = useMemo(() => new THREE.Color(NEON_COLOR).multiplyScalar(2.8), []);
  const glowBase = useMemo(() => new THREE.Color(NEON_COLOR).multiplyScalar(1.4), []);
  const flick = useRef(1);

  useFrame(({ clock }) => {
    if (prefersReducedMotion) return;
    const t = clock.elapsedTime;
    // Mostly-on neon with a faint hum plus occasional brief flicker dips
    let target = 0.92 + Math.sin(t * 6.0) * 0.05 + Math.sin(t * 13.0) * 0.03;
    if (Math.random() < 0.03) target *= 0.45; // rare stutter
    flick.current += (target - flick.current) * 0.5;
    const f = flick.current;
    if (matRef.current) matRef.current.color.copy(base).multiplyScalar(f);
    if (glowRef.current) glowRef.current.color.copy(glowBase).multiplyScalar(f);
    if (lightRef.current) lightRef.current.intensity = 8 * f;
  });

  return (
    <group position={[0, 1.16, 0.98]}>
      {/* Main tube glow */}
      <Text font="/fonts/Neonderthaw-Regular.ttf" fontSize={0.62} anchorX="center" anchorY="middle">
        zachtrax
        <meshBasicMaterial ref={matRef} color={base} toneMapped={false} />
      </Text>
      {/* Softer, slightly larger duplicate behind for a fuller tube-halo */}
      <Text
        font="/fonts/Neonderthaw-Regular.ttf"
        fontSize={0.62}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, -0.02]}
        scale={1.04}
      >
        zachtrax
        <meshBasicMaterial ref={glowRef} color={glowBase} transparent opacity={0.5} toneMapped={false} />
      </Text>
      {/* Baby-blue neon spill onto the booth */}
      <pointLight ref={lightRef} position={[0, 0, 0.4]} intensity={8} color={NEON_COLOR} distance={4.5} />
    </group>
  );
}

// A PA speaker cabinet with woofers facing the crowd (+z)
function Speaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Cabinet */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 2.0, 1.0]} />
        <meshStandardMaterial color="#08080a" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Two woofers + a tweeter on the front face */}
      <mesh position={[0, 1.35, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.04, 24]} />
        <meshStandardMaterial color="#161619" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.04, 24]} />
        <meshStandardMaterial color="#161619" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.75, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#050506" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

// DJ booth at the back with the deck and a silhouette DJ
function Booth() {
  return (
    <group position={[0, 0, -4.5]}>
      {/* Riser */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.7, 1.8]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.8} />
      </mesh>
      {/* Booth front panel */}
      <mesh position={[0, 1.0, 0.85]} castShadow>
        <boxGeometry args={[4.2, 0.9, 0.15]} />
        <meshStandardMaterial color="#050506" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Console the deck sits on, raised to hand height */}
      <mesh position={[0, 0.975, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.55, 1.1]} />
        <meshStandardMaterial color="#0b0b0f" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Large screen behind the DJ */}
      <VideoScreen />
      {/* Real Pioneer deck on top */}
      <BoothDeck />
      {/* Glowing neon sign on the booth face */}
      <NeonSign />
      {/* PA speakers flanking the stand, facing the crowd */}
      <Speaker position={[-3.2, 0, 0.3]} />
      <Speaker position={[3.2, 0, 0.3]} />
      {/* DJ (Zach) working the decks, facing the crowd, in headphones */}
      <Dancer
        position={[0, 0.72, -0.5]}
        phase={0.5}
        speed={2.4}
        style="groove"
        rotationY={0}
        hair="short"
        dj
        headphones
      />
    </group>
  );
}

useGLTF.preload(DECK_MODEL);

// A sweeping colored beam: visible additive light shaft + real wash light
function Beam({
  color,
  phase,
  origin,
}: {
  color: string;
  phase: number;
  origin: [number, number, number];
}) {
  const pivotRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!pivotRef.current || prefersReducedMotion) return;
    const t = clock.elapsedTime;
    pivotRef.current.rotation.z = Math.sin(t * 0.35 + phase) * 0.55;
    pivotRef.current.rotation.x = Math.cos(t * 0.27 + phase) * 0.35;
  });

  const height = 7.5;

  return (
    <group position={origin} ref={pivotRef}>
      {/* Visible light shaft — cone apex at the fixture, widening toward floor */}
      <mesh position={[0, -height / 2, 0]}>
        <coneGeometry args={[2.2, height, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Bright core at the fixture */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Real light that washes the crowd and floor with this color */}
      <spotLight
        position={[0, 0, 0]}
        angle={0.42}
        penumbra={0.8}
        intensity={220}
        distance={26}
        color={color}
        castShadow
      />
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* Haze for depth so beams read as volumetric */}
      <fog attach="fog" args={['#050510', 14, 42]} />
      <color attach="background" args={['#040409']} />

      {/* Low ambient so silhouettes stay dark but readable */}
      <ambientLight intensity={0.35} />
      {/* Cool key from above the booth */}
      <pointLight position={[0, 6, -4]} intensity={30} color="#6a5cff" distance={34} />
      {/* Accent to lift the DJ booth out of shadow */}
      <pointLight position={[0, 2.4, -3]} intensity={16} color="#8c64ff" distance={10} />
      {/* Focused light on the deck so the opening shot reads */}
      <pointLight position={[0, 2.3, -4.1]} intensity={24} color="#aab4ff" distance={6} />
      {/* Colored wash lights over the crowd, matching the beams */}
      <pointLight position={[-4, 4.5, 1]} intensity={45} color="#dd4aff" distance={16} />
      <pointLight position={[4, 4.5, 1]} intensity={45} color="#00dcff" distance={16} />
      <pointLight position={[0, 4.5, 4]} intensity={40} color="#1271ff" distance={16} />

      {/* Sweeping beams — the signature */}
      <Beam color={BEAM_COLORS[0]} phase={0} origin={[-5, 8, -1]} />
      <Beam color={BEAM_COLORS[1]} phase={2.1} origin={[5, 8, -1]} />
      <Beam color={BEAM_COLORS[2]} phase={4.2} origin={[0, 8.5, 3]} />

      {/* The room */}
      <group>
        <Booth />
        <Crowd />

        {/* Wet-look reflective floor catching the colored light.
            Reflections are expensive, so mobile gets a plain glossy floor. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[16, 64]} />
          {isMobile ? (
            <meshStandardMaterial color="#0a0a12" roughness={0.45} metalness={0.6} />
          ) : (
            <MeshReflectorMaterial
              resolution={512}
              mirror={0.7}
              mixBlur={6}
              mixStrength={3}
              blur={[250, 80]}
              roughness={0.6}
              depthScale={1.1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#08080e"
              metalness={0.7}
            />
          )}
        </mesh>
      </group>
    </>
  );
}

// One camera waypoint per section of the scroll journey.
const SECTIONS = [
  { id: 'intro', title: 'behind the decks', cam: { pos: [1.5, 2.3, -1.9], look: [-0.1, 0.95, -4.6] } },
  { id: 'mixes', title: 'mixes', cam: { pos: [3.7, 2.5, 2.2], look: [-0.4, 1.2, -3.4] } },
  { id: 'events', title: 'events', cam: { pos: [-4.2, 3.0, 2.6], look: [0.3, 1.2, -3.0] } },
  { id: 'booking', title: 'booking', cam: { pos: [0, 4.6, 5.8], look: [0, 1.0, -1.5] } },
  { id: 'about', title: 'about', cam: { pos: [2.4, 1.9, 4.4], look: [-0.4, 1.6, -3.2] } },
  { id: 'connect', title: 'connect', cam: { pos: [0, 2.2, 3.2], look: [0, 1.1, -4.2] } },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

// Drives the camera along the section waypoints from scroll progress (0→1)
function ScrollRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const keys = useMemo(
    () =>
      SECTIONS.map((s) => ({
        pos: new THREE.Vector3(...s.cam.pos),
        look: new THREE.Vector3(...s.cam.look),
      })),
    [],
  );
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);
  const curPos = useRef(keys[0].pos.clone());
  const curLook = useRef(keys[0].look.clone());

  useFrame((state, delta) => {
    const n = keys.length;
    const p = prefersReducedMotion ? 0 : progress.current;
    const scaled = Math.min(n - 1, Math.max(0, p * (n - 1)));
    const seg = Math.min(n - 2, Math.floor(scaled));
    const lt = scaled - seg;
    const e = lt * lt * (3 - 2 * lt); // smoothstep — lingers near each waypoint
    tmpPos.lerpVectors(keys[seg].pos, keys[seg + 1].pos, e);
    tmpLook.lerpVectors(keys[seg].look, keys[seg + 1].look, e);
    // Subtle pointer parallax for life
    tmpPos.x += state.pointer.x * 0.35;
    tmpPos.y += state.pointer.y * 0.2;

    const a = prefersReducedMotion ? 1 : 1 - Math.pow(0.0008, delta);
    curPos.current.lerp(tmpPos, a);
    curLook.current.lerp(tmpLook, a);
    camera.position.copy(curPos.current);
    camera.lookAt(curLook.current);
  });

  return null;
}

// Frosted-glass card shell for an in-scene section panel.
function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex max-h-[74vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/70 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-sm uppercase tracking-[0.3em] text-white/90">{title}</h2>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">{children}</div>
    </div>
  );
}

function MixesPanel() {
  return (
    <SectionPanel title="Mixes">
      {mixes.map((mix) => (
        <article key={mix.id} className="border-b border-white/10 pb-4 last:border-0">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h3 className="text-white">{mix.title}</h3>
            <span className="shrink-0 text-xs text-white/50">{mix.duration}</span>
          </div>
          <p className="mb-2 text-sm text-white/60">{mix.description}</p>
          <AudioPlayer
            title={mix.title}
            audioUrl={getAudioUrl(mix.audioFile)}
            precomputedPeaks={(audioPeaks as Record<string, { peaks: number[][]; duration: number }>)[mix.audioFile]}
          />
        </article>
      ))}
    </SectionPanel>
  );
}

function EventRow({ ev, dim = false }: { ev: (typeof pastEvents)[number]; dim?: boolean }) {
  return (
    <div className={`flex gap-3 border-b border-white/10 pb-4 last:border-0 ${dim ? 'opacity-70' : ''}`}>
      {ev.image && (
        <img
          src={ev.image}
          alt=""
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-md border border-white/10 object-cover"
        />
      )}
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="truncate text-sm text-white">{ev.title}</h4>
          <span className="shrink-0 text-xs text-white/40">{ev.date}</span>
        </div>
        <p className="text-xs text-white/50">{ev.venue} — {ev.city}</p>
        <p className="text-sm text-white/70">{ev.description}</p>
      </div>
    </div>
  );
}

function EventsPanel() {
  return (
    <SectionPanel title="Events">
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">Upcoming</h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-white/60">No upcoming events — check back soon.</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((ev) => (
              <EventRow key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-3 mt-4 text-xs uppercase tracking-[0.2em] text-white/50">Past</h3>
        <div className="space-y-4">
          {pastEvents.map((ev) => (
            <EventRow key={ev.id} ev={ev} dim />
          ))}
        </div>
      </div>
    </SectionPanel>
  );
}

const FIELD_CLASS =
  'w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-white/50 focus:outline-none transition-colors';

function BookingPanel() {
  const { formData, submitted, handleChange, handleSubmit } = useBookingForm();
  return (
    <SectionPanel title="Booking">
      {submitted ? (
        <p className="text-sm text-white/80">
          Your email client should have opened. If it didn't, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" required placeholder="Name" value={formData.name} onChange={handleChange} className={FIELD_CLASS} />
          <input name="email" type="email" required placeholder="Email" value={formData.email} onChange={handleChange} className={FIELD_CLASS} />
          <div className="grid grid-cols-2 gap-3">
            <input name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} className={FIELD_CLASS} />
            <input name="venue" placeholder="Venue" value={formData.venue} onChange={handleChange} className={FIELD_CLASS} />
          </div>
          <select name="eventType" value={formData.eventType} onChange={handleChange} className={FIELD_CLASS}>
            <option value="" className="bg-black">Event type</option>
            <option value="Club Night" className="bg-black">Club Night</option>
            <option value="House Party" className="bg-black">House Party</option>
            <option value="Private Event" className="bg-black">Private Event</option>
            <option value="Festival" className="bg-black">Festival</option>
            <option value="Corporate" className="bg-black">Corporate</option>
            <option value="Other" className="bg-black">Other</option>
          </select>
          <textarea name="details" rows={3} placeholder="Tell me about your event" value={formData.details} onChange={handleChange} className={`${FIELD_CLASS} resize-none`} />
          <button type="submit" className="border border-white/60 px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black">
            Send inquiry →
          </button>
        </form>
      )}
    </SectionPanel>
  );
}

function AboutPanel() {
  return (
    <SectionPanel title="About">
      {bio.paragraphs.map((para, i) => (
        <p key={i} className="text-sm leading-relaxed text-white/80">
          {para}
        </p>
      ))}
    </SectionPanel>
  );
}

function ConnectPanel() {
  return (
    <SectionPanel title="Connect">
      <ConnectList links={primarySocials} />
    </SectionPanel>
  );
}

// Which panel renders for each section (intro has none — it's the hero shot).
const PANELS: Partial<Record<SectionId, React.ComponentType>> = {
  mixes: MixesPanel,
  events: EventsPanel,
  booking: BookingPanel,
  about: AboutPanel,
  connect: ConnectPanel,
};

export function ClubScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef);
  const pageVisible = usePageVisible();
  const progress = useRef(0);
  const hint = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<SectionId>('intro');
  const sectionRef = useRef<SectionId>('intro');

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = rect.height - window.innerHeight;
      const p = dist > 0 ? Math.min(1, Math.max(0, -rect.top / dist)) : 0;
      progress.current = p;

      // Nearest section drives the label + which content panel is shown.
      const idx = Math.round(p * (SECTIONS.length - 1));
      const id = SECTIONS[idx].id;
      if (sectionRef.current !== id) {
        sectionRef.current = id;
        setSection(id);
      }
      if (hint.current) hint.current.style.opacity = p < 0.04 ? '1' : '0';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const title = SECTIONS.find((s) => s.id === section)?.title ?? '';
  const ActivePanel = PANELS[section];

  return (
    <section ref={wrapperRef} className="relative w-full h-[520vh] bg-[#040409]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          shadows={!isMobile}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          frameloop={inView && pageVisible ? 'always' : 'never'}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <PerspectiveCamera makeDefault fov={46} position={[1.5, 2.3, -1.9]} />
          <ScrollRig progress={progress} />
          <Scene />
          {/* Selective bloom: only HDR materials (the neon) glow */}
          <EffectComposer>
            <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} />
          </EffectComposer>
        </Canvas>

        {/* Current section label */}
        <div className="pointer-events-none absolute bottom-8 left-8 sm:left-12">
          <AnimatePresence mode="wait">
            <motion.span
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.75, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="block text-sm uppercase tracking-[0.3em] text-white"
            >
              {title}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Section content panels (reveal as you scroll to each section) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {ActivePanel && (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="pointer-events-auto w-full max-w-md"
              >
                <ActivePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll hint */}
        <div
          ref={hint}
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-opacity duration-500"
        >
          <span className="text-xs uppercase tracking-[0.3em]">scroll</span>
          <span className="animate-bounce text-lg">↓</span>
        </div>
      </div>
    </section>
  );
}
