#!/usr/bin/env node
'use strict';

// Read-only verification used by the /check command of the build-engineer agent.
// It never edits project files: the only things it writes are build/ (by running
// the build) and build/jest-results.json. Exit code 0 = every check passed.
//
// Usage: node .github/agent-tools/check.js [--static]
//   --static  only structural checks, skip build / tests / executable run

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const staticOnly = process.argv.includes('--static');
const results = [];

const rel = (p) => path.join(root, p);
const exists = (p) => fs.existsSync(rel(p));
const read = (p) => {
  if (!exists(p)) throw new Error(`${p} not found`);
  return fs.readFileSync(rel(p), 'utf8');
};
const firstLine = (text) => String(text || '').trim().split('\n').find((l) => /error/i.test(l)) || String(text || '').trim().split('\n')[0];

function record(group, name, ok, detail = '') {
  results.push({ group, name, ok, detail });
}

function check(group, name, fn) {
  try {
    const out = fn();
    if (out === true || out === undefined) record(group, name, true);
    else record(group, name, false, typeof out === 'string' ? out : '');
  } catch (err) {
    record(group, name, false, err.message.split('\n')[0]);
  }
}

function hasSections(file, sections) {
  if (!exists(file)) return `${file} not found`;
  const text = read(file);
  const missing = sections.filter((s) => !new RegExp(`^##\\s+${s}`, 'm').test(text));
  return missing.length === 0 ? true : `missing sections: ${missing.join(', ')}`;
}

function frontmatter(file) {
  const m = read(file).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return data;
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: root, encoding: 'utf8', ...opts });
}

// ---------------------------------------------------------------- agent
const manifest = '.github/agents/build-engineer.agent.md';
check('agent', 'manifest exists with role, rules, forbidden actions, completion criteria', () =>
  hasSections(manifest, ['Роль', 'Область відповідальності', 'Правила роботи з файлами',
    'Заборонені дії', 'Критерії успішного завершення']));
check('agent', 'manifest frontmatter has name and description', () => {
  const fm = frontmatter(manifest);
  return fm.name && fm.description ? true : 'name/description missing';
});

// ---------------------------------------------------------------- skills
const skillSections = ['Коли застосовувати', 'Входи', 'Виходи', 'Вимоги', 'Перевірки',
  'Типовий сценарій помилки', 'Приклад'];
for (const skill of ['project-scaffold', 'build-and-test', 'github-actions']) {
  const file = `.github/skills/${skill}/SKILL.md`;
  check('skills', `${skill}: purpose, inputs, outputs, requirements, checks, failure, example`, () =>
    hasSections(file, skillSections));
  check('skills', `${skill}: specification only, no ready-made file templates`, () => {
    const dir = rel(`.github/skills/${skill}`);
    const extra = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f !== 'SKILL.md') : [];
    return extra.length ? `unexpected files: ${extra.join(', ')}` : true;
  });
  check('skills', `${skill}: frontmatter name matches directory`, () =>
    frontmatter(file).name === skill ? true : `name != ${skill}`);
}

// ---------------------------------------------------------------- commands
const commandSections = ['Передумови', 'Дії', 'Очікувані файли', 'Перевірки',
  'Повідомлення про помилку'];
