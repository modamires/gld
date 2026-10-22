export class ArcadeAudio {
 enabled=true; private context:AudioContext|null=null;
 constructor(){try{this.enabled=localStorage.getItem('gold-quest-sound')!=='off'}catch{}}
 unlock(){try{this.context??=new(window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();if(this.context.state==='suspended')void this.context.resume()}catch{}}
 toggle(){this.enabled=!this.enabled;try{localStorage.setItem('gold-quest-sound',this.enabled?'on':'off')}catch{}if(this.enabled)this.unlock();return this.enabled}
 play(kind:string){if(!this.enabled||!this.context)return;const c=this.context;const notes:Record<string,number[]>={launch:[350,210],catch:[550,780],correct:[523,659,784],incorrect:[330,294],collect:[784,988,1175,1568],finish:[523,659,784,1047],rock:[150,110],click:[500]};(notes[kind]||notes.click).forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.075;o.type=kind==='rock'?'triangle':'sine';o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.2)})}
 close(){void this.context?.close()}
}
