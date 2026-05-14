import cfg from "./config.js";
import Balloons from "./balloons.js";
import Inputs from "./inputs.js";
import { Confetti } from "./effects.js";
import * as SND from "./sounds.js";

export default class Game {
  constructor() {
    this.balloonContainer = document.getElementById("balloonContainer");
    this.arc = document.getElementById("arc");
    this.arrow = document.getElementById("arrow");
    this.scoreEl = document.getElementById("score");
    this.confettiCanvas = document.getElementById("confettiCanvas");

    this.inputs = new Inputs();
    this.balloons = new Balloons(this.balloonContainer);
    this.confetti = Confetti(this.confettiCanvas);
    this.score = 0;

    this.setupEvents();
    // touch friendly: resume audio on first interaction
    document.body.addEventListener("pointerdown", () => SND.resumeAudio(), {
      once: true,
    });
  }

  setupEvents() {
    // apuntar con el mouse/pointer
    this.balloonContainer.addEventListener("pointer:pos", (e) =>
      this.updateAim(e.detail),
    );
    // impacto sobre globo
    this.balloonContainer.addEventListener("balloon:hit", (e) =>
      this.onBalloonHit(e.detail),
    );

    // controles
    document
      .getElementById("backBtn")
      .addEventListener("click", () => this.inputs.backspace());
    document
      .getElementById("clearBtn")
      .addEventListener("click", () => this.inputs.clear());

    // teclado: permitir escribir números directamente
    window.addEventListener("keydown", (e) => {
      if (/^[0-9]$/.test(e.key)) this.addDigit(e.key);
      if (e.key === "Backspace") this.inputs.backspace();
      if (e.key === "Tab") {
        e.preventDefault();
        this.toggleActive();
      }
    });
  }

  updateAim(pos) {
    // calcular ángulo desde el arco al puntero
    const arcRect = this.arc.getBoundingClientRect();
    const centerX = arcRect.left + arcRect.width / 2;
    const centerY = arcRect.top + arcRect.height / 2;
    const dx =
      pos.x + this.balloonContainer.getBoundingClientRect().left - centerX;
    const dy =
      pos.y + this.balloonContainer.getBoundingClientRect().top - centerY;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    this.arrow.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    // opcional: guardar puntero para disparar si se desea
    this._aimPos = pos;
  }

  onBalloonHit(detail) {
    // reproducir sonido y sumar al campo activo
    SND.playShoot();
    const added = this.addDigit(detail.value);
    if (added) {
      SND.playPop();
      this.score += cfg.scoring.perHit;
      this.scoreEl.textContent = String(this.score);
      // condicion para confetti: si cuenta tiene longitud mínima o transferencia supera valor
      const acc = this.inputs.getValue("account");
      const tr = this.inputs.getValue("transfer");
      if (acc.length >= cfg.confettiThreshold.account) {
        this.confetti.spawn(window.innerWidth / 2, 120);
      }
      if (Number(tr) >= cfg.confettiThreshold.transferValue) {
        this.confetti.spawn(window.innerWidth / 2, 120);
      }
    }
  }

  addDigit(d) {
    return this.inputs.addDigit(d);
  }

  toggleActive() {
    this.inputs.setActive(
      this.inputs.active === "account" ? "transfer" : "account",
    );
  }
}
