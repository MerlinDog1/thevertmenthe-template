import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderNumber = document.getElementById('loaderNumber');

const menu = document.getElementById('menu');
const menuText = document.getElementById('menuText');
const openMenu = document.getElementById('openMenu');
const closeMenu = document.getElementById('closeMenu');
const searchInput = document.getElementById('searchInput');
const artworkList = document.getElementById('artworkList');

const items = [...artworkList.querySelectorAll('li')];

let value = 0;
const tick = setInterval(() => {
  value += Math.random() * 18;
  const v = Math.min(100, Math.floor(value));
  loaderFill.style.width = `${v}%`;
  loaderNumber.textContent = String(v);

  if (v >= 100) {
    clearInterval(tick);
    setTimeout(() => loader.classList.add('hidden'), 280);
  }
}, 140);

function setMenuState(open) {
  menu.classList.toggle('open', open);
  menuText.classList.toggle('open', open);
  openMenu.style.display = open ? 'none' : 'inline-block';
  closeMenu.style.display = open ? 'inline-block' : 'none';
}

openMenu.addEventListener('click', () => setMenuState(true));
closeMenu.addEventListener('click', () => setMenuState(false));

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'm') setMenuState(true);
  if (e.key === 'Escape') setMenuState(false);
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  items.forEach((li) => {
    const show = li.textContent.toLowerCase().includes(q);
    li.style.display = show ? '' : 'none';
  });
});

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe9d9bf, 14, 58);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 4, 8);

// Lighting (warm hotel-lobby ambience)
scene.add(new THREE.HemisphereLight(0xfff4df, 0xd5b894, 0.95));
const spot = new THREE.SpotLight(0xffe2b4, 2.4, 72, Math.PI * 0.3, 0.45, 1.1);
spot.position.set(0, 10, 0);
spot.target.position.set(0, 0, -10);
scene.add(spot, spot.target);

const rim = new THREE.PointLight(0xffdca8, 0.9, 42);
rim.position.set(-8, 3, -8);
scene.add(rim);

const chandelierA = new THREE.PointLight(0xffd28a, 1.2, 30);
chandelierA.position.set(-4.5, 5.2, -1.5);
const chandelierB = new THREE.PointLight(0xffd28a, 1.2, 30);
chandelierB.position.set(4.5, 5.2, 1.5);
scene.add(chandelierA, chandelierB);

// Gallery room
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 34),
  new THREE.MeshStandardMaterial({ color: 0xdcc3a0, roughness: 0.52, metalness: 0.08 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ color: 0xf2e2cb, roughness: 0.85, metalness: 0.02 });
const walls = [
  [0, 3, -17, 26, 6, 0.4],
  [0, 3, 17, 26, 6, 0.4],
  [-13, 3, 0, 0.4, 6, 34],
  [13, 3, 0, 0.4, 6, 34],
];
for (const [x, y, z, w, h, d] of walls) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, y, z);
  scene.add(m);
}

const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 34),
  new THREE.MeshStandardMaterial({ color: 0xf8eddc, roughness: 0.82 })
);
ceiling.position.y = 6;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