const commands = ['git-init', 'create-project', 'create-build', 'create-actions', 'check', 'init'];
for (const cmd of commands) {
  const file = `.github/prompts/${cmd}.prompt.md`;
  check('commands', `${cmd}: preconditions, actions, files, checks, error message`, () =>
    hasSections(file, commandSections));
}
check('commands', 'init calls git-init -> create-project -> create-build -> create-actions -> check', () => {
  const text = read('.github/prompts/init.prompt.md');
  const steps = text.split(/^##\s+Дії/m)[1] || '';
  const order = commands.slice(0, 5).map((c) => steps.indexOf(`/${c}`));
  if (order.some((i) => i < 0)) return 'not every command is referenced in "Дії"';
  return order.every((v, i) => i === 0 || v > order[i - 1]) ? true : `wrong order: ${order}`;
});

// ---------------------------------------------------------------- project
for (const f of ['README.md', 'src/hello.js', 'src/math.js', 'tests/math.test.js',
  'package.json', 'package-lock.json', 'jest.config.js', 'scripts/build.js',
  'ci.sh', 'ci.bat', 'docs/architecture.md', 'docs/usage.md']) {
  check('project', `${f} exists`, () => exists(f) || 'not found');
}
check('project', 'package.json has build/start/test/check scripts and jest', () => {
  const pkg = JSON.parse(read('package.json'));
  const missing = ['build', 'start', 'test', 'check'].filter((s) => !pkg.scripts?.[s]);
  if (missing.length) return `missing scripts: ${missing.join(', ')}`;
  return pkg.devDependencies?.jest ? true : 'jest is not a devDependency';
});
check('project', 'tests/math.test.js defines BasicAddition', () =>
  /test\(\s*['"]BasicAddition['"]/.test(read('tests/math.test.js')) || 'BasicAddition not found');

// ---------------------------------------------------------------- workflow
const wf = '.github/workflows/ci.yml';
check('workflow', 'ci.yml is valid YAML with push + pull_request on develop and master', () => {
  let yaml;
  try { yaml = require(rel('node_modules/js-yaml')); } catch { return 'js-yaml not installed (run npm ci)'; }
  const doc = yaml.load(read(wf));
  for (const ev of ['push', 'pull_request']) {
    const br = doc.on?.[ev]?.branches || [];
    if (!br.includes('develop') || !br.includes('master')) return `${ev} must target develop and master`;
  }
  const jobs = Object.values(doc.jobs || {});
  if (jobs.length !== 1) return `expected exactly one job, got ${jobs.length}`;
  const job = jobs[0];
  const os = job.strategy?.matrix?.os || [];
  const need = ['ubuntu-latest', 'windows-latest', 'macos-latest'];
  const lost = need.filter((o) => !os.includes(o));
  if (lost.length) return `matrix misses ${lost.join(', ')}`;
  const steps = job.steps || [];
  if (!steps.some((s) => String(s.uses || '').startsWith('actions/checkout@'))) return 'no checkout step';
  const runs = steps.filter((s) => s.run).map((s) => String(s.run).trim());
  const bad = runs.filter((r) => !/^(bash \.\/ci\.sh|\.\/ci\.sh|call ci\.bat|ci\.bat)$/.test(r));
  if (bad.length) return `run steps must only call ci.sh / ci.bat: ${bad.join(' | ')}`;
  if (!runs.some((r) => r.includes('ci.sh')) || !runs.some((r) => r.includes('ci.bat'))) {
    return 'both ci.sh and ci.bat must be called';
  }
  return true;
});
check('workflow', 'ci.yml contains no secrets', () =>
  !/secrets\.|ghp_|github_pat_/.test(read(wf)) || 'secret reference found');

// ---------------------------------------------------------------- git
check('git', '.gitignore ignores node_modules/, build/, coverage/, .env', () => {
  if (!exists('.gitignore')) return '.gitignore not found';
  const lines = read('.gitignore').split(/\r?\n/).map((l) => l.trim());
  const missing = ['node_modules/', 'build/', 'coverage/', '.env'].filter((l) => !lines.includes(l));
  return missing.length ? `missing: ${missing.join(', ')}` : true;
});
const ls = run('git', ['ls-files']);
const tracked = ls.status === 0 ? ls.stdout.split('\n').filter(Boolean) : null;
check('git', 'no build/, node_modules/, coverage/ or .env tracked', () => {
  if (!tracked) return 'git ls-files failed';
  const bad = tracked.filter((f) => /^(build|node_modules|coverage)\//.test(f) || /(^|\/)\.env(\.|$)/.test(f));
  return bad.length ? `tracked: ${bad.slice(0, 5).join(', ')}` : true;
});
check('git', 'no secrets in tracked files', () => {
  if (!tracked) return 'git ls-files failed';
  const pattern = /(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
  const self = path.relative(root, __filename).split(path.sep).join('/');
  const hits = tracked.filter((f) => f !== self && exists(f) && fs.statSync(rel(f)).size < 1e6 && pattern.test(read(f)));
  return hits.length ? `possible secret in: ${hits.join(', ')}` : true;
});

// ---------------------------------------------------------------- build & tests
if (!staticOnly) {
  check('build', 'npm run build creates build/hello and build/hello.cmd', () => {
    if (!exists('scripts/build.js')) return 'scripts/build.js not found';
    const r = run(process.execPath, ['scripts/build.js']);
    if (r.status !== 0) return `build failed (exit ${r.status}): ${firstLine(r.stderr || r.stdout)}`;
    if (!exists('build/hello') || !exists('build/hello.cmd')) return 'executables not created';
    if (process.platform !== 'win32' && (fs.statSync(rel('build/hello')).mode & 0o111) === 0) {
      return 'build/hello is not executable';
    }
    return true;
  });
  check('build', 'build/hello prints "Hello, World!"', () => {
    if (!exists('build/hello')) return 'build/hello not found';
    const r = run(process.execPath, ['build/hello']);
    return r.status === 0 && r.stdout.trim() === 'Hello, World!' ? true : `got: ${JSON.stringify(r.stdout.trim())}`;
  });
  check('tests', 'Jest passes and BasicAddition is passed', () => {
    const jest = rel('node_modules/jest/bin/jest.js');
    if (!fs.existsSync(jest)) return 'jest not installed (run npm ci)';
    const out = rel('build/jest-results.json');
    const r = run(process.execPath, [jest, '--ci', '--silent', '--json', `--outputFile=${out}`]);
    if (!fs.existsSync(out)) return `jest produced no report: ${firstLine(r.stderr)}`;
    const report = JSON.parse(fs.readFileSync(out, 'utf8'));
    const all = report.testResults.flatMap((t) => t.assertionResults);
    const basic = all.find((a) => a.title === 'BasicAddition');
    if (!basic) return 'BasicAddition not executed';
    if (basic.status !== 'passed') return `BasicAddition ${basic.status}`;
    if (!report.success) return `${report.numFailedTests} of ${report.numTotalTests} tests failed`;
    return true;
  });
}

// ---------------------------------------------------------------- report
const width = Math.max(...results.map((r) => r.group.length));
for (const r of results) {
  const line = `[${r.ok ? 'PASS' : 'FAIL'}] ${r.group.padEnd(width)}  ${r.name}`;
  console.log(r.ok ? line : `${line}\n         -> ${r.detail}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\ncheck: ${results.length - failed} passed, ${failed} failed${staticOnly ? ' (static mode)' : ''}`);
process.exitCode = failed ? 1 : 0;
