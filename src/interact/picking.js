import * as THREE from 'three';

// Fare altındaki eşyayı bulur. Işın tüm modele atılır ki duvar arkasındaki eşyalar seçilmesin;
// görünmez (gizli tavan) ve saydam (cam) yüzeyler yok sayılır.
export function createPicking({ camera, canvas, root }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let dirty = false;
  let hovered = null;
  const listeners = { hover: [], pick: [] };

  const isShown = (obj) => {
    for (let o = obj; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  const itemOf = (obj) => {
    for (let o = obj; o; o = o.parent) if (o.userData.kind === 'item') return o;
    return null;
  };

  function pick() {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(root, true);
    const hit = hits.find((h) => !h.object.material.transparent && isShown(h.object));
    return hit ? itemOf(hit.object) : null;
  }

  function setNdc(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  // UI öğelerinin (kartlar, düğmeler, paneller) üzerindeki etkileşimler sahneye geçmez.
  const overUi = (e) => e.target.closest?.('[data-ui]');

  let down = null;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    setNdc(e);
    dirty = !overUi(e);
    if (overUi(e) && hovered) setHovered(null, e);
    lastEvent = e;
  });
  window.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
  window.addEventListener('pointerup', (e) => {
    if (!down || overUi(e)) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return; // sürükleme, tıklama değil
    setNdc(e);
    const item = pick();
    listeners.pick.forEach((fn) => fn(item));
  });

  let lastEvent = null;
  function setHovered(item, e) {
    if (item === hovered) return;
    hovered = item;
    listeners.hover.forEach((fn) => fn(item, e));
  }

  return {
    update() {
      if (!dirty) return;
      dirty = false;
      setHovered(pick(), lastEvent);
    },
    get hovered() {
      return hovered;
    },
    on(event, fn) {
      listeners[event].push(fn);
    },
  };
}
