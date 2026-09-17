import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMuscleVisual } from '../scripts/validate-muscle-visual.js';
import { muscleVisualQuestions } from '../src/data/muscle-visual.js';
import { questions } from '../src/data/questions.js';
import { containsPoint } from '../src/hotspots.js';
import { createSession, answerPoint, expireQuestion, nextQuestion, summary, validSession, readSession, writeSession, MUSCLE_VISUAL_STORAGE_KEY, STORAGE_KEY, selectAnswer, confirmAnswer } from '../src/engine.js';
import { quiz, review } from '../src/views.js';
import { visualImage } from '../src/visual.js';
export function inside(q) {
  for (const p of q.hotspots) {
    const center = { x: p.reduce((s,a) => s+a[0], 0)/p.length, y: p.reduce((s,a) => s+a[1], 0)/p.length };
    if (containsPoint(q.hotspots, center)) return center;
    const [a,b] = p;
    const point = { x: a[0]*0.49+b[0]*0.49+center.x*0.02, y: a[1]*0.49+b[1]*0.49+center.y*0.02 };
    if (containsPoint(q.hotspots, point)) return point;
  }
  for (const p of q.hotspots) {
    for(let x=Math.min(...p.map(a=>a[0]))+0.05;x<Math.max(...p.map(a=>a[0]));x+=0.1)
      for(let y=Math.min(...p.map(a=>a[1]))+0.05;y<Math.max(...p.map(a=>a[1]));y+=0.1)
        if(containsPoint(q.hotspots,{x,y}))return {x,y};
  }
  throw Error(`No interior point: ${q.id}`);
}
test('70 distinct visual questions, reviewed unlabeled local illustrations, valid polygons and explanations', validateMuscleVisual);
test('unanswered questions never render the solution overlay and use the unlabeled asset in quiz and review', () => {
  for (const q of muscleVisualQuestions) {
    const before = visualImage(q, null);
    assert.ok(before.includes(q.image.local));
    assert.ok(!before.includes('correct-region'));
    assert.ok(before.includes('data-hotspot'));
    const after = visualImage(q, { choice: 0, point: inside(q) });
    assert.ok(after.includes(q.image.local));
    assert.ok(after.includes('correct-region'));
    assert.ok(visualImage(q, { choice: 0, point: inside(q) }, true).includes(q.image.local));
  }
});
test('old muscle image coordinates are rejected without invalidating textual or skull sessions', () => {
  const current = createSession(100000, 'muscle-visual');
  const old = { ...current, version: 'muscle-visual-v1' };
  assert.equal(validSession(old), false);
  const result = readSession({ getItem: () => JSON.stringify(old) }, MUSCLE_VISUAL_STORAGE_KEY);
  assert.equal(result.session, null);
  assert.match(result.warning, /outra versão/);
  assert.equal(validSession(current), true);
  assert.equal(validSession(createSession(100000)), true);
  assert.equal(validSession(createSession(100000, 'skull')), true);
});
test('all 70 support correct, incorrect, timeout, reveal, locking, review and complete score', () => {
  for (const outcome of ['correct','wrong','timeout']) {
    let session = createSession(100000, 'muscle-visual');
    muscleVisualQuestions.forEach((q,i) => {
      const now = session.questionStartedAt;
      session = outcome === 'timeout' ? expireQuestion(session, session.deadline) : answerPoint(session, outcome === 'correct' ? inside(q) : { x:0,y:0 }, now+1200);
      assert.equal(session.answers[i].choice, outcome === 'timeout' ? null : outcome === 'correct' ? 0 : 1);
      assert.equal(session.index, i);
      assert.ok(validSession(session));
      assert.equal(answerPoint(session, inside(q), now+1300), session);
      assert.equal(expireQuestion(session, now+999999), session);
      const html = quiz(session);
      assert.ok(html.includes('correct-region'));
      assert.ok(html.includes(q.explanation));
      assert.ok(!html.includes('data-hotspot'));
      session = nextQuestion(session, now+61000);
    });
    assert.equal(session.screen,'results');
    assert.ok(validSession(session));
    assert.equal(summary(session).correct, outcome === 'correct' ? 70 : 0);
    assert.equal(summary(session).grade, outcome === 'correct' ? 10 : 0);
    const html = review(session);
    assert.equal((html.match(/class="review-item"/g)||[]).length,70);
    assert.ok(muscleVisualQuestions.every(q=>html.includes(q.explanation) && html.includes(q.image.local)));
  }
});
test('click at deadline times out; invalid coordinates and modified saved scoring rejected', () => {
  const s = createSession(100000,'muscle-visual');
  assert.equal(answerPoint(s,{x:NaN,y:50}),s);
  assert.equal(answerPoint(s,{x:-1,y:50}),s);
  assert.equal(answerPoint(s,inside(muscleVisualQuestions[0]),s.deadline).answers[0].timedOut,true);
  const a=answerPoint(s,inside(muscleVisualQuestions[0]),100001);
  assert.equal(validSession({...a,answers:[{...a.answers[0],choice:1}]}),false);
});
test('legacy 150-question sessions retain storage key, version, progress and scoring', () => {
  const memory = new Map();
  const storage = {getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  let old = createSession(100000);
  old = confirmAnswer(selectAnswer(old,questions[0].answerIndex),101000);
  writeSession(storage,old);
  const serialized = memory.get(STORAGE_KEY);
  let visual = answerPoint(createSession(100000,'muscle-visual'),inside(muscleVisualQuestions[0]),101000);
  writeSession(storage,visual,MUSCLE_VISUAL_STORAGE_KEY);
  assert.deepEqual(readSession(storage).session,old);
  assert.deepEqual(readSession(storage,MUSCLE_VISUAL_STORAGE_KEY).session,visual);
  writeSession(storage,null,MUSCLE_VISUAL_STORAGE_KEY);
  assert.equal(memory.get(STORAGE_KEY),serialized);
  assert.equal(questions.length,150);
  assert.equal(summary(old).correct,1);
});
test('polygon boundary counts as inside, outside does not', () => {
  const polygon = [[[10,10],[20,10],[20,20],[10,20]]];
  assert.ok(containsPoint(polygon,{x:10,y:15}));
  assert.ok(containsPoint(polygon,{x:15,y:15}));
  assert.equal(containsPoint(polygon,{x:9.99,y:15}),false);
});
