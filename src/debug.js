import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ?debug            → ışık ayarları paneli, tıklanan noktanın koordinatı konsola
// ?debug=labels     → ayrıca her node'un adını ve eşya kutularını gösterir
// ?cam=x,y,z&look=x,y,z → kamerayı sabit bir poza kilitler (ekran görüntüsü için)
export async function initDebug({ params, stage, model, lighting, controls }) {
  const { scene, camera, renderer } = stage;
  window.__app = { stage, model, controls, THREE };

  if (params.get('debug') === 'grid') {
    const labels = new CSS2DRenderer();
    labels.setSize(window.innerWidth, window.innerHeight);
    Object.assign(labels.domElement.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 5 });
    document.body.appendChild(labels.domElement);
    const step = Number(params.get('step') ?? 1);
    for (let x = -6; x <= 6; x += step) {
      for (let z = -4; z <= 4; z += step) {
        const el = document.createElement('div');
        el.className = 'debug-label';
        el.textContent = `${x},${z}`;
        const label = new CSS2DObject(el);
        label.position.set(x, 0.05, z);
        scene.add(label);
      }
    }
    scene.add(new THREE.GridHelper(14, 14 / step, 0xff0000, 0xff8888));
    stage.afterRender = () => labels.render(scene, camera);
  }

  if (params.get('debug') === 'labels') {
    const labels = new CSS2DRenderer();
    labels.setSize(window.innerWidth, window.innerHeight);
    Object.assign(labels.domElement.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 5 });
    document.body.appendChild(labels.domElement);
    window.addEventListener('resize', () => labels.setSize(window.innerWidth, window.innerHeight));

    model.root.traverse((obj) => {
      const kind = obj.userData.kind;
      if (kind !== 'item' && kind !== 'structure' && kind !== 'light') return;
      const box = new THREE.Box3().setFromObject(obj);
      const el = document.createElement('div');
      el.className = `debug-label debug-label--${kind}`;
      el.textContent = kind === 'item' ? obj.userData.id : kind === 'light' ? `💡${obj.userData.room}` : obj.name;
      const label = new CSS2DObject(el);
      (kind === 'light' ? obj.position.clone() : box.getCenter(new THREE.Vector3())).toArray().forEach((v, i) => (label.position.setComponent(i, v)));
      scene.add(label);
      if (kind === 'item') scene.add(new THREE.Box3Helper(box, 0xff5577));
    });
    stage.afterRender = () => labels.render(scene, camera);
  }

  const { default: GUI } = await import('lil-gui');
  const gui = new GUI({ title: 'Debug' });
  gui.add(renderer, 'toneMappingExposure', 0.2, 3, 0.01).name('exposure');
  gui.add(scene, 'environmentIntensity', 0, 2, 0.01).name('env');
  gui.add(lighting.hemi, 'intensity', 0, 3, 0.01).name('hemi');
  gui.add(lighting.sun, 'intensity', 0, 8, 0.01).name('sun');
  const roomLights = { intensity: model.lights[0]?.intensity ?? 0 };
  gui.add(roomLights, 'intensity', 0, 40, 0.1).name('room lights').onChange((v) => model.lights.forEach((l) => (l.intensity = v)));

  const raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener('dblclick', (e) => {
    raycaster.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
    const hit = raycaster.intersectObject(model.root, true)[0];
    if (hit) console.log('hit', hit.object.name, hit.point.toArray().map((v) => +v.toFixed(2)), 'cam', camera.position.toArray().map((v) => +v.toFixed(2)));
  });
}
