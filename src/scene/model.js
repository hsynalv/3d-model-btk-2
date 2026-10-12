import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = `${import.meta.env.BASE_URL}models/apartment.glb`;

// apartment.glb, scripts/build-model.mjs tarafından üretilir. Node extras'ları
// (kind: item | structure | ceiling | light) three.js'te userData olarak gelir.
export async function loadApartment(renderer, scene, onProgress) {
  const gltf = await new GLTFLoader().loadAsync(MODEL_URL, (e) => {
    if (e.lengthComputable) onProgress?.(e.loaded / e.total);
  });
  const root = gltf.scene;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const items = [];
  const rooms = {};
  const lights = [];
  let ceiling = null;
  const walls = [];

  root.traverse((obj) => {
    const data = obj.userData;
    if (data.kind === 'item') items.push(obj);
    if (data.kind === 'ceiling') ceiling = obj;
    if (data.kind === 'structure' && data.source === 'Object_67') walls.push(obj);
    if (data.kind === 'light') {
      rooms[data.room] = { id: data.room, label: data.roomLabel, center: obj.position.clone() };
    }
    if (obj.isLight) {
      obj.decay = 2;
      lights.push(obj);
    }
    if (!obj.isMesh) return;

    obj.castShadow = true;
    obj.receiveShadow = true;
    const mat = obj.material;
    if (mat.map) mat.map.anisotropy = maxAniso;
    if (/glass/i.test(mat.name)) {
      mat.transparent = true;
      mat.depthWrite = false;
      mat.roughness = 0.05;
      mat.metalness = 0.1;
      obj.castShadow = false;
    }
    if (mat.name === 'Mirror') {
      mat.color.set(0xffffff);
      mat.metalness = 1;
      mat.roughness = 0.03;
    }
  });

  if (ceiling) ceiling.traverse((o) => o.isMesh && (o.castShadow = false));

  scene.add(root);
  return { root, items, itemById: new Map(items.map((o) => [o.userData.id, o])), rooms, lights, ceiling, walls };
}
