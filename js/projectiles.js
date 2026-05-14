// Módulo para crear y animar proyectiles visuales al disparar
export function spawnProjectile(
  container,
  startX,
  startY,
  targetX,
  targetY,
  opts = {},
) {
  const rect = container.getBoundingClientRect();
  // posiciones relativas al contenedor
  const sx = startX - rect.left;
  const sy = startY - rect.top;
  const tx = targetX - rect.left;
  const ty = targetY - rect.top;

  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const el = document.createElement("div");
  // permitir clase extra para variantes (eg. 'bullet')
  el.className = "projectile" + (opts.className ? ` ${opts.className}` : "");
  el.style.left = sx + "px";
  el.style.top = sy + "px";
  el.style.transform = `translate(-6px, -3px) rotate(${angle}deg)`;
  container.appendChild(el);

  const duration = Math.max(220, Math.min(900, dist * 0.6));

  const anim = el.animate(
    [
      {
        transform: `translate(-6px, -3px) rotate(${angle}deg) translateX(0px)`,
        opacity: 1,
      },
      {
        transform: `translate(-6px, -3px) rotate(${angle}deg) translateX(${dist}px)`,
        opacity: 1,
      },
      {
        transform: `translate(-6px, -3px) rotate(${angle}deg) translateX(${dist}px)`,
        opacity: 0,
      },
    ],
    { duration: duration, easing: "cubic-bezier(.1,.9,.2,1)" },
  );

  return new Promise((resolve) => {
    anim.onfinish = () => {
      el.remove();
      resolve();
    };
  });
}

export default { spawnProjectile };
