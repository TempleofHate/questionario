import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
async function check(dir) {
  for (const file of await readdir(dir, { withFileTypes: true })) {
    const name = `${dir}/${file.name}`;
    if (file.isDirectory()) await check(name);
    else if (name.endsWith('.js')) {
      const result = spawnSync(process.execPath, ['--check', name], { encoding: 'utf8' });
      if (result.status !== 0) throw new Error(result.stderr);
    }
  }
}
for (const dir of ['src', 'scripts', 'tests']) await check(dir);
console.log('Análise de sintaxe: todos os módulos JavaScript válidos.');
