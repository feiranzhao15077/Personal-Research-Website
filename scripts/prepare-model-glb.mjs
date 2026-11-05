import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';

const [sourceDirectory, outputDirectory, suppliedId, ...flags] = process.argv.slice(2);
if (!sourceDirectory || !outputDirectory) throw new Error('Usage: node scripts/prepare-model-glb.mjs <source-pack-directory> <public-output-directory> [model-id] [--preview-only]');
const modelId = suppliedId || path.basename(path.resolve(outputDirectory));
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(modelId)) throw new Error('Model ID must use lowercase letters, digits and hyphens.');
const flagValue = name => flags.find(flag => flag.startsWith(`--${name}=`))?.slice(name.length + 3);
const sourceDesktop = flagValue('desktop-file') || `${modelId}.glb`;
const sourceMobile = flagValue('mobile-file') || `${modelId}-lite.glb`;
if (![sourceDesktop, sourceMobile].every(filename => /^[A-Za-z0-9_-]+\.glb$/.test(filename))) throw new Error('Source GLB options must name a file in the source directory.');
const mobileRatio = Number(flagValue('mobile-ratio') || 1);
if (!(mobileRatio > 0 && mobileRatio <= 1)) throw new Error('Mobile ratio must be greater than zero and at most one.');
const yawDegrees = Number(flagValue('yaw-degrees') || 0);
if (!Number.isFinite(yawDegrees)) throw new Error('Source orientation must be a finite yaw angle.');
const orient = document => {
  if (!yawDegrees) return;
  const halfAngle = yawDegrees * Math.PI / 360;
  document.getRoot().listScenes().forEach(scene => {
    const children = [...scene.listChildren()];
    const pivot = document.createNode('Web orientation').setRotation([0, Math.sin(halfAngle), 0, Math.cos(halfAngle)]);
    children.forEach(child => { scene.removeChild(child); pivot.addChild(child); });
    scene.addChild(pivot);
  });
};
await fs.mkdir(outputDirectory, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const previewOnly = flags.includes('--preview-only');
const provenanceDirectory = path.resolve('.impeccable/model-assets');
const provenancePath = path.join(provenanceDirectory, `${modelId}.json`);
const records = previewOnly ? await fs.readFile(provenancePath, 'utf8').then(value => JSON.parse(value).records.filter(record => record.filename !== `${modelId}-preview.glb`)).catch(() => []) : [];
for (const filename of previewOnly ? [] : [`${modelId}.glb`, `${modelId}-lite.glb`]) {
  const sourceFilename = filename === `${modelId}.glb` ? sourceDesktop : sourceMobile;
  const source = path.join(sourceDirectory, sourceFilename), destination = path.join(outputDirectory, filename);
  const bytes = await fs.readFile(source);
  const document = await io.readBinary(bytes);
  orient(document);
  if (filename.endsWith('-lite.glb') && mobileRatio < 1) await document.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: mobileRatio, error: .002 }));
  const triangles = document.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((n, primitive) => n + (primitive.getIndices()?.getCount() || primitive.getAttribute('POSITION')?.getCount() || 0) / 3, 0), 0);
  await document.transform(
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /baseColorTexture/, quality: 92, effort: 60 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /normalTexture/, lossless: true, effort: 60 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 16 }),
  );
  await io.write(destination, document);
  const output = await fs.readFile(destination);
  if (output.length > 25 * 1024 * 1024) throw new Error(`${filename} exceeds the established host's single-file limit.`);
  records.push({ filename, sourceFilename, yawDegrees, mobileRatio: filename.endsWith("-lite.glb") ? mobileRatio : 1, animations: document.getRoot().listAnimations().map(clip => clip.getName()), sourceSha256: createHash('sha256').update(bytes).digest('hex'), outputSha256: createHash('sha256').update(output).digest('hex'), sourceBytes: bytes.length, outputBytes: output.length, triangles, meshes: document.getRoot().listMeshes().length, materials: document.getRoot().listMaterials().length, textures: document.getRoot().listTextures().length, extensions: document.getRoot().listExtensionsUsed().map(extension => extension.extensionName) });
  console.log(`${filename}: ${(bytes.length / 1048576).toFixed(2)} → ${(output.length / 1048576).toFixed(2)} MiB; ${triangles} triangles retained.`);
}
// Tiny entrance scenes keep the aircraft silhouette without downloading the inspection mesh.
const previewSource = await fs.readFile(path.join(sourceDirectory, sourceMobile));
const preview = await io.readBinary(previewSource);
orient(preview);
await preview.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: .16, error: .004 }),
  dedup(), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /baseColorTexture/, resize: [768, 768], quality: 86, effort: 60 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(?!baseColorTexture$)/, resize: [512, 512], lossless: true, effort: 60 }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 14 }),
);
const previewFilename = `${modelId}-preview.glb`;
await io.write(path.join(outputDirectory, previewFilename), preview);
const previewBytes = await fs.readFile(path.join(outputDirectory, previewFilename));
if (previewBytes.length > 25 * 1024 * 1024) throw new Error(`${previewFilename} exceeds the established host's single-file limit.`);
const previewTriangles = preview.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((n, primitive) => n + (primitive.getIndices()?.getCount() || primitive.getAttribute('POSITION')?.getCount() || 0) / 3, 0), 0);
records.push({ filename: previewFilename, sourceFilename: sourceMobile, yawDegrees, sourceSha256: createHash('sha256').update(previewSource).digest('hex'), outputSha256: createHash('sha256').update(previewBytes).digest('hex'), sourceBytes: previewSource.length, outputBytes: previewBytes.length, triangles: previewTriangles, meshes: preview.getRoot().listMeshes().length, materials: preview.getRoot().listMaterials().length, textures: preview.getRoot().listTextures().length, process: 'Entrance only: welded mesh, simplification ratio .16/error .004; WebP color 768px/quality 86 and lossless non-color maps 512px; Meshopt medium with 14-bit position/UV and 10-bit normals.' });
console.log(`${previewFilename}: ${(previewBytes.length / 1048576).toFixed(2)} MiB; ${previewTriangles} triangles.`);
await fs.mkdir(provenanceDirectory, { recursive: true });
await fs.writeFile(provenancePath, JSON.stringify({ sourceDirectory: path.resolve(sourceDirectory), process: 'Standard/lite: WebP color at quality 92, lossless normal textures, Meshopt medium with 16-bit positions/UVs and 12-bit normals; mobile simplification only when explicitly requested by --mobile-ratio. Entrance preview: separate lower-resolution derivative as described in its record.', records }, null, 2) + '\n');
