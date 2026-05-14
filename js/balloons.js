import cfg from "./config.js";

// Genera los globos y administra su animación y eventos.
export default class Balloons {
  constructor(container, confetti, inputs) {
    this.container = container;
    this.confetti = confetti;
    this.inputs = inputs;
    this.balloons = new Map();
    this.floatPhase = 0;
    this.raf = null;
    this.createBalloons();
    this.container.addEventListener("click", (e) => this.onClick(e));
    this.container.addEventListener("pointermove", (e) =>
      this.onPointerMove(e),
    );
    // escuchar cambios de campo activo para cambiar a monedas
    document.addEventListener("inputs:active", (e) => {
      const active = e && e.detail && e.detail.active;
      this.updateVisualMode(active);
    });
    // aplicar modo inicial según inputs
    if (this.inputs && this.inputs.active)
      this.updateVisualMode(this.inputs.active);
  }

  createBalloons() {
    // Crear 10 globos 0..9
    for (let i = 0; i < cfg.balloonCount; i++) {
      const el = document.createElement("div");
      const mode =
        this.inputs && this.inputs.active === "transfer" ? "coin" : "balloon";
      // no aplicar la clase de tema a las monedas para evitar que hereden colores
      el.className = mode === "coin" ? "coin" : `balloon b${i % 10}`;
      el.dataset.theme = mode === "coin" ? "" : `b${i % 10}`;
      el.dataset.value = String(i % 10);
      el.style.width = cfg.balloonSizes.w + "px";
      el.style.height = cfg.balloonSizes.h + "px";
      el.innerHTML =
        mode === "balloon"
          ? `<span>${i % 10}</span><div class="string"></div>`
          : `<span>${i % 10}</span>`;
      this.container.appendChild(el);
      // posición inicial aleatoria dentro del contenedor
      const rect = this.container.getBoundingClientRect();
      const x = Math.random() * (rect.width - cfg.balloonSizes.w);
      const y = Math.random() * (rect.height * 0.6);
      el.style.transform = `translate(${x}px, ${y}px) translateZ(0)`;
      el.style.visibility = "";
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
      this.floatPhase += 0.09;
      const t = performance.now() / 1000;
      for (const [el, data] of this.balloons.entries()) {
        // animación de flotación usando transform (para performance)
        const dx = Math.sin(t * 3.6 + data.phase) * 16;
        const dy = Math.cos(t * 3.0 + data.phase) * 12;
        el.style.visibility = "";
        el.style.transform = `translate(${data.baseX + dx}px, ${data.baseY + dy}px) translateZ(0)`;
      }
      this.raf = requestAnimationFrame(loop);
    };
    if (!this.raf) this.raf = requestAnimationFrame(loop);
  }

  onClick(e) {
    const target = e.target.closest(".balloon, .coin");
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
    // efecto de explosión y reposicionar el globo
    this.popEffect(target, rect);
  }

  updateVisualMode(active) {
    const mode = active === "transfer" ? "coin" : "balloon";
    for (const el of this.balloons.keys()) {
      const theme = mode === "coin" ? "" : el.dataset.theme || "b0";
      const value = el.dataset.value || "0";
      el.className = mode === "coin" ? "coin" : `${mode} ${theme}`;
      if (mode === "coin") {
        el.style.width = "56px";
        el.style.height = "56px";
        el.innerHTML = `<span>${value}</span>`;
      } else {
        el.style.width = cfg.balloonSizes.w + "px";
        el.style.height = cfg.balloonSizes.h + "px";
        el.innerHTML = `<span>${value}</span><div class="string"></div>`;
      }
    }
  }

  popEffect(target, rect) {
    // usar confetti en canvas si está disponible
    const cRectMain = this.container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - cRectMain.left;
    const cy = rect.top + rect.height / 2 - cRectMain.top;
    const count = 18;
    if (this.confetti && typeof this.confetti.spawn === "function") {
      this.confetti.spawn(cx, cy, count);
    }

    // reposicionar el globo a una nueva ubicación aleatoria
    const data = this.balloons.get(target);
    if (data) {
      const newX = Math.random() * (cRectMain.width - cfg.balloonSizes.w);
      const newY = Math.random() * (cRectMain.height * 0.6);

      // animar salida (fade/scale), luego actualizar base y animar entrada
      const initialTransform =
        target.style.transform || `translate(${data.baseX}px, ${data.baseY}px)`;
      const outAnim = target.animate(
        [
          { transform: initialTransform, opacity: 1 },
          { transform: initialTransform + " scale(0.5)", opacity: 0 },
        ],
        { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
      );

      outAnim.onfinish = () => {
        // actualizar base para la animación de flotación
        data.baseX = newX;
        data.baseY = newY;
        // forzar transform a la nueva base (el loop lo ajustará con dx/dy)
        target.style.transform = `translate(${newX}px, ${newY}px) translateZ(0)`;
        // animar entrada suave
        target.animate(
          [
            {
              transform: `translate(${newX}px, ${newY}px) scale(0.6)`,
              opacity: 0,
            },
            {
              transform: `translate(${newX}px, ${newY}px) scale(1)`,
              opacity: 1,
            },
          ],
          { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      };
    }
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
