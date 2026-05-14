// Crea partículas flotantes decorativas dentro de un contenedor
export default function initParticles(parentEl, count = 14) {
  if (!parentEl) return null;
  const container = parentEl.querySelector("#particles") || parentEl;
  // limpiar si ya hay
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    const size = 6 + Math.round(Math.random() * 14);
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.top = Math.random() * 100 + "%";
    p.style.opacity = (0.15 + Math.random() * 0.6).toFixed(2);
    p.style.transform = `translate3d(-50%,-50%,0) scale(${0.7 + Math.random() * 0.8})`;
    p.style.animationDelay = Math.random() * 6 + "s";
    p.style.animationDuration = 8 + Math.random() * 12 + "s";
    // color pastel aleatorio
    const hues = [340, 28, 48, 200, 160, 260];
    const h = hues[Math.floor(Math.random() * hues.length)];
    p.style.background = `linear-gradient(180deg, hsla(${h},70%,85%,0.95), hsla(${h},70%,65%,0.95))`;
    container.appendChild(p);
  }
  return container;
}
