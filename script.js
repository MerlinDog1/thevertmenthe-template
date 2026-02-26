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
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener('resize', resize);

const points = Array.from({ length: 70 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: Math.random() * 1.4 + 0.2,
  vx: (Math.random() - 0.5) * 0.25,
  vy: (Math.random() - 0.5) * 0.25,
}));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, '#0b0b0b');
  g.addColorStop(1, '#191919');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  for (const p of points) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
draw();
