// Kaynak GLB'yi web için tamamlar:
//  1. Tüm node dönüşümlerini geometriye uygular, cm → m, daireyi orijine merkezler.
//  2. Malzemeye göre birleştirilmiş mesh'lerden eşyaları ayrı, adlandırılmış node'lara ayırır
//     (kurallar scripts/items.config.mjs içinde, normalize edilmiş metre koordinatlarında).
//  3. Tavan ve oda başına KHR_lights_punctual ışıkları ekler.
// Çıktı: public/models/apartment.glb (kaynak dosyalara dokunulmaz).

import { NodeIO } from '@gltf-transform/core';
import { KHRLightsPunctual } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITEMS, ROOMS, CEILING } from './items.config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, '3d-model/trilocale_via_boncompagni_milano.glb');
const OUT = resolve(root, 'public/models/apartment.glb');

const UNIT = 0.01; // cm → m
const CENTER = [-8390.375, 0, -173.125]; // dünya sınırlarının XZ merkezi, zemin y=0

const toMeters = (p) => [(p[0] - CENTER[0]) * UNIT, (p[1] - CENTER[1]) * UNIT, (p[2] - CENTER[2]) * UNIT];

const io = new NodeIO().registerExtensions([KHRLightsPunctual]);
const doc = await io.read(SRC);
const gltfRoot = doc.getRoot();
const scene = gltfRoot.getDefaultScene() ?? gltfRoot.listScenes()[0];
const buffer = gltfRoot.listBuffers()[0];

// ---------------------------------------------------------------- yardımcılar
const transformPoint = (m, x, y, z) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];
const transformDir = (m, x, y, z) => {
  const v = [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z];
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const inBox = (p, box) =>
  p[0] >= box[0][0] && p[0] <= box[1][0] && p[1] >= box[0][1] && p[1] <= box[1][1] && p[2] >= box[0][2] && p[2] <= box[1][2];

function accessor(array, type) {
  return doc.createAccessor().setArray(array).setType(type).setBuffer(buffer);
}

// Bir primitive'in üçgen alt kümesinden kompakt yeni bir primitive üretir.
function subPrimitive(src, tris) {
  const { attrs, index, vertexCount, material } = src;
  const remap = new Int32Array(vertexCount).fill(-1);
  let n = 0;
  const idx = new Uint32Array(tris.length * 3);
  tris.forEach((t, i) => {
    for (let k = 0; k < 3; k++) {
      const v = index[t * 3 + k];
      if (remap[v] < 0) remap[v] = n++;
      idx[i * 3 + k] = remap[v];
    }
  });
  const prim = doc.createPrimitive().setMaterial(material);
  for (const [semantic, { array, size, type }] of Object.entries(attrs)) {
    const out = new array.constructor(n * size);
    for (let v = 0; v < vertexCount; v++) {
      const r = remap[v];
      if (r >= 0) for (let c = 0; c < size; c++) out[r * size + c] = array[v * size + c];
    }
    prim.setAttribute(semantic, accessor(out, type));
  }
  prim.setIndices(accessor(n < 65536 ? Uint16Array.from(idx) : idx, 'SCALAR'));
  return prim;
}

// ---------------------------------------------------------------- 1) geometriyi dünyaya bake et
const sources = []; // { nodeName, prims: [{ attrs, index, vertexCount, material, centroids }] }
for (const node of gltfRoot.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const world = node.getWorldMatrix();
  const prims = [];
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    const vertexCount = pos.getCount();
    const attrs = {};
    for (const semantic of prim.listSemantics()) {
      const acc = prim.getAttribute(semantic);
      const array = acc.getArray().slice();
      const size = acc.getElementSize();
      if (semantic === 'POSITION') {
        for (let v = 0; v < vertexCount; v++) {
          const w = transformPoint(world, array[v * 3], array[v * 3 + 1], array[v * 3 + 2]);
          array.set(toMeters(w), v * 3);
        }
      } else if (semantic === 'NORMAL') {
        for (let v = 0; v < vertexCount; v++) {
          array.set(transformDir(world, array[v * 3], array[v * 3 + 1], array[v * 3 + 2]), v * 3);
        }
      } else if (semantic === 'TANGENT') {
        for (let v = 0; v < vertexCount; v++) {
          array.set(transformDir(world, array[v * 4], array[v * 4 + 1], array[v * 4 + 2]), v * 4);
        }
      }
      attrs[semantic] = { array, size, type: acc.getType() };
    }
    const indexAcc = prim.getIndices();
    const index = indexAcc ? indexAcc.getArray() : Uint32Array.from({ length: vertexCount }, (_, i) => i);
    const triCount = index.length / 3;
    const pos3 = attrs.POSITION.array;
    const centroids = new Float32Array(triCount * 3);
    for (let t = 0; t < triCount; t++) {
      for (let c = 0; c < 3; c++) {
        centroids[t * 3 + c] = (pos3[index[t * 3] * 3 + c] + pos3[index[t * 3 + 1] * 3 + c] + pos3[index[t * 3 + 2] * 3 + c]) / 3;
      }
    }
    prims.push({ attrs, index, vertexCount, triCount, material: prim.getMaterial(), centroids });
  }
  sources.push({ nodeName: node.getName(), prims });
}

