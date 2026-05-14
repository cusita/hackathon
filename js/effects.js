// Efectos visuales: animación cuando se agrega número y confeti
export function animateAdd(targetEl) {
  if (!targetEl) return;
  targetEl.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(1.12)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 },
    ],
    { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" },
  );
}

// Confetti simple en canvas — no usar librerías externas
export function Confetti(canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let raf = null;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  function spawn(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -6 - 2,
        size: 2 + Math.random() * 6,
        color: `hsl(${Math.random() * 360},80%,60%)`,
        life: 60 + Math.random() * 60,
      });
    }
    if (!raf) loop();
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      if (p.life <= 0 || p.y > canvas.height + 20) particles.splice(i, 1);
    }
    if (particles.length === 0) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener("resize", resize);
  return {
    spawn,
    destroy() {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
