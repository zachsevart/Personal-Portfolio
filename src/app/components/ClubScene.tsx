// @ts-nocheck - TypeScript types for React Three Fiber should work after restarting TS server
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, MeshReflectorMaterial, PerformanceMonitor, SpotLight, useGLTF, Text, useVideoTexture } from '@react-three/drei';
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
import { Crowd, Dancer, beats, kick } from './ClubCrowd';

// Evaluated once at load: mobile GPUs get lighter settings (lower DPR, a cheaper
// floor, and a smaller crowd). No shadows anywhere: three shadow-casting beams
// tripled the per-frame draw calls for barely visible results.
const isMobile =
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 768px)').matches;

// Club light colors — pulled from the site's bubble palette for cohesion
const BEAM_COLORS = ['#dd4aff', '#00dcff', '#1271ff']; // magenta, cyan, blue

// The Pioneer CDJ + mixer model — same one used in the hero deck
const DECK_MODEL = '/pioneer_cdj_3000_pioneer_djm_a9/scene.gltf';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// The real Pioneer CDJ + mixer model, raised onto the console at hand height
function BoothDeck() {
  const { scene } = useGLTF(DECK_MODEL);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return (
    <primitive object={cloned} scale={0.25} position={[0, 1.53, 0.1]} rotation={[0, Math.PI, 0]} />
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
      <mesh>
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
      {/* Faint screen backlight spilling forward; sits behind the DJ so it rims him */}
      <pointLight position={[0, -0.6, 0.9]} intensity={5} color="#2a4bd0" distance={8} />
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
    <group position={[0, 1.3, 0.98]}>
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
      <mesh position={[0, 1.0, 0]}>
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
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[5, 0.7, 1.8]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.8} />
      </mesh>
      {/* Booth front panel */}
      <mesh position={[0, 1.14, 0.85]}>
        <boxGeometry args={[4.2, 1.18, 0.15]} />
        <meshStandardMaterial color="#050506" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Console the deck sits on: top ~0.85m above the riser, around waist height */}
      <mesh position={[0, 1.115, 0.1]}>
        <boxGeometry args={[3.6, 0.83, 1.1]} />
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
      {/* DJ (Zach) just behind the console, facing the crowd, in headphones */}
      <Dancer position={[0, 0.7, -0.62]} body="zach" dj headphones />
    </group>
  );
}

useGLTF.preload(DECK_MODEL);

// A sweeping colored beam: visible additive light shaft + real wash light,
// sweeping on a 32-beat cycle and punching brighter on every kick.
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
  const light = useRef<THREE.SpotLight>(null);
  // Aim point rides inside the pivot so the light (and its cone) follow the sweep
  // (a default SpotLight target sits at the world origin forever).
  const [target] = useState(() => new THREE.Object3D());

  useFrame(({ clock }) => {
    if (!pivotRef.current || prefersReducedMotion) return;
    const b = beats(clock.elapsedTime);
    const k = kick(b);
    pivotRef.current.rotation.z = Math.sin((Math.PI * 2 * b) / 32 + phase) * 0.55;
    pivotRef.current.rotation.x = Math.cos((Math.PI * 2 * b) / 40 + phase) * 0.35;
    if (!light.current) return;
    light.current.intensity = 160 + 140 * k;
    // drei renders the volumetric cone as the light's child mesh
    const cone = light.current.children[0] as THREE.Mesh | undefined;
    if (cone) (cone.material as THREE.ShaderMaterial).uniforms.opacity.value = 0.55 + 0.45 * k;
  });

  return (
    <group position={origin} ref={pivotRef}>
      {/* Bright core at the fixture */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <primitive object={target} position={[0, -10, 0]} />
      {/* Real wash light + a volumetric shaft that fades along its length and at its edges */}
      <SpotLight
        ref={light}
        target={target}
        color={color}
        angle={0.32}
        penumbra={0.8}
        intensity={220}
        distance={11}
        attenuation={9}
        anglePower={4}
        radiusTop={0.15}
        radiusBottom={2.6}
        opacity={0.7}
      />
    </group>
  );
}