// Eski hiyerarşiyi kaldır; yeni düz hiyerarşi kurulacak.
for (const child of scene.listChildren()) scene.removeChild(child);
for (const node of gltfRoot.listNodes()) node.dispose();
for (const mesh of gltfRoot.listMeshes()) mesh.dispose();

const apartment = doc.createNode('Apartment');
scene.addChild(apartment);
const structureGroup = doc.createNode('Structure');
const itemsGroup = doc.createNode('Items');
const lightsGroup = doc.createNode('Lights');
apartment.addChild(structureGroup).addChild(itemsGroup).addChild(lightsGroup);

// ---------------------------------------------------------------- 2) eşyaları ayır
const matches = (rule, nodeName, c) => {
  if (rule.node && rule.node !== nodeName) return false;
  if (rule.box && !inBox(c, rule.box)) return false;
  return true;
};

const itemTris = new Map(ITEMS.map((it) => [it.id, []])); // id → [{ src, tris }]
const report = [];

for (const { nodeName, prims } of sources) {
  const structurePrims = [];
  for (const src of prims) {
    const buckets = new Map();
    const rest = [];
    for (let t = 0; t < src.triCount; t++) {
      const c = [src.centroids[t * 3], src.centroids[t * 3 + 1], src.centroids[t * 3 + 2]];
      const item = ITEMS.find((it) => it.match.some((rule) => matches(rule, nodeName, c)));
      if (item) {
        if (!buckets.has(item.id)) buckets.set(item.id, []);
        buckets.get(item.id).push(t);
      } else rest.push(t);
    }
    for (const [id, tris] of buckets) itemTris.get(id).push({ src, tris });
    if (rest.length) structurePrims.push({ src, tris: rest });
  }
  if (!structurePrims.length) continue;
  const mesh = doc.createMesh(nodeName);
  for (const { src, tris } of structurePrims) mesh.addPrimitive(subPrimitive(src, tris));
  const materials = [...new Set(structurePrims.map(({ src }) => src.material?.getName()))];
  structureGroup.addChild(
    doc.createNode(nodeName).setMesh(mesh).setExtras({ kind: 'structure', source: nodeName, materials }),
  );
}

for (const item of ITEMS) {
  const parts = itemTris.get(item.id);
  const triTotal = parts.reduce((s, p) => s + p.tris.length, 0);
  report.push(`${triTotal ? '  ' : '⚠ '}${item.id.padEnd(18)} ${String(triTotal).padStart(6)} üçgen`);
  if (!triTotal) continue;
  const mesh = doc.createMesh(`item_${item.id}`);
  for (const { src, tris } of parts) mesh.addPrimitive(subPrimitive(src, tris));
  itemsGroup.addChild(
    doc
      .createNode(`item_${item.id}`)
      .setMesh(mesh)
      .setExtras({
        kind: 'item',
        id: item.id,
        label: item.label,
        room: item.room,
        roomLabel: ROOMS[item.room]?.label ?? item.room,
        description: item.description,
      }),
  );
}

// ---------------------------------------------------------------- 3) tavan
{
  const a = CEILING.min;
  const b = CEILING.max;
  // Aşağı bakan tek yüz + yukarı bakan tek yüz (ince plaka, yan yüzlere gerek yok).
  const P = new Float32Array([
    a[0], a[1], a[2], b[0], a[1], a[2], b[0], a[1], b[2], a[0], a[1], b[2], // alt yüz
    a[0], b[1], a[2], b[0], b[1], a[2], b[0], b[1], b[2], a[0], b[1], b[2], // üst yüz
  ]);
  const N = new Float32Array([0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
  const I = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6]);
  const material = doc
    .createMaterial('Ceiling_Plaster')
    .setBaseColorFactor([0.93, 0.92, 0.9, 1])
    .setRoughnessFactor(0.95)
    .setMetallicFactor(0);
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', accessor(P, 'VEC3'))
    .setAttribute('NORMAL', accessor(N, 'VEC3'))
    .setIndices(accessor(I, 'SCALAR'))
    .setMaterial(material);
  structureGroup.addChild(
    doc
      .createNode('Ceiling')
      .setMesh(doc.createMesh('Ceiling').addPrimitive(prim))
      .setExtras({ kind: 'ceiling' }),
  );
}

// ---------------------------------------------------------------- 4) ışıklar
{
  const ext = doc.createExtension(KHRLightsPunctual);
  for (const [id, room] of Object.entries(ROOMS)) {
    const light = ext.createLight(`light_${id}`).setType('point').setColor([1, 0.9, 0.78]).setIntensity(6).setRange(7);
    lightsGroup.addChild(
      doc
        .createNode(`light_${id}`)
        .setTranslation(room.light)
        .setExtension('KHR_lights_punctual', light)
        .setExtras({ kind: 'light', room: id, roomLabel: room.label }),
    );
  }
}

apartment.setExtras({ rooms: Object.fromEntries(Object.entries(ROOMS).map(([id, r]) => [id, r.label])) });

await doc.transform(prune());
mkdirSync(dirname(OUT), { recursive: true });
await io.write(OUT, doc);

console.log('Eşyalar:\n' + report.join('\n'));
console.log(`✓ ${OUT}`);
