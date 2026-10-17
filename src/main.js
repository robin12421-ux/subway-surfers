import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stops } from './content.js';
import { createTrain, createEnvironment } from './train.js';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const panelsRoot = document.querySelector('#content-panels');
panelsRoot.innerHTML = stops.map((stop, i) => `
  <section class="stop-section scene-section" id="door-${i + 1}" data-stop="${i}" aria-labelledby="title-${i}">
    <div class="section-index"><span>${stop.kicker}</span><strong>${stop.number}<i> / 05</i></strong></div>
    <div class="info-panel" id="panel-${i}">
      <div class="panel-top"><span class="panel-symbol">${stop.icon}</span><span class="panel-tag">TRACK 05 <i>•</i> FIELD NOTES</span></div>
      <h2 id="title-${i}">${stop.title}</h2><p class="panel-description">${stop.description}</p>
      <div class="fact-list">${stop.facts.map(f => `<article class="fact"><span class="fact-number">${f[0]}</span><div><h3>${f[1]}</h3><p>${f[2]}</p></div><span class="fact-arrow">↗</span></article>`).join('')}</div>
      <div class="panel-bottom"><span>YOU’RE AT STOP ${stop.number}</span><span class="panel-line"></span><span>KEEP EXPLORING ↓</span></div>
    </div>
    <div class="section-caption"><span>THE VIDEO LINE</span><span>${stop.short}</span></div>
  </section>`).join('');

const canvas = document.querySelector('#scene');
let renderer, scene, camera, train, doorRefs = [], environmentReady = false;
const cameraTarget = new THREE.Vector3();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: window.devicePixelRatio < 2, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#090b12');
  scene.fog = new THREE.FogExp2('#090b12', 0.018);
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 180);
  camera.position.set(8.8, 5.4, 13.5);
  scene.add(new THREE.HemisphereLight('#a9c9ff', '#18101c', 2.0));
  const key = new THREE.DirectionalLight('#e9efff', 3.2); key.position.set(-5, 9, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
  const rim = new THREE.PointLight('#ff234d', 18, 34, 2); rim.position.set(4.5, 3.5, -2); scene.add(rim);
  createEnvironment(scene);
  const built = createTrain(scene); train = built.train; doorRefs = built.doors; environmentReady = true;
} catch (error) {
  console.warn('WebGL setup unavailable:', error);
  document.querySelector('#webgl-fallback').hidden = false;
  canvas.style.display = 'none';
}

function cameraForProgress(p) {
  // A slow push down the tunnel with a focused pause at each of the five doors.
  const segment = Math.min(4, Math.floor(p * 5));
  const local = p >= 1 ? 1 : (p * 5 - segment);
  const focusZ = 5.8 - segment * 2.98;
  const focus = local < 0.22 ? local / 0.22 : local < 0.72 ? 1 : 1 - (local - 0.72) / 0.28;
  const trainTravel = p * 29;
  const closeZ = THREE.MathUtils.lerp(10.8, 4.9, focus);
  const closeX = THREE.MathUtils.lerp(8.8, 6.2, focus);
  const closeY = THREE.MathUtils.lerp(5.4, 3.05, focus);
  camera.position.set(closeX, closeY, 13.5 - trainTravel + closeZ * 0.35);
  cameraTarget.set(0, 2.25, -trainTravel + THREE.MathUtils.lerp(0, focusZ, focus));
  camera.lookAt(cameraTarget);
  if (train) train.position.z = -trainTravel;
  if (train) {
    train.rotation.y = Math.sin(p * Math.PI * 2) * 0.008;
    doorRefs.forEach((door) => {
      // A door opens only while its scroll segment is in the focus window.
      const isCurrent = door.stopIndex === segment;
      const opening = isCurrent ? THREE.MathUtils.clamp((local - 0.24) / 0.16, 0, 1) * (1 - THREE.MathUtils.clamp((local - 0.69) / 0.12, 0, 1)) : 0;
      door.group.position.z = door.originalZ + (door.stopIndex * 0); // preserve its position; animate panel below
      door.panel.position.z = THREE.MathUtils.lerp(0, 0.48, opening);
      door.panel.material = opening > 0.03 ? door.panel.material : door.panel.material;
    });
  }
}

let lastProgress = -1;
function render() {
  requestAnimationFrame(render);
  if (!renderer || !environmentReady) return;
  const progress = ScrollTrigger.maxScroll(window) ? window.scrollY / ScrollTrigger.maxScroll(window) : 0;
  if (Math.abs(progress - lastProgress) > 0.0002) { cameraForProgress(progress); lastProgress = progress; }
  renderer.render(scene, camera);
}
render();

function setActiveStop(index) {
  const stop = stops[index];
  document.querySelector('#door-count').innerHTML = `DOOR ${stop.number} <i>/</i> 05`;
  document.querySelector('#door-name').textContent = stop.short;
  document.querySelectorAll('.stop-markers .stop').forEach((el, i) => el.classList.toggle('active', i === index));
}

if (!reducedMotion) {
  document.querySelectorAll('.stop-section').forEach((section, index) => {
    const panel = section.querySelector('.info-panel');
    gsap.fromTo(panel, { opacity: 0.18, y: 44, scale: 0.97 }, {
      opacity: 1, y: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 68%', end: 'top 24%', scrub: 0.65,
        onEnter: () => setActiveStop(index), onEnterBack: () => setActiveStop(index) }
    });
  });
  gsap.to('#progress-fill', { width: '100%', ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } });
} else {
  document.querySelectorAll('.info-panel').forEach(panel => { panel.style.opacity = 1; panel.style.transform = 'none'; });
  ScrollTrigger.create({ trigger: '#content-panels', start: 'top top', end: 'bottom bottom', onUpdate: self => { document.querySelector('#progress-fill').style.width = `${self.progress * 100}%`; } });
}
// Scroll progress and camera motion are derived from page progress, so reversing scroll reverses the ride.
ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: self => {
  const journeyProgress = THREE.MathUtils.clamp((self.progress - 0.06) / 0.78, 0, 0.9999);
  const current = Math.min(4, Math.floor(journeyProgress * 5));
  setActiveStop(current);
  if (renderer && environmentReady) cameraForProgress(journeyProgress);
}});

window.addEventListener('resize', () => {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = window.innerWidth < 700 ? 54 : 42;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.65));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  ScrollTrigger.refresh();
});

document.querySelector('#replay').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.querySelector(link.getAttribute('href'));
  if (target) { event.preventDefault(); target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }
}));

// Mobile performance: keep the same experience, but lower renderer resolution and shadows on small screens.
if (window.innerWidth < 700 && renderer) renderer.shadowMap.enabled = false;
