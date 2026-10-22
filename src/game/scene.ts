import Phaser from 'phaser';
import {GameModel,ANCHOR,type Snapshot} from './model';
import {treasures} from './levels';
import {ArcadeAudio} from './audio';
const reduced=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export class MineScene extends Phaser.Scene {
 model:GameModel; private rope!:Phaser.GameObjects.Graphics; private glow!:Phaser.GameObjects.Graphics;
 private sprites:Phaser.GameObjects.Image[]=[];private labels:Phaser.GameObjects.Text[]=[];private obstacles:Phaser.GameObjects.Image[]=[];
 private dust:{sprite:Phaser.GameObjects.Arc;x:number;y:number;phase:number}[]=[];private miner!:Phaser.GameObjects.Image; private backdrop!:Phaser.GameObjects.Image; private effects=new Set<Phaser.GameObjects.GameObject>(); private lastEmit=0;private lastState='';
 constructor(model:GameModel,private emit:(snapshot:Snapshot)=>void,private audio:ArcadeAudio,private onFailure:(message:string)=>void){super('mine');this.model=model}
 preload(){const base=import.meta.env.BASE_URL;this.load.on('loaderror',()=>this.onFailure('تصویرهای معدن بارگذاری نشدند. دوباره تلاش کن.'));this.load.svg('cave',`${base}art/cave.svg`,{width:1500,height:1020});this.load.svg('miner',`${base}art/miner.svg`,{width:300,height:315});this.load.svg('gold',`${base}art/gold.svg`,{width:240,height:200});this.load.svg('gem',`${base}art/gem.svg`,{width:220,height:240});this.load.svg('rock',`${base}art/rock.svg`,{width:220,height:170});}
 create(){
  this.backdrop=this.add.image(500,340,'cave').setDisplaySize(1012,688);
  const bridge=this.add.graphics().setDepth(9);bridge.lineStyle(7,0x665283).lineBetween(423,83,444,130).lineBetween(577,83,556,130);bridge.fillStyle(0x3d315a).fillRoundedRect(434,124,132,12,4);bridge.fillStyle(0x9683bb).fillRoundedRect(435,123,130,4,2);
  this.glow=this.add.graphics();this.rope=this.add.graphics().setDepth(10);
  this.miner=this.add.image(500,66,'miner').setDisplaySize(140,147).setDepth(11);
  for(let i=0;i<25;i++){const x=Phaser.Math.Between(55,945),y=Phaser.Math.Between(150,650);this.dust.push({sprite:this.add.circle(x,y,Phaser.Math.FloatBetween(1,2.2),i%3?0xb698e7:0x8cfff4,.25).setDepth(2),x,y,phase:i*2.4})}
  this.populate();this.input.on('pointerdown',()=>{this.audio.unlock();this.model.launch()});
  this.emit(this.model.snapshot());
 }
 populate(){this.sprites.forEach(x=>x.destroy());this.labels.forEach(x=>x.destroy());this.obstacles.forEach(x=>x.destroy());this.sprites=[];this.labels=[];this.obstacles=[];
  this.model.items.forEach(t=>{const spec=treasures[t.kind];const img=this.add.image(t.x,t.y,t.kind==='gem'?'gem':'gold').setDisplaySize(spec.width,spec.height).setDepth(6).setRotation((t.id%3-1)*.14);this.sprites.push(img);this.labels.push(this.add.text(t.x,t.y+spec.height/2+7,spec.value.toLocaleString('fa-IR'),{fontFamily:'Vazirmatn, sans-serif',fontSize:'17px',color:t.kind==='gem'?'#97fff1':'#ffe4a3',stroke:'#27183c',strokeThickness:4}).setOrigin(.5,0).setAlpha(.9).setDepth(6))});
  this.model.config.rocks.forEach(([x,y])=>this.obstacles.push(this.add.image(x,y,'rock').setDisplaySize(65,50).setDepth(5)));
 }
 private clearEffects(){this.tweens.killAll();this.effects.forEach(effect=>effect.destroy());this.effects.clear()}
 startLevel(level:number){this.clearEffects();this.model.setup(level);this.populate();this.emit(this.model.snapshot())}
 menu(){this.clearEffects();this.model.setup(1,false);this.populate();this.emit(this.model.snapshot())}
 sync(){this.emit(this.model.snapshot())}
 private burst(x:number,y:number,color:number,count=18){if(reduced)return;for(let i=0;i<count;i++){const p=this.add.star(x,y,4,2,6,color).setDepth(30);this.effects.add(p);const a=Math.random()*Math.PI*2,d=30+Math.random()*85;this.tweens.add({targets:p,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:.2,angle:150,duration:500+Math.random()*350,onComplete:()=>{this.effects.delete(p);p.destroy()}})}}
 update(_time:number,delta:number){
  this.model.tick(delta/1000);const m=this.model,h=m.hook;if(m.state==='PAUSED')this.tweens.pauseAll();else this.tweens.resumeAll();
  this.rope.clear();this.rope.lineStyle(7,0x130e2c,.65).lineBetween(ANCHOR.x+2,ANCHOR.y,h.x+2,h.y+2);this.rope.lineStyle(4,0xddd0f0).lineBetween(ANCHOR.x,ANCHOR.y,h.x,h.y);this.rope.lineStyle(1,0xffffff,.7).lineBetween(ANCHOR.x-1,ANCHOR.y,h.x-1,h.y);
  // Forged, three-pronged claw follows the locked rope angle.
  const tip=(x:number,y:number)=>({x:h.x+x*Math.cos(-m.angle)-y*Math.sin(-m.angle),y:h.y+x*Math.sin(-m.angle)+y*Math.cos(-m.angle)});
  this.rope.lineStyle(6,0x8e87ad);for(const s of [-1,1]){const a=tip(s*11,-4),b=tip(s*18,11),c=tip(s*8,22);this.rope.beginPath();this.rope.moveTo(a.x,a.y);this.rope.lineTo(b.x,b.y);this.rope.lineTo(c.x,c.y);this.rope.strokePath();}this.rope.fillStyle(0xe8ddff).fillCircle(h.x,h.y,7).lineStyle(2,0x9284b3).strokeCircle(h.x,h.y,7);
  this.glow.clear();if(m.state==='SWINGING'||m.state==='READY'){for(let i=1;i<=7;i++){const d=80+i*23;this.glow.fillStyle(0xe3d0ff,.22*(1-i/8)).fillCircle(ANCHOR.x+Math.sin(m.angle)*d,ANCHOR.y+Math.cos(m.angle)*d,2.6)}}
  m.items.forEach((t,i)=>{const image=this.sprites[i],label=this.labels[i];if(!image)return;image.setVisible(!t.collected).setPosition(t.x,t.y);label.setVisible(!t.collected&&!t.attached).setPosition(t.x,t.y+treasures[t.kind].height/2+7);if(!t.collected&&!reduced){image.setAngle(Math.sin(m.elapsed*1.5+i)*3+(i%3-1)*7);if(!t.attached){const spark=Math.sin(m.elapsed*2+i*1.5);if(spark>.75){this.glow.fillStyle(t.kind==='gem'?0xb6fff6:0xffeda9,(spark-.75)*2).fillPoints([{x:t.x-12,y:t.y-26},{x:t.x-10,y:t.y-20},{x:t.x-4,y:t.y-18},{x:t.x-10,y:t.y-16},{x:t.x-12,y:t.y-10},{x:t.x-14,y:t.y-16},{x:t.x-20,y:t.y-18},{x:t.x-14,y:t.y-20}],true)}}}});
  if(!reduced){this.backdrop.setX(500+Math.sin(m.angle)*3);for(const d of this.dust)d.sprite.setPosition(d.x+Math.sin(m.elapsed*.25+d.phase)*9,d.y+Math.sin(m.elapsed*.4+d.phase)*14).setAlpha(.12+Math.sin(m.elapsed+d.phase)**2*.18);this.miner.setY(66+Math.sin(m.elapsed*2)*1.3)}
  while(m.events.length){const e=m.events.shift()!;this.audio.play(e.type);if(e.type==='collect'){this.burst(e.x!,e.y!,e.value===750?0x18dccb:0xffd447,e.value===750?40:28);if(e.value===750)this.burst(e.x!,e.y!,0xff56a5,14);const text=this.add.text(e.x!,e.y!-30,'+'+e.value!.toLocaleString('fa-IR'),{fontFamily:'Vazirmatn',fontSize:'35px',fontStyle:'bold',color:'#ffe76b',stroke:'#2c1855',strokeThickness:6}).setOrigin(.5).setDepth(40);this.effects.add(text);this.tweens.add({targets:text,y:text.y-65,alpha:0,duration:1100,onComplete:()=>{this.effects.delete(text);text.destroy()}})}else if(e.type==='catch')this.burst(e.x!,e.y!,0xffffff,9);else if(e.type==='correct')this.burst(h.x,h.y,0x18dccb,18);else if(e.type==='finish'&&m.state==='LEVEL_COMPLETE'){for(let i=0;i<8;i++)this.burst(100+i*110,200+Math.random()*200,[0xffd447,0x18dccb,0xff56a5][i%3],12)}}
  this.lastEmit+=delta;if(this.lastEmit>100||this.lastState!==m.state){this.lastState=m.state;this.lastEmit=0;this.emit(m.snapshot())}
 }
}
