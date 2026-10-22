import {levels,treasures,type TreasureKind} from './levels';
import {QuestionDeck,type Question} from './questions';
export type GameState='READY'|'SWINGING'|'EXTENDING'|'QUESTION'|'CORRECT_FEEDBACK'|'INCORRECT_FEEDBACK'|'RETRACTING_WITH_GOLD'|'RETRACTING_EMPTY'|'RESETTING_GOLD'|'PAUSED'|'LEVEL_COMPLETE'|'GAME_OVER';
export type Treasure={id:number;kind:TreasureKind;x:number;y:number;ox:number;oy:number;collected:boolean;attached:boolean;};
export type GameEvent={type:'launch'|'catch'|'correct'|'incorrect'|'collect'|'finish'|'rock'; x?:number;y?:number;value?:number};
export const ANCHOR={x:500,y:111};
export function segmentHits(ax:number,ay:number,bx:number,by:number,cx:number,cy:number,r:number){const dx=bx-ax,dy=by-ay;const t=Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(ax+t*dx-cx,ay+t*dy-cy)<=r}
export class GameModel {
 state:GameState='READY'; previous:GameState='SWINGING'; time=90; score=0; correct=0; attempted=0; collected=0; angle=0; phase=0; length=70; level=1;
 items:Treasure[]=[]; target:Treasure|null=null; question:Question|null=null; selected:number|null=null; feedbackTime=0; sequence=false; elapsed=0; events:GameEvent[]=[];
 constructor(public deck:QuestionDeck) {this.setup(1,false)}
 get config(){return levels[this.level-1]}
 get hook(){return {x:ANCHOR.x+Math.sin(this.angle)*this.length,y:ANCHOR.y+Math.cos(this.angle)*this.length}}
 get accuracy(){return this.attempted?Math.round(this.correct/this.attempted*100):0}
 get finished(){return this.state==='LEVEL_COMPLETE'||this.state==='GAME_OVER'}
 setup(level:number,playing=true){this.level=Math.max(1,Math.min(3,level));this.state=playing?'SWINGING':'READY';this.time=this.config.duration;this.score=0;this.correct=0;this.attempted=0;this.collected=0;this.angle=0;this.phase=0;this.length=70;this.target=null;this.question=null;this.selected=null;this.feedbackTime=0;this.sequence=false;this.elapsed=0;this.events=[];this.items=this.config.items.map(([kind,x,y],id)=>({id,kind,x,y,ox:x,oy:y,collected:false,attached:false}));}
 launch(){if(this.state!=='SWINGING'||this.time<=0)return false;this.state='EXTENDING';this.events.push({type:'launch'});return true}
 pause(){if(this.state==='READY'||this.finished||this.state==='PAUSED')return;this.previous=this.state;this.state='PAUSED'}
 resume(){if(this.state==='PAUSED')this.state=this.previous}
 answer(index:number){if(this.state!=='QUESTION'||!this.question||index<0||index>3)return false;this.selected=index;this.attempted++;const correct=index===this.question.correctAnswerIndex;this.correct+=Number(correct);this.state=correct?'CORRECT_FEEDBACK':'INCORRECT_FEEDBACK';this.feedbackTime=correct?1.1:1.85;this.events.push({type:correct?'correct':'incorrect'});return true}
 private finish(){this.state=this.score>=this.config.target?'LEVEL_COMPLETE':'GAME_OVER';this.events.push({type:'finish'})}
 private settle(){this.length=70;this.target=null;this.question=null;this.selected=null;this.sequence=false;this.state='SWINGING';if(this.time<=0||this.items.every(x=>x.collected))this.finish()}
 tick(dt:number){
  if(this.state==='PAUSED'||this.finished)return;
  dt=Math.min(Math.max(dt,0),0.05);this.elapsed+=dt;
  if(this.state==='READY'||this.state==='SWINGING'){this.phase+=dt*this.config.swing;this.angle=Math.sin(this.phase)*1.22;if(this.state==='READY')return}
  if(!this.sequence&&['SWINGING','EXTENDING','RETRACTING_EMPTY'].includes(this.state)){this.time=Math.max(0,this.time-dt);if(this.time<=0){if(this.state==='SWINGING'){this.finish();return}if(this.state==='EXTENDING')this.state='RETRACTING_EMPTY'}}
  if(this.state==='EXTENDING'){
   const old=this.hook;this.length+=440*dt;const h=this.hook;
   // Swept collisions prevent tunnelling at low frame rates or object edges.
   const hit=this.items.filter(t=>!t.collected&&!t.attached&&segmentHits(old.x,old.y,h.x,h.y,t.x,t.y,treasures[t.kind].radius+9)).sort((a,b)=>Math.hypot(a.x-old.x,a.y-old.y)-Math.hypot(b.x-old.x,b.y-old.y))[0];
   if(hit){this.target=hit;hit.attached=true;this.sequence=true;hit.x=h.x;hit.y=h.y+17;this.question=this.deck.next(this.level);this.state='QUESTION';this.events.push({type:'catch',x:h.x,y:h.y});}
   else if(this.config.rocks.some(([x,y])=>segmentHits(old.x,old.y,h.x,h.y,x,y,29))){this.state='RETRACTING_EMPTY';this.events.push({type:'rock',x:h.x,y:h.y})}
   else if(h.x<30||h.x>970||h.y>640||this.length>760)this.state='RETRACTING_EMPTY';
  } else if(this.state==='CORRECT_FEEDBACK'||this.state==='INCORRECT_FEEDBACK'){
   this.feedbackTime-=dt;if(this.feedbackTime<=0){if(this.state==='CORRECT_FEEDBACK'){this.state='RETRACTING_WITH_GOLD'}else{this.state='RESETTING_GOLD';this.feedbackTime=0.45;if(this.target)this.target.attached=false}}
  } else if(this.state==='RESETTING_GOLD'){
   this.feedbackTime-=dt;if(this.target){const p=Math.min(1,dt/Math.max(dt,this.feedbackTime+dt));this.target.x+=(this.target.ox-this.target.x)*p;this.target.y+=(this.target.oy-this.target.y)*p;}
   if(this.feedbackTime<=0){if(this.target){this.target.x=this.target.ox;this.target.y=this.target.oy;}this.target=null;this.state='RETRACTING_EMPTY';}
  } else if(this.state==='RETRACTING_WITH_GOLD'||this.state==='RETRACTING_EMPTY'){
   const carrying=this.state==='RETRACTING_WITH_GOLD';this.length=Math.max(70,this.length-dt*(carrying&&this.target?treasures[this.target.kind].speed:510));
   if(carrying&&this.target){const h=this.hook;this.target.x=h.x;this.target.y=h.y+17}
   if(this.length<=70){if(carrying&&this.target&&!this.target.collected){const value=treasures[this.target.kind].value;this.target.collected=true;this.target.attached=false;this.score+=value;this.collected++;this.events.push({type:'collect',x:this.hook.x,y:this.hook.y,value})}this.settle()}
  }
 }
 snapshot(){return {state:this.state,level:this.level,time:Math.ceil(this.time),score:this.score,target:this.config.target,correct:this.correct,attempted:this.attempted,collected:this.collected,accuracy:this.accuracy,question:this.question,selected:this.selected,value:this.target?treasures[this.target.kind].value:0,finished:this.finished}}
}
export type Snapshot=ReturnType<GameModel['snapshot']>;
