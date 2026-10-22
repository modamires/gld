export type Difficulty = 'easy' | 'medium' | 'hard';
export interface Question { id:number; category:string; difficulty:Difficulty; question:string; answers:string[]; correctAnswerIndex:number }
export function validateQuestions(data:unknown): asserts data is Question[] {
 if(!Array.isArray(data)||data.length<30) throw new Error('بانک پرسش‌ها باید دست‌کم ۳۰ پرسش داشته باشد.');
 const ids = new Set<number>();
 for(const q of data) {
  if(!q||!Number.isInteger(q.id)||ids.has(q.id)||!['easy','medium','hard'].includes(q.difficulty)||typeof q.category!=='string'||typeof q.question!=='string'||!q.question.trim()||!Array.isArray(q.answers)||q.answers.length!==4||q.answers.some((a:unknown)=>typeof a!=='string'||!a.trim())||new Set(q.answers).size!==4||!Number.isInteger(q.correctAnswerIndex)||q.correctAnswerIndex<0||q.correctAnswerIndex>3) throw new Error('ساختار بانک پرسش‌ها درست نیست.');
  ids.add(q.id);
 }
 if(!data.some(q=>q.difficulty==='easy')) throw new Error('برای مرحلهٔ اول دست‌کم یک پرسش آسان لازم است.');
}
export function shuffle<T>(items:T[], random= Math.random):T[] { const out=[...items]; for(let i=out.length-1;i>0;i--){ const j=Math.floor(random()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; } return out; }
export class QuestionDeck {
 private used = new Set<number>();
 constructor(private questions:Question[],private random=Math.random){validateQuestions(questions)}
 next(level:number):Question {
  const eligible=this.questions.filter(q=>level===1?q.difficulty==='easy':level===2?q.difficulty!=='hard':true);
  if(!eligible.length) throw new Error('برای این مرحله پرسشی پیدا نشد.');
  let pool=eligible.filter(q=>!this.used.has(q.id));
  if(!pool.length){eligible.forEach(q=>this.used.delete(q.id));pool=eligible}
  const q=pool[Math.floor(this.random()*pool.length)]; this.used.add(q.id);
  const order=shuffle([0,1,2,3],this.random);
  return {...q,answers:order.map(i=>q.answers[i]),correctAnswerIndex:order.indexOf(q.correctAnswerIndex)};
 }
}