// A fan of thin HDR laser lines fired from above the screen over the crowd.
// The fan opens/closes every 16 beats and pans every 32; bloom makes them glow.
const LASERS_PER_FAN = 8;
const LASER_GEO = new THREE.CylinderGeometry(0.006, 0.006, 1, 5).translate(0, 0.5, 0); // pivot at the emitter
function LaserFan({ origin, color, pan }: { origin: [number, number, number]; color: string; pan: number }) {
  const fan = useRef<THREE.Group>(null);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(6),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color],
  );

  useFrame(({ clock }) => {
    if (!fan.current || prefersReducedMotion) return;
    const b = beats(clock.elapsedTime);
    const spread = 0.13 + 0.09 * Math.sin((Math.PI * 2 * b) / 16);
    fan.current.children.forEach((beam, i) => (beam.rotation.z = (i - (LASERS_PER_FAN - 1) / 2) * spread));
    fan.current.rotation.y = pan * 0.4 * Math.sin((Math.PI * 2 * b) / 32);
    fan.current.rotation.x = 1.66 + 0.07 * Math.sin((Math.PI * 2 * b) / 8);
    mat.opacity = 0.35 + 0.65 * kick(b);
  });

  return (
    <group ref={fan} position={origin} rotation={[1.66, 0, 0, 'YXZ']}>
      {Array.from({ length: LASERS_PER_FAN }, (_, i) => (
        <mesh key={i} geometry={LASER_GEO} material={mat} scale={[1, 22, 1]} />
      ))}
    </group>
  );
}

// Strong light from the booth aimed back over the crowd, so dancers seen from
// behind get bright rims instead of reading as flat black cutouts.
function Backlight() {
  const [target] = useState(() => new THREE.Object3D());
  return (
    <>
      <primitive object={target} position={[0, 1.3, 6]} />
      <spotLight position={[0, 1.5, -3.3]} target={target} angle={0.9} penumbra={0.9} intensity={90} distance={16} color="#a98bff" />
    </>
  );
}

