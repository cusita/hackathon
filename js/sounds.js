// Módulo de sonido: usa WebAudio para generar efectos sin archivos externos
let audioCtx = null;
function ensureCtx() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

export function playShoot() {
  if (!window || typeof window === "undefined") return;
  ensureCtx();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(880, audioCtx.currentTime);
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.28);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.3);
}

export function playPop() {
  ensureCtx();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(600, audioCtx.currentTime);
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.26);
  const f = audioCtx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 800;
  o.connect(f);
  f.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.28);
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}
