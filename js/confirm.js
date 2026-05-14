// Lee parámetros de la URL y los muestra en la pantalla de confirmación
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const account = params.get("account") || "";
  const value = params.get("value") || "";

  const accEl = document.getElementById("confirmAccount");
  const valEl = document.getElementById("confirmValue");
  if (accEl) accEl.textContent = account || "No proporcionada";
  if (valEl) valEl.textContent = value || "0";
});
