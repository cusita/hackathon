import Game from "./game.js";

// Punto de entrada principal
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar juego
  const game = new Game();
  // Exponer para debug en desarrollo
  window.__BalloonGame = game;

  // Botón de confirmar transferencia: redirige a confirm.html con params
  const confirmBtn = document.getElementById("confirmBtn");
  const confirmDefaultText = confirmBtn
    ? confirmBtn.textContent.trim()
    : "Confirmar transferencia";
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const account = game.inputs.getValue("account").trim();
      const value = game.inputs.getValue("transfer").trim();
      const errEl = document.getElementById("confirmError");

      if (!account || !value) {
        if (errEl) {
          errEl.textContent = "Complete ambos campos antes de confirmar.";
          errEl.classList.add("visible");
          setTimeout(() => errEl.classList.remove("visible"), 3000);
        }
        // enfocar campo faltante
        if (!account) game.inputs.setActive("account");
        else game.inputs.setActive("transfer");
        return;
      }

      const url = `confirm.html?account=${encodeURIComponent(account)}&value=${encodeURIComponent(value)}`;
      window.location.href = url;
    });
  }

  // Habilitar/deshabilitar el botón de confirmar dinámicamente
  const accountEl = document.getElementById("accountField");
  const transferEl = document.getElementById("transferField");

  function updateConfirmState() {
    const a = accountEl ? accountEl.textContent.trim() : "";
    const v = transferEl ? transferEl.textContent.trim() : "";
    const shouldEnable = Boolean(a && v);
    if (confirmBtn) {
      confirmBtn.disabled = !shouldEnable;
      confirmBtn.setAttribute("aria-disabled", (!shouldEnable).toString());
      if (shouldEnable) {
        confirmBtn.textContent = confirmDefaultText;
        confirmBtn.title = "";
      } else {
        confirmBtn.textContent = "Complete ambos campos";
        confirmBtn.title = "Complete ambos campos para habilitar";
      }
    }
    const errEl = document.getElementById("confirmError");
    if (shouldEnable && errEl) {
      errEl.textContent = "";
      errEl.classList.remove("visible");
    }
  }

  const obs = new MutationObserver(updateConfirmState);
  if (accountEl)
    obs.observe(accountEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  if (transferEl)
    obs.observe(transferEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });

  // chequeo inicial
  updateConfirmState();
});
