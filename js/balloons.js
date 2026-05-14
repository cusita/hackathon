import cfg from "./config.js";
import { spawnProjectile } from "./projectiles.js";

// Genera los globos y administra su animación y eventos.
export default class Balloons {
  constructor(container, confetti, inputs) {
    this.container = container;
    this.confetti = confetti;
    this.inputs = inputs;
    this.balloons = new Map();
    this.floatPhase = 0;
    this.raf = null;
    this._lastFrame = 0;
    this.speedFactor = 2.8; // multiplicador de velocidad aumentado (ajustable)
    this.createBalloons();
    this.container.addEventListener("click", (e) => this.onClick(e));
    this.arc = document.getElementById("arc");
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
      // posición inicial aleatoria dentro del contenedor (todo el área)
      const rect = this.container.getBoundingClientRect();
      const w = parseFloat(el.style.width) || cfg.balloonSizes.w;
      const h = parseFloat(el.style.height) || cfg.balloonSizes.h;
      const x = Math.random() * Math.max(1, rect.width - w);
      const y = Math.random() * Math.max(1, rect.height - h);
      el.style.transform = `translate(${x}px, ${y}px) translateZ(0)`;
      el.style.visibility = "";
      // velocidad aleatoria para movimiento libre
      const vx = (Math.random() - 0.5) * 80 * this.speedFactor; // px/s
      const vy = (Math.random() - 0.5) * 60 * this.speedFactor; // px/s
      this.balloons.set(el, {
        x,
        y,
        vx,
        vy,
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.startFloat();
  }

  startFloat() {
    const loop = (now) => {
      if (!this._lastFrame) this._lastFrame = now;
      const dt = Math.min(0.05, (now - this._lastFrame) / 1000); // segundos (cap dt)
      this._lastFrame = now;
      this.floatPhase += dt * 6.0;
      const t = performance.now() / 1000;
      const rect = this.container.getBoundingClientRect();

      for (const [el, data] of this.balloons.entries()) {
        // update positions
        data.x += data.vx * dt;
        data.y += data.vy * dt;

        // añadir pequeño sway para globos (solo estética)
        const sway = Math.sin(t * 2 + data.phase) * 10;
        const sx = data.x + sway;
        const sy = data.y + Math.cos(t * 1.5 + data.phase) * 6;

        el.style.visibility = "";
        el.style.transform = `translate(${sx}px, ${sy}px) translateZ(0)`;

        // rebote en los bordes del contenedor
        const elRect = el.getBoundingClientRect();
        const w = elRect.width;
        const h = elRect.height;

        if (data.x <= 0 && data.vx < 0) data.vx = -data.vx;
        if (data.x + w >= rect.width && data.vx > 0) data.vx = -data.vx;
        if (data.y <= 0 && data.vy < 0) data.vy = -data.vy;
        if (data.y + h >= rect.height && data.vy > 0) data.vy = -data.vy;
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
    // disparar una "bala negra" visual desde la fila/arco hacia el globo
    const startRect = this.arc
      ? this.arc.getBoundingClientRect()
      : this.container.getBoundingClientRect();
    const startX = (startRect.left + startRect.right) / 2;
    const startY =
      startRect.top + (this.arc ? startRect.height / 2 : startRect.height - 10);
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    spawnProjectile(this.container, startX, startY, targetX, targetY, {
      className: "bullet",
    }).then(() => {
      // al llegar, emitir evento de hit y aplicar efecto
      this.container.dispatchEvent(
        new CustomEvent("balloon:hit", {
          detail: { value, x: targetX, y: targetY },
        }),
      );
      this.popEffect(target, rect);
    });
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

    // reposicionar el globo a una nueva ubicación aleatoria dentro del área
    const data = this.balloons.get(target);
    if (data) {
      const w = parseFloat(target.style.width) || cfg.balloonSizes.w;
      const h = parseFloat(target.style.height) || cfg.balloonSizes.h;
      const newX = Math.random() * Math.max(1, cRectMain.width - w);
      const newY = Math.random() * Math.max(1, cRectMain.height - h);

      // animar salida (fade/scale), luego actualizar posición y velocidad y animar entrada
      const initialTransform =
        target.style.transform || `translate(${data.x}px, ${data.y}px)`;
      const outAnim = target.animate(
        [
          { transform: initialTransform, opacity: 1 },
          { transform: initialTransform + " scale(0.5)", opacity: 0 },
        ],
        { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
      );

      outAnim.onfinish = () => {
        // actualizar coordenadas y asignar nueva velocidad aleatoria
        data.x = newX;
        data.y = newY;
        data.vx = (Math.random() - 0.5) * 80 * this.speedFactor;
        data.vy = (Math.random() - 0.5) * 60 * this.speedFactor;
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