function Scene({ lowQuality }: { lowQuality: boolean }) {
  return (
    <>
      {/* Haze for depth so beams read as volumetric */}
      <fog attach="fog" args={['#050510', 14, 42]} />
      <color attach="background" args={['#040409']} />

      {/* Low ambient so silhouettes stay dark but readable */}
      <ambientLight intensity={0.35} />
      {/* Cool key from above the booth */}
      <pointLight position={[0, 6, -4]} intensity={30} color="#6a5cff" distance={34} />
      {/* Rim light on the crowd (also lifts the booth front) */}
      <Backlight />
      {/* Focused light on the deck so the opening shot reads */}
      <pointLight position={[0, 2.1, -3.5]} intensity={18} color="#aab4ff" distance={6} />
      {/* Colored wash lights over the crowd, matching the beams */}
      <pointLight position={[-4, 4.5, 1]} intensity={45} color="#dd4aff" distance={16} />
      <pointLight position={[4, 4.5, 1]} intensity={45} color="#00dcff" distance={16} />
      <pointLight position={[0, 4.5, 4]} intensity={40} color="#1271ff" distance={16} />

      {/* Sweeping beams — the signature */}
      <Beam color={BEAM_COLORS[0]} phase={0} origin={[-5, 8, -1]} />
      <Beam color={BEAM_COLORS[1]} phase={2.1} origin={[5, 8, -1]} />
      <Beam color={BEAM_COLORS[2]} phase={4.2} origin={[0, 8.5, 3]} />
      <LaserFan origin={[-3.4, 4.6, -6.3]} color={BEAM_COLORS[1]} pan={1} />
      <LaserFan origin={[3.4, 4.6, -6.3]} color={BEAM_COLORS[0]} pan={-1} />

      {/* The room */}
      <group>
        <Booth />
        <Crowd rows={isMobile ? 3 : 4} perRow={isMobile ? 5 : 7} facing={BOOTH_XZ} avoid={CAMERA_POSITIONS} />

        {/* Wet-look reflective floor catching the colored light.
            Reflections are expensive, so mobile and struggling GPUs get a plain glossy floor. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[16, 64]} />
          {isMobile || lowQuality ? (
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
  { id: 'intro', title: 'behind the decks', cam: { pos: [1.5, 2.4, -1.7], look: [-0.1, 1.35, -4.6] } },
  { id: 'mixes', title: 'mixes', cam: { pos: [3.7, 2.5, 2.2], look: [-0.4, 1.2, -3.4] } },
  { id: 'events', title: 'events', cam: { pos: [-4.2, 3.0, 2.6], look: [0.3, 1.2, -3.0] } },
  { id: 'booking', title: 'booking', cam: { pos: [0, 4.6, 5.8], look: [0, 1.0, -1.5] } },
  { id: 'about', title: 'about', cam: { pos: [2.4, 1.9, 4.4], look: [-0.4, 1.6, -3.2] } },
  { id: 'connect', title: 'connect', cam: { pos: [0, 2.2, 3.2], look: [0, 1.1, -4.2] } },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];
const CAMERA_POSITIONS = SECTIONS.map((s) => s.cam.pos);
const BOOTH_XZ: [number, number] = [0, -4.5];

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
  const { formData, submitted, submitting, error, usesEmailClient, handleChange, handleSubmit } =
    useBookingForm();
  return (
    <SectionPanel title="Booking">
      {submitted ? (
        <p className="text-sm text-white/80">
          {usesEmailClient ? (
            <>
              Your email client should have opened. If it didn't, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline">
                {CONTACT_EMAIL}
              </a>
              .
            </>
          ) : (
            <>
              Thanks — your inquiry is on its way. You can also reach me at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline">
                {CONTACT_EMAIL}
              </a>
              .
            </>
          )}
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
          <button type="submit" disabled={submitting} className="border border-white/60 px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white">
            {submitting ? 'Sending…' : 'Send inquiry →'}
          </button>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              Couldn't send — email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a> instead.
            </p>
          )}
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
  // Adaptive quality: start mid, step resolution with measured FPS, and drop the
  // reflective floor for good once the GPU struggles (no flip-flopping it back).
  const [dpr, setDpr] = useState(isMobile ? 1.25 : 1.5);
  const [lowQuality, setLowQuality] = useState(false);
  const degrade = () => {
    setDpr(1);
    setLowQuality(true);
  };

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

  return (
    <section ref={wrapperRef} className="relative w-full h-[520vh] bg-[#040409]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          dpr={dpr}
          frameloop={inView && pageVisible ? 'always' : 'never'}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <PerformanceMonitor onIncline={() => setDpr(isMobile ? 1.5 : 2)} onDecline={degrade} onFallback={degrade} flipflops={3} />
          <PerspectiveCamera makeDefault fov={46} position={[1.5, 2.4, -1.7]} />
          <ScrollRig progress={progress} />
          <Scene lowQuality={lowQuality} />
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

        {/* Section content panels (reveal as you scroll to each section). All stay
            mounted and stacked in one grid cell, so a playing mix or a half-typed
            booking form survives scrolling to another section. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end p-4 sm:p-8">
          <div className="grid w-full max-w-md">
            {(Object.entries(PANELS) as [SectionId, React.ComponentType][]).map(([id, Panel]) => {
              const active = id === section;
              return (
                <motion.div
                  key={id}
                  initial={false}
                  animate={
                    active
                      ? { opacity: 1, y: 0, visibility: 'visible' }
                      : { opacity: 0, y: 24, transitionEnd: { visibility: 'hidden' } }
                  }
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`col-start-1 row-start-1 self-center ${active ? 'pointer-events-auto' : ''}`}
                  aria-hidden={!active}
                >
                  <Panel />
                </motion.div>
              );
            })}
          </div>
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
