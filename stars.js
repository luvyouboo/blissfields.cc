const canvas = document.getElementById('stars');
const ctx    = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();

// Controls
const STAR_COUNT     = 320;
const SHOOT_EVERY    = 5000;
const MOUSE_RADIUS   = 40;
const MOUSE_STRENGTH = 0.5;
const DAMPING        = 0.92;
const BASE_SPEED     = 0.08;

const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
const PARALLAX_STRENGTH = 0.035; 
const PARALLAX_EASE     = 0.06; 

const mouse = { x: -9999, y: -9999, overCard: false };

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  parallax.tx = (e.clientX - cx) * PARALLAX_STRENGTH;
  parallax.ty = (e.clientY - cy) * PARALLAX_STRENGTH;

  const card = document.querySelector('.card');
  if (card) {
    const rect = card.getBoundingClientRect();
    mouse.overCard = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top  &&
      e.clientY <= rect.bottom
    );
  }
});

window.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
  mouse.overCard = false;
  parallax.tx = 0;
  parallax.ty = 0;
});

function createStar() {
  const angle = Math.random() * Math.PI * 2;
  const speed = BASE_SPEED + Math.random() * 0.06;
  return {
    x:     Math.random() * window.innerWidth,
    y:     Math.random() * window.innerHeight,
    r:     Math.random() * 1.8 + 0.4,
    alpha: Math.random(),
    fade:  Math.random() * 0.004 + 0.002,
    dir:   Math.random() > 0.5 ? 1 : -1,
    vx:    Math.cos(angle) * speed,
    vy:    Math.sin(angle) * speed,
  };
}

const stars = Array.from({ length: STAR_COUNT }, () => createStar());

window.addEventListener('resize', () => {
  resize();
  stars.length = 0;
  stars.push(...Array.from({ length: STAR_COUNT }, () => createStar()));
});

let shootingStar = null;

function launchShootingStar() {
  shootingStar = {
    x:     Math.random() * window.innerWidth  * 0.6,
    y:     Math.random() * window.innerHeight * 0.4,
    len:   Math.random() * 120 + 60,
    speed: Math.random() * 10 + 8,
    alpha: 1,
    angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15),
    fade:  0.018,
  };
}

setTimeout(launchShootingStar, 1500);
setInterval(launchShootingStar, SHOOT_EVERY);

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Ease parallax offset toward target
  parallax.x += (parallax.tx - parallax.x) * PARALLAX_EASE;
  parallax.y += (parallax.ty - parallax.y) * PARALLAX_EASE;

  for (const s of stars) {
    if (!mouse.overCard) {
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
      }
    }

    s.vx *= DAMPING;
    s.vy *= DAMPING;

    const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    if (spd < BASE_SPEED) {
      const scale = BASE_SPEED / (spd || 1);
      s.vx *= scale;
      s.vy *= scale;
    }

    s.x += s.vx;
    s.y += s.vy;

    if (s.x < -2) s.x = window.innerWidth + 2;
    if (s.x > window.innerWidth  + 2) s.x = -2;
    if (s.y < -2) s.y = window.innerHeight + 2;
    if (s.y > window.innerHeight + 2) s.y = -2;

    s.alpha += s.fade * s.dir;
    if (s.alpha >= 1)   { s.alpha = 1;   s.dir = -1; }
    if (s.alpha <= 0.1) { s.alpha = 0.1; s.dir =  1; }

    ctx.beginPath();
    ctx.arc(s.x + parallax.x, s.y + parallax.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha})`;
    ctx.fill();
  }

  if (shootingStar) {
    const s = shootingStar;
    ctx.save();
    ctx.translate(s.x + parallax.x, s.y + parallax.y);
    ctx.rotate(s.angle);
    const grad = ctx.createLinearGradient(-s.len, 0, 0, 0);
    grad.addColorStop(0, `rgba(255,255,255,0)`);
    grad.addColorStop(1, `rgba(255,255,255,${s.alpha})`);
    ctx.beginPath();
    ctx.moveTo(-s.len, 0);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
    ctx.restore();
    s.x     += Math.cos(s.angle) * s.speed;
    s.y     += Math.sin(s.angle) * s.speed;
    s.alpha -= s.fade;
    if (s.alpha <= 0) shootingStar = null;
  }

  requestAnimationFrame(draw);
}

draw();