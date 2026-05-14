import cfg from "./config.js";

// Genera los globos y administra su animación y eventos.
export default class Balloons {
  constructor(container) {
    this.container = container;
    this.balloons = new Map();
    this.floatPhase = 0;
    this.raf = null;
    this.createBalloons();
    this.container.addEventListener("click", (e) => this.onClick(e));
    this.container.addEventListener("pointermove", (e) =>
      this.onPointerMove(e),
    );
  }

  createBalloons() {
    // Crear 10 globos 0..9
    for (let i = 0; i < cfg.balloonCount; i++) {
      const el = document.createElement("div");
      el.className = `balloon b${i % 10}`;
      el.dataset.value = String(i % 10);
      el.style.width = cfg.balloonSizes.w + "px";
      el.style.height = cfg.balloonSizes.h + "px";
      el.innerHTML = `<span>${i % 10}</span><div class="string"></div>`;
      this.container.appendChild(el);
      // posición inicial aleatoria dentro del contenedor
      const rect = this.container.getBoundingClientRect();
      const x = Math.random() * (rect.width - cfg.balloonSizes.w);
      const y = Math.random() * (rect.height * 0.6);
      el.style.transform = `translate(${x}px, ${y}px)`;
      this.balloons.set(el, {
        x,
        y,
        baseX: x,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.startFloat();
  }

  startFloat() {
    const loop = () => {
      this.floatPhase += 0.01;
      const t = performance.now() / 1000;
      for (const [el, data] of this.balloons.entries()) {
        // animación de flotación usando transform (para performance)
        const dx = Math.sin(t + data.phase) * 8;
        const dy = Math.cos(t * 0.9 + data.phase) * 6;
        el.style.transform = `translate(${data.baseX + dx}px, ${data.baseY + dy}px) translateZ(0)`;
      }
      this.raf = requestAnimationFrame(loop);
    };
    if (!this.raf) this.raf = requestAnimationFrame(loop);
  }

  onClick(e) {
    const target = e.target.closest(".balloon");
    if (!target) return;
    // rebote visual
    target.animate(
      [
        { transform: target.style.transform },
        { transform: target.style.transform + " scale(1.12)" },
        { transform: target.style.transform },
      ],
      { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    const value = target.dataset.value;
    const rect = target.getBoundingClientRect();
    // emitir evento personalizado para hit
    this.container.dispatchEvent(
      new CustomEvent("balloon:hit", {
        detail: {
          value,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
      }),
    );
  }

  onPointerMove(e) {
    // emitir posición del puntero para que el arco/arrow apunte
    const rect = this.container.getBoundingClientRect();
    this.container.dispatchEvent(
      new CustomEvent("pointer:pos", {
        detail: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      }),
    );
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.container.innerHTML = "";
    this.balloons.clear();
  }
}
