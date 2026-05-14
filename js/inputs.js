import cfg from './config.js';
import { animateAdd } from './effects.js';

export default class Inputs{
  constructor(){
    this.accountEl = document.getElementById('accountField');
    this.transferEl = document.getElementById('transferField');
    this.fields = {account:this.accountEl, transfer:this.transferEl};
    this.active = 'account';
    this.setup();
  }

  setup(){
    // seleccionar por clic o teclado
    document.querySelectorAll('.field').forEach(f=>{
      f.addEventListener('click', ()=>this.setActive(f.dataset.field));
      f.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); this.setActive(f.dataset.field); } });
    });
    this.updateActive();
  }

  setActive(name){
    if(!this.fields[name]) return;
    this.active = name; this.updateActive();
  }

  updateActive(){
    Object.entries(this.fields).forEach(([k,el])=>{
      const parent = el.parentElement;
      if(k===this.active){ parent.classList.add('active'); parent.style.boxShadow='0 6px 18px rgba(0,0,0,0.12)'; }
      else { parent.classList.remove('active'); parent.style.boxShadow='none'; }
    });
  }

  addDigit(d){
    const el = this.fields[this.active];
    const limit = this.active==='account' ? cfg.accountMaxLen : cfg.transferMaxLen;
    if(el.textContent.length >= limit) return false;
    // solo números
    if(!/^[0-9]$/.test(d)) return false;
    el.textContent = el.textContent + d;
    animateAdd(el);
    return true;
  }

  backspace(){
    const el = this.fields[this.active];
    el.textContent = el.textContent.slice(0,-1);
  }

  clear(){
    const el = this.fields[this.active];
    el.textContent = '';
  }

  getValue(name){ return this.fields[name].textContent.trim(); }
}
