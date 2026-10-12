import * as THREE from 'three';

// Scroll konumunu kamera pozuna çevirir.
// KEYFRAMES; içerikli duraklar (stop) ve duvarlardan geçmemek için ara geçiş noktalarından oluşur.
// Her durak sayfada bir ekran yüksekliğindedir; kamera durakta bir süre bekler, sonra
// ara noktalar üzerinden bir sonrakine kayar.
export function createScrollTour(keyframes) {
  const posCurve = new THREE.CatmullRomCurve3(keyframes.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(keyframes.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal');
  const stopIndices = keyframes.flatMap((k, i) => (k.stop ? [i] : []));
  const last = keyframes.length - 1;

  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();

  // Durak arasındaki ilerlemeyi, uçlarda bekleme (dwell) olacak şekilde yumuşatır.
  const DWELL = 0.18;
  const ease = (f) => {
    const t = THREE.MathUtils.clamp((f - DWELL) / (1 - 2 * DWELL), 0, 1);
    return t * t * (3 - 2 * t);
  };

  return {
    stopCount: stopIndices.length,

    // Sayfa scroll'undan kesirli durak indeksi (0 … stopCount-1).
    stopFromScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
      return p * (stopIndices.length - 1);
    },

    pose(s) {
      const i = Math.min(Math.floor(s), stopIndices.length - 2);
      const a = stopIndices[i];
      const b = stopIndices[i + 1];
      const k = a + ease(s - i) * (b - a);
      const u = k / last;
      posCurve.getPoint(u, pos);
      lookCurve.getPoint(u, look);
      return { pos, look };
    },

    scrollToStop(i) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: (i / (stopIndices.length - 1)) * max, behavior: 'smooth' });
    },
  };
}
