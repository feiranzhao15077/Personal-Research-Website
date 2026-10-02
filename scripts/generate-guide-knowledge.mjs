import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const directory = path.join(root, 'src/content');
const readYaml = file => YAML.parse(fs.readFileSync(file, 'utf8'));
const evidence = new Map(fs.readdirSync(path.join(directory, 'evidence')).filter(file => file.endsWith('.yaml')).map(file => {
  const item = readYaml(path.join(directory, 'evidence', file));
  return [item.id, item];
}));
const profile = readYaml(path.join(directory, 'site/profile.yaml'));
const projects = fs.readdirSync(path.join(directory, 'projects')).filter(file => file.endsWith('.md')).map(file => {
  const text = fs.readFileSync(path.join(directory, 'projects', file), 'utf8');
  const project = YAML.parse(text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
  return {
    slug: project.slug, title: project.title.zh, summary: project.summary.zh,
    question: project.researchQuestion.zh, methods: project.methods.map(item => item.zh),
    limitations: project.limitations.map(item => item.zh),
    evidence: project.mainEvidence.map(id => {
      const item = evidence.get(id);
      return { id, claim: item.claim.zh, result: item.metric.display.zh,
        observations: item.metric.observations, protocol: item.protocolContext.zh,
        uncertainty: item.uncertainty, status: item.status, boundary: item.boundary.zh,
        auditDetail: item.auditDetail?.zh, source: item.publicSource.url };
    }),
  };
});
const target = path.join(root, 'functions/_data/guide-knowledge.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify({ name: profile.publicName.zh, school: profile.schoolWording.zh,
  identity: profile.researchIdentity.zh, projects }, null, 2) + '\n');
console.log(`Guide knowledge generated from ${projects.length} approved project records.`);
