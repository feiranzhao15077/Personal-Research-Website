import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const all = (directory, extension) => fs.readdirSync(path.join(root, directory)).filter((name) => name.endsWith(extension));
const parse = (directory, extension) => all(directory, extension).map((name) => {
  const text = read(`${directory}/${name}`);
  const content = extension === '.md' ? text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1] : text;
  return YAML.parse(content);
});
const err = [];
const check = (condition, message) => { if (!condition) err.push(message); };
const unique = (values, what) => check(values.length === new Set(values).size, `Duplicate ${what}`);
const ids = (rows) => new Set(rows.map((row) => row.id));
const projects = parse('src/content/projects', '.md');
const evidence = parse('src/content/evidence', '.yaml');
const figures = parse('src/content/figures', '.yaml');
const materials = parse('src/content/materials', '.yaml');
const profile = parse('src/content/site', '.yaml')[0];
const map = YAML.parse(read('src/data/research-map.yaml'));
const pi = ids(projects), ei = ids(evidence), fi = ids(figures), mi = ids(materials);
unique(projects.map((x) => x.id), 'project IDs'); unique(evidence.map((x) => x.id), 'evidence IDs');
unique(figures.map((x) => x.id), 'figure IDs'); unique(materials.map((x) => x.id), 'material IDs');
check(projects.length === 4 && evidence.length === 24 && figures.length === 13 && materials.length === 8, 'Frozen content counts differ');
check(['emvision','lowalt-md','em-trace','quadcontrol-lab'].every((id) => pi.has(id)), 'Project route missing');
const eById = new Map(evidence.map((row) => [row.id,row]));
for (const p of projects) {
  check(p.id === p.slug, `${p.id}: slug mismatch`);
  check(p.localeState?.zh === 'READY' && p.localeState?.en === 'PENDING', `${p.id}: locale status`);
  check(Boolean(p.summary?.zh && p.researchQuestion?.zh && p.whyItMatters?.zh), `${p.id}: Chinese content missing`);
  for (const id of p.evidenceRefs) check(ei.has(id) && eById.get(id)?.project === p.id, `${p.id}: invalid evidence ${id}`);
  for (const id of [...p.mainEvidence, ...p.deepEvidence, p.heroEvidence, p.homeEvidence]) check(p.evidenceRefs.includes(id), `${p.id}: unlisted evidence ${id}`);
  check(p.mainEvidence.includes(p.heroEvidence), `${p.id}: hero evidence absent from default layer`);
  for (const id of p.figures) check(fi.has(id), `${p.id}: invalid figure ${id}`);
  check([...p.mainFigures, ...p.deepFigures].length === p.figures.length && new Set([...p.mainFigures, ...p.deepFigures]).size === p.figures.length && [...p.mainFigures, ...p.deepFigures].every((id) => p.figures.includes(id)), `${p.id}: figure layers must partition original figures`);
  for (const id of p.materials) check(mi.has(id), `${p.id}: invalid material ${id}`);
}
for (const e of evidence) {
  check(pi.has(e.project), `${e.id}: project missing`);
  check(Boolean(e.claim?.zh && e.protocolContext?.zh && e.uncertainty?.detail?.zh && e.boundary?.zh), `${e.id}: required interpretation missing`);
  check(['SUPPORTED','INTERNALLY_VERIFIED','NEGATIVE_RESULT','CORRECTED','WITHDRAWN','UNRESOLVED'].includes(e.status), `${e.id}: invalid status`);
  check(e.publicSource?.url?.startsWith('https://github.com/feiranzhao15077/Research-Portfolio/'), `${e.id}: public source URL`);
  check(e.source?.ref && e.sourceVisibility, `${e.id}: source provenance missing`);
  if (e.uncertainty?.lower || e.uncertainty?.upper) check(e.uncertainty.lower && e.uncertainty.upper && e.uncertainty.display, `${e.id}: structured interval incomplete`);
}
for (const id of ['LOW-06','EMT-05']) {
  const p = projects.find((p) => p.id === eById.get(id)?.project);
  check(p?.mainEvidence.includes(id), `${id}: negative/corrected result must be default visible`);
}
check(eById.get('LOW-06')?.status === 'NEGATIVE_RESULT', 'LOW-06 status');
check(eById.get('EMT-05')?.status === 'WITHDRAWN', 'EMT-05 status');
check(eById.get('EMT-01')?.status === 'CORRECTED', 'EMT-01 status');
check(eById.get('EVM-04')?.sourceVisibility === 'PRIVATE_CANONICAL_SOURCE', 'EVM-04 source visibility');
check(eById.get('EVM-02')?.uncertainty?.lower && eById.get('EVM-02')?.uncertainty?.upper, 'EVM-02 paired interval missing');
for (const f of figures) {
  check(pi.has(f.project), `${f.id}: project missing`);
  check(f.type !== 'DECORATIVE' && f.scientificPurpose?.zh && f.caption?.zh && f.alt?.zh, `${f.id}: scientific figure text missing`);
  for (const id of f.evidenceIds) check(ei.has(id) && eById.get(id)?.project === f.project, `${f.id}: invalid evidence relation ${id}`);
  const file = path.join(root, 'public', f.path.slice(1));
  check(fs.existsSync(file), `${f.id}: asset missing`);
  if (fs.existsSync(file)) {
    const bytes = fs.readFileSync(file);
    check(bytes.length === f.sourceSize, `${f.id}: byte length changed`);
    check(crypto.createHash('sha256').update(bytes).digest('hex') === f.sourceHash, `${f.id}: original hash changed`);
    if (f.mime === 'image/svg+xml') check(!/<script\b|\bon\w+\s*=|<foreignObject\b/i.test(bytes.toString('utf8')), `${f.id}: SVG active content`);
  }
  for (const derivative of f.webDerivative) {
    check(derivative.inputHash === f.sourceHash, `${f.id}: derivative input hash mismatch`);
    const preview = path.join(root, 'public', derivative.path.slice(1));
    check(fs.existsSync(preview), `${f.id}: derivative missing`);
    if (fs.existsSync(preview)) check(crypto.createHash('sha256').update(fs.readFileSync(preview)).digest('hex') === derivative.outputHash, `${f.id}: derivative hash changed`);
  }
}
const overview = materials.find((m) => m.id === 'overview');
const pdf = fs.readFileSync(path.join(root, 'public/documents/research-overview.pdf'));
check(pdf.subarray(0, 4).toString() === '%PDF', 'Overview is not PDF');
check(pdf.length === overview.sourceSize, 'Overview PDF byte length changed');
check(crypto.createHash('sha256').update(pdf).digest('hex') === overview.sourceHash, 'Overview PDF hash changed');
for (const m of materials) {
  check(m.accessStatus === 'PENDING' ? !m.publicUrl : Boolean(m.publicUrl), `${m.id}: access / URL mismatch`);
  if (m.publicUrl?.startsWith('/')) check(fs.existsSync(path.join(root, 'public', m.publicUrl.slice(1))), `${m.id}: local public asset missing`);
}
check(profile.nameStatus === 'APPROVED' && profile.publicName?.zh && profile.publicName.zh !== 'TBD', 'Approved public name missing');
check(profile.emailStatus === 'APPROVED' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.publicEmail), 'Approved email missing');
check(profile.schoolStatus === 'APPROVED' && profile.schoolWording?.zh && profile.schoolWording.zh !== 'TBD', 'Approved school wording missing');
check(map.nodes.length === 4 && map.relationships.length === 2, 'Research Map topology');
check(map.nodes.filter((n) => n.trackId === 'electromagnetic').length === 3, 'Main research track');
check(map.nodes.filter((n) => n.trackId === 'autonomous').length === 1, 'Autonomous branch');
for (const n of map.nodes) check(pi.has(n.projectId) && ei.has(n.evidenceTeaserId), `Map node ${n.id}: invalid reference`);
if (err.length) { console.error(err.map((x) => `FAIL ${x}`).join('\n')); process.exit(1); }
console.log(`Content valid: ${projects.length} projects, ${evidence.length} evidence records, ${figures.length} original figures, ${materials.length} materials, 4 map nodes; hashes verified.`);
