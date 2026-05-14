import Game from './game.js';

// Punto de entrada principal
document.addEventListener('DOMContentLoaded', ()=>{
  // Inicializar juego
  const game = new Game();
  // Exponer para debug en desarrollo
  window.__BalloonGame = game;
});
