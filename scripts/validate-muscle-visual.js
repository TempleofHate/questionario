import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { muscleVisualQuestions, muscleVisualImages } from '../src/data/muscle-visual.js';
import { containsPoint } from '../src/hotspots.js';
export async function validateMuscleVisual() {
  assert.equal(muscleVisualQuestions.length, 70);
  for (const field of ['id', 'prompt', 'explanation']) assert.equal(new Set(muscleVisualQuestions.map(q => q[field])).size, 70, `Duplicação: ${field}`);
  let bytes = 0;
  for (const image of Object.values(muscleVisualImages)) {
    const data = await readFile(new URL(`..${image.local}`, import.meta.url));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    assert.ok(data.length < 650_000, `${image.key}: imagem excessivamente grande`);
    assert.ok(image.width > 0 && image.height > 0 && image.source && image.author && image.licenseUrl);
    assert.equal(image.labels, 'none', `${image.key}: a imagem do quiz deve estar sem rótulos`);
    assert.ok(image.local.endsWith('-unlabeled.webp'), `${image.key}: não reutilizar a prancha rotulada`);
    // O hash trava os arquivos conferidos visualmente; qualquer troca exige nova revisão.
    assert.equal(createHash('sha256').update(data).digest('hex'), image.sha256, `${image.key}: imagem alterada desde a revisão visual`);
    bytes += data.length;
  }
  for (const q of muscleVisualQuestions) {
    assert.equal(q.type, 'hotspot');
    assert.ok(q.image.local.startsWith('/assets/muscles/'));
    assert.ok(q.explanation.length > 50);
    assert.ok(q.structure && q.view && q.source.url === q.image.source);
    assert.ok(q.image.local && q.hotspots && q.explanation);
    assert.ok(q.hotspots.length > 0);
    for (const polygon of q.hotspots) {
      assert.ok(polygon.length >= 3);
      assert.ok(polygon.every(p => p.length === 2 && p.every(n => Number.isFinite(n) && n >= 0 && n <= 100)));
      const area = Math.abs(polygon.reduce((sum, p, i) => {
        const next = polygon[(i + 1) % polygon.length];
        return sum + p[0] * next[1] - next[0] * p[1];
      }, 0) / 2);
      assert.ok(area > 0.1, `${q.id}: região vazia`);
    }
    assert.equal(containsPoint(q.hotspots, { x: 0, y: 0 }), false);
  }
  return { total: 70, images: Object.keys(muscleVisualImages).length, imageBytes: bytes, withHotspots: 70, withExplanation: 70 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(await validateMuscleVisual());
