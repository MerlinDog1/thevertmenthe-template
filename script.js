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
scene.fog = new THREE.Fog(0x090909, 8, 42);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 4, 8);

// Lighting
scene.add(new THREE.HemisphereLight(0xffffff, 0x141414, 0.45));
const spot = new THREE.SpotLight(0xffffff, 1.6, 60, Math.PI * 0.24, 0.5, 1.4);
spot.position.set(0, 9, 0);
spot.target.position.set(0, 0, -10);
spot.castShadow = false;
scene.add(spot, spot.target);

const rim = new THREE.PointLight(0xb7c5ff, 0.55, 30);
rim.position.set(-8, 2, -8);
scene.add(rim);

// Gallery room
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 34),
  new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.95, metalness: 0.02 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.92, metalness: 0.02 });
const walls = [
  [0, 3, -17, 26, 6, 0.4, 0],
  [0, 3, 17, 26, 6, 0.4, 0],
  [-13, 3, 0, 0.4, 6, 34, 0],
  [13, 3, 0, 0.4, 6, 34, 0],
];
for (const [x, y, z, w, h, d] of walls) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, y, z);
  scene.add(m);
}

const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 34),
  new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.9 })
);
ceiling.position.y = 6;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

// Frames
const frameData = [
  { x: -12.6, y: 2.3, z: -9, ry: Math.PI / 2, hue: 210 },
  { x: -12.6, y: 2.2, z: 0, ry: Math.PI / 2, hue: 320 },
  { x: -12.6, y: 2.35, z: 9, ry: Math.PI / 2, hue: 40 },
  { x: 12.6, y: 2.3, z: -9, ry: -Math.PI / 2, hue: 25 },
  { x: 12.6, y: 2.2, z: 0, ry: -Math.PI / 2, hue: 180 },
  { x: 12.6, y: 2.35, z: 9, ry: -Math.PI / 2, hue: 280 },
  { x: -6, y: 2.3, z: -16.7, ry: 0, hue: 130 },
  { x: 6, y: 2.3, z: -16.7, ry: 0, hue: 10 },
  { x: -6, y: 2.3, z: 16.7, ry: Math.PI, hue: 200 },
  { x: 6, y: 2.3, z: 16.7, ry: Math.PI, hue: 350 },
];

const artMats = [];
for (const f of frameData) {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 1.7, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xb09045, roughness: 0.4, metalness: 0.45 })
  );

  const c = new THREE.Color(`hsl(${f.hue} 60% 52%)`);
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(2.18, 1.33),
    new THREE.MeshStandardMaterial({ color: c, emissive: c.clone().multiplyScalar(0.1), roughness: 0.8 })
  );
  art.position.z = 0.06;
  artMats.push(art.material);

  group.add(frame, art);
  group.position.set(f.x, f.y, f.z);
  group.rotation.y = f.ry;
  scene.add(group);
}

// Silhouette walker
const walker = new THREE.Group();

const silhouetteMat = new THREE.MeshStandardMaterial({ color: 0x040404, roughness: 1, metalness: 0 });
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.9, 8, 12), silhouetteMat);
body.position.y = 1.2;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 18), silhouetteMat);
head.position.y = 2.0;
const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.6, 5, 8), silhouetteMat);
const legR = legL.clone();
legL.position.set(-0.16, 0.45, 0);
legR.position.set(0.16, 0.45, 0);
const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 5, 8), silhouetteMat);
const armR = armL.clone();
armL.position.set(-0.45, 1.25, 0);
armR.position.set(0.45, 1.25, 0);
armL.rotation.z = 0.25;
armR.rotation.z = -0.25;

const shadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.42, 28),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34 })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.03;

walker.add(body, head, legL, legR, armL, armR, shadow);
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

  // turn in move direction for natural silhouette walk
  if (Math.abs(velocity) > 0.05 || left || right) {
    let targetYaw = yaw;
    if (left) targetYaw += Math.PI / 2;
    if (right) targetYaw -= Math.PI / 2;
    walker.rotation.y = THREE.MathUtils.lerp(walker.rotation.y, targetYaw, 0.14);
  }

  const moving = Math.abs(velocity) > 0.2 || left || right;
  stride += (moving ? 1 : 0) * dt * (keys.has('shift') ? 9.5 : 6.2);
  const swing = Math.sin(stride) * (moving ? 0.55 : 0.08);
  legL.rotation.x = swing;
  legR.rotation.x = -swing;
  armL.rotation.x = -swing * 0.8;
  armR.rotation.x = swing * 0.8;
  body.rotation.z = Math.sin(stride * 0.5) * 0.05;
}

function updateCamera(dt) {
  const offset = new THREE.Vector3(0, 3.25, 6.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + Math.PI);
  const targetCam = walker.position.clone().add(offset);
  camera.position.lerp(targetCam, 1 - Math.exp(-dt * 5.4));

  const look = walker.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  camera.lookAt(look);
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  updateMovement(dt);
  updateCamera(dt);

  const t = clock.elapsedTime;
  artMats.forEach((mat, i) => {
    mat.emissiveIntensity = 0.08 + Math.sin(t * 1.5 + i * 0.8) * 0.03;
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