// Procedural "Nano Banana-style" artworks (stand-in textures for now)
function makeArtworkTexture(seed, title) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 420;
  const ctx = c.getContext('2d');

  const hue = (seed * 67) % 360;
  const bgA = `hsl(${hue} 45% 87%)`;
  const bgB = `hsl(${(hue + 30) % 360} 45% 80%)`;

  const g = ctx.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, bgA);
  g.addColorStop(1, bgB);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  // organic brush strokes
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = `hsla(${(hue + i * 7) % 360} 65% ${35 + (i % 5) * 8}% / ${0.12 + (i % 6) * 0.07})`;
    ctx.lineWidth = 2 + (i % 6) * 1.2;
    ctx.beginPath();
    let x = Math.random() * c.width;
    let y = Math.random() * c.height;
    ctx.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (Math.random() - 0.5) * 220;
      y += (Math.random() - 0.5) * 140;
      ctx.quadraticCurveTo(
        x + (Math.random() - 0.5) * 80,
        y + (Math.random() - 0.5) * 80,
        x,
        y
      );
    }
    ctx.stroke();
  }

  // ink silhouette shape
  ctx.fillStyle = 'rgba(16, 12, 10, 0.9)';
  ctx.beginPath();
  ctx.moveTo(100, 350);
  ctx.bezierCurveTo(130, 210, 260, 180, 300, 260);
  ctx.bezierCurveTo(340, 320, 420, 320, 470, 240);
  ctx.bezierCurveTo(510, 200, 560, 220, 580, 280);
  ctx.lineTo(610, 365);
  ctx.closePath();
  ctx.fill();

  // paper grain
  for (let n = 0; n < 9000; n++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const a = Math.random() * 0.05;
    ctx.fillStyle = `rgba(20,10,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.font = '600 24px sans-serif';
  ctx.fillText(title, 24, 390);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const frameData = [
  { x: -12.6, y: 2.3, z: -9, ry: Math.PI / 2, name: 'Ink Bloom I' },
  { x: -12.6, y: 2.2, z: 0, ry: Math.PI / 2, name: 'Lobby Figure' },
  { x: -12.6, y: 2.35, z: 9, ry: Math.PI / 2, name: 'Banana Geometry' },
  { x: 12.6, y: 2.3, z: -9, ry: -Math.PI / 2, name: 'Velvet Echo' },
  { x: 12.6, y: 2.2, z: 0, ry: -Math.PI / 2, name: 'Glass Noon' },
  { x: 12.6, y: 2.35, z: 9, ry: -Math.PI / 2, name: 'Desert Study' },
  { x: -6, y: 2.3, z: -16.7, ry: 0, name: 'Moon Hall' },
  { x: 6, y: 2.3, z: -16.7, ry: 0, name: 'Concierge' },
  { x: -6, y: 2.3, z: 16.7, ry: Math.PI, name: 'Ink Field' },
  { x: 6, y: 2.3, z: 16.7, ry: Math.PI, name: 'Morning Tea' },
];

const artMats = [];
for (let i = 0; i < frameData.length; i++) {
  const f = frameData[i];
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 1.7, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xc79c47, roughness: 0.3, metalness: 0.62 })
  );

  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(2.18, 1.33),
    new THREE.MeshStandardMaterial({
      map: makeArtworkTexture(i + 1, f.name),
      roughness: 0.86,
      emissive: new THREE.Color(0x22170f),
      emissiveIntensity: 0.05,
    })
  );
  art.position.z = 0.06;
  artMats.push(art.material);

  group.add(frame, art);
  group.position.set(f.x, f.y, f.z);
  group.rotation.y = f.ry;
  scene.add(group);
}

// More realistic human walker
const walker = new THREE.Group();
const skinMat = new THREE.MeshStandardMaterial({ color: 0xd2a37c, roughness: 0.8 });
const suitMat = new THREE.MeshStandardMaterial({ color: 0x2c2a30, roughness: 0.9 });
const shoeMat = new THREE.MeshStandardMaterial({ color: 0x20160e, roughness: 0.9 });

const hips = new THREE.Group();
walker.add(hips);

const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.72, 8, 12), suitMat);
torso.position.y = 1.33;
hips.add(torso);

const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 12), skinMat);
neck.position.y = 1.82;
hips.add(neck);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), skinMat);
head.position.y = 2.06;
head.scale.set(0.95, 1.08, 0.92);
hips.add(head);

const hair = new THREE.Mesh(new THREE.SphereGeometry(0.225, 20, 20), new THREE.MeshStandardMaterial({ color: 0x1c1512, roughness: 1 }));
hair.position.copy(head.position);
hair.scale.set(0.95, 0.7, 0.95);
hips.add(hair);

function makeLeg(side = 1) {
  const root = new THREE.Group();
  root.position.set(0.12 * side, 0.92, 0);

  const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.42, 5, 8), suitMat);
  thigh.position.y = -0.22;
  root.add(thigh);

  const knee = new THREE.Group();
  knee.position.y = -0.45;
  root.add(knee);

  const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.4, 5, 8), suitMat);
  shin.position.y = -0.2;
  knee.add(shin);

  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.28), shoeMat);
  foot.position.set(0, -0.45, 0.08);
  knee.add(foot);

  return { root, knee };
}

function makeArm(side = 1) {
  const root = new THREE.Group();
  root.position.set(0.29 * side, 1.55, 0);

  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.28, 5, 8), suitMat);
  upper.position.y = -0.14;
  root.add(upper);

  const elbow = new THREE.Group();
  elbow.position.y = -0.3;
  root.add(elbow);

  const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.26, 5, 8), suitMat);
  lower.position.y = -0.13;
  elbow.add(lower);

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), skinMat);
  hand.position.y = -0.29;
  elbow.add(hand);

  return { root, elbow };
}

const legL = makeLeg(-1);
const legR = makeLeg(1);
const armL = makeArm(-1);
const armR = makeArm(1);
hips.add(legL.root, legR.root, armL.root, armR.root);

const shadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.36, 28),
  new THREE.MeshBasicMaterial({ color: 0x2a1b10, transparent: true, opacity: 0.2 })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.02;
walker.add(shadow);

walker.position.set(0, 0, 8);
scene.add(walker);

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

let yaw = Math.PI;
let velocity = 0;
let stride = 0;
const speed = { walk: 4.2, sprint: 6.6, turn: 2.35 };
const room = { x: 11.2, z: 15.2 };

const clock = new THREE.Clock();

function updateMovement(dt) {
  const forward = keys.has('w') || keys.has('arrowup');
  const backward = keys.has('s') || keys.has('arrowdown');
  const left = keys.has('a');
  const right = keys.has('d');

  if (keys.has('arrowleft')) yaw += speed.turn * dt;
  if (keys.has('arrowright')) yaw -= speed.turn * dt;

  const max = keys.has('shift') ? speed.sprint : speed.walk;
  let intent = 0;
  if (forward) intent += 1;
  if (backward) intent -= 1;

  velocity = THREE.MathUtils.damp(velocity, intent * max, 7, dt);

  const moveDir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const strafeDir = new THREE.Vector3(moveDir.z, 0, -moveDir.x);

  walker.position.addScaledVector(moveDir, velocity * dt);
  const strafeSpeed = max * 0.72;
  if (left) walker.position.addScaledVector(strafeDir, strafeSpeed * dt);
  if (right) walker.position.addScaledVector(strafeDir, -strafeSpeed * dt);

  walker.position.x = THREE.MathUtils.clamp(walker.position.x, -room.x, room.x);
  walker.position.z = THREE.MathUtils.clamp(walker.position.z, -room.z, room.z);

  if (Math.abs(velocity) > 0.05 || left || right) {
    let targetYaw = yaw;
    if (left) targetYaw += Math.PI / 2;
    if (right) targetYaw -= Math.PI / 2;
    walker.rotation.y = THREE.MathUtils.lerp(walker.rotation.y, targetYaw, 0.14);
  }

  const moving = Math.abs(velocity) > 0.2 || left || right;
  stride += (moving ? 1 : 0) * dt * (keys.has('shift') ? 9.5 : 6.2);
  const swing = Math.sin(stride) * (moving ? 0.8 : 0.05);

  legL.root.rotation.x = -swing * 0.7;
  legR.root.rotation.x = swing * 0.7;
  legL.knee.rotation.x = Math.max(0, swing) * 0.65;
  legR.knee.rotation.x = Math.max(0, -swing) * 0.65;

  armL.root.rotation.x = swing * 0.5;
  armR.root.rotation.x = -swing * 0.5;
  armL.elbow.rotation.x = Math.max(0, -swing) * 0.35;
  armR.elbow.rotation.x = Math.max(0, swing) * 0.35;

  hips.position.y = 0.03 + Math.abs(Math.sin(stride * 2)) * (moving ? 0.05 : 0.01);
  torso.rotation.z = Math.sin(stride * 0.5) * 0.05;
  head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, (left ? 0.18 : right ? -0.18 : 0), 0.08);
}

function updateCamera(dt) {
  const offset = new THREE.Vector3(0, 2.9, 5.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + Math.PI);
  const targetCam = walker.position.clone().add(offset);
  camera.position.lerp(targetCam, 1 - Math.exp(-dt * 5.4));

  const look = walker.position.clone().add(new THREE.Vector3(0, 1.45, 0));
  camera.lookAt(look);
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  updateMovement(dt);
  updateCamera(dt);

  const t = clock.elapsedTime;
  artMats.forEach((mat, i) => {
    mat.emissiveIntensity = 0.04 + Math.sin(t * 1.1 + i * 0.9) * 0.015;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
