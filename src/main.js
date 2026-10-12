import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { createStage } from './scene/setup.js';
import { addLighting } from './scene/lighting.js';
import { loadApartment } from './scene/model.js';
import { createScrollTour } from './tour/scrollTour.js';
import { KEYFRAMES, STOPS, ITEM_LABELS } from './tour/stops.js';
import { createPicking } from './interact/picking.js';
import { focusPose } from './interact/focus.js';
import { createHud } from './ui/hud.js';
import './styles.css';

CameraControls.install({ THREE });

const params = new URLSearchParams(location.search);
if (params.has('shot')) document.body.classList.add('shot');
const canvas = document.querySelector('#scene');
const stage = createStage(canvas);
const { renderer, scene, camera, composer, outline } = stage;
const lighting = addLighting(renderer, scene);

const tour = createScrollTour(KEYFRAMES);
let model = null;
let mode = 'tour';
let selected = null;

const hud = createHud(STOPS, {
  itemLabel: (id) => ITEM_LABELS[id] ?? id,
  onItem: (id) => model && selectItem(model.itemById.get(id)),
  onStop: (i) => {
    if (mode === 'free') setMode('tour');
    tour.scrollToStop(i);
  },
  onToggleMode: () => setMode(mode === 'free' ? 'tour' : 'free'),
  onClosePanel: () => selectItem(null),
});

const controls = new CameraControls(camera, renderer.domElement);
controls.smoothTime = 0.45;
controls.draggingSmoothTime = 0.12;
controls.minDistance = 0.2;
controls.maxDistance = 22;
controls.dollySpeed = 0.6;
controls.dollyToCursor = true;
controls.infinityDolly = false;
controls.enabled = false;

function setMode(next) {
  mode = next;
  controls.enabled = mode === 'free';
  controls.colliderMeshes = mode === 'free' && model ? model.walls : [];
  if (mode === 'tour') selectItem(null);
  hud.setMode(mode);
}

function selectItem(item) {
  selected = item ?? null;
  if (!selected) {
    hud.hideItem();
    return;
  }
  if (mode !== 'free') setMode('free');
  hud.showItem(selected.userData);
  const { pos, look } = focusPose(selected, model.rooms);
  controls.setLookAt(pos.x, pos.y, pos.z, look.x, look.y, look.z, true);
}

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (selected) selectItem(null);
  else if (mode === 'free') setMode('tour');
});

// Kamera kilidi (ekran görüntüsü / debug): ?cam=x,y,z&look=x,y,z
let lockedPose = params.has('cam')
  ? { pos: params.get('cam').split(',').map(Number), look: (params.get('look') ?? '0,0,0').split(',').map(Number) }
  : null;

window.__lockPose = (pos, look) => (lockedPose = pos ? { pos, look } : null);

const timer = new THREE.Timer();
const outlined = [];

function frame() {
  timer.update();
  const dt = timer.getDelta();

  if (model) {
    if (lockedPose) {
      controls.setLookAt(...lockedPose.pos, ...lockedPose.look, false);
    } else if (mode === 'tour') {
      const s = tour.stopFromScroll();
      const { pos, look } = tour.pose(s);
      controls.setLookAt(pos.x, pos.y, pos.z, look.x, look.y, look.z, true);
      hud.updateTour(s);
      const stop = STOPS[Math.round(s)];
      tourHighlight = Math.abs(s - Math.round(s)) < 0.3 ? stop.items ?? [] : [];
    }
    controls.update(dt);
    picking.update();

    // Kuşbakışında tavan gizlenir, içeride görünür.
    const inside = camera.position.y < 2.35;
    model.ceiling.visible = inside;
    lighting.sun.intensity = inside ? sunIndoor : sunOutdoor;

    // Vurgulanan eşyalar: seçili > fare altındaki > turdaki durağın eşyaları
    outlined.length = 0;
    if (selected) outlined.push(selected);
    if (picking.hovered && picking.hovered !== selected) outlined.push(picking.hovered);
    if (mode === 'tour' && !picking.hovered) tourHighlight.forEach((id) => model.itemById.has(id) && outlined.push(model.itemById.get(id)));
    outline.selectedObjects = outlined;
  }

  composer.render();
  stage.afterRender?.();
  requestAnimationFrame(frame);
}

let picking = null;
let tourHighlight = [];
const sunOutdoor = lighting.sun.intensity;
const sunIndoor = lighting.sun.intensity * 0.6;

requestAnimationFrame(frame);

model = await loadApartment(renderer, scene, hud.setProgress);

picking = createPicking({ camera, canvas, root: model.root });
picking.on('hover', (item, e) => {
  hud.showTooltip(item?.userData.label, e);
  document.body.style.cursor = item ? 'pointer' : '';
});
window.addEventListener('pointermove', (e) => picking.hovered && hud.moveTooltip(e));
picking.on('pick', (item) => {
  if (item) selectItem(item);
  else if (selected) selectItem(null);
});

// İlk kareyi tur pozundan başlat (geçiş animasyonu olmadan).
{
  const { pos, look } = lockedPose ? { pos: new THREE.Vector3(...lockedPose.pos), look: new THREE.Vector3(...lockedPose.look) } : tour.pose(tour.stopFromScroll());
  controls.setLookAt(pos.x, pos.y, pos.z, look.x, look.y, look.z, false);
}

if (params.has('debug')) {
  const { initDebug } = await import('./debug.js');
  await initDebug({ params, stage, model, lighting, controls });
}

hud.ready();
window.__ready = true;
