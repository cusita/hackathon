// Configuración centralizada del juego
export default {
  accountMaxLen: 20,
  transferMaxLen: 12,
  confettiThreshold: {
    account: 10, // longitud válida para generar confeti
    transferValue: 1000 // ejemplo: si valor >= esta cifra, confeti
  },
  balloonCount: 10,
  balloonSizes: {w:72,h:96},
  sounds: {shoot:true,pop:true},
  scoring: {perHit:10},
  // límites y validaciones centralizadas
  validations: {
    account: {minLen:6, maxLen:20},
    transfer: {minLen:1, maxLen:12}
  }
}
