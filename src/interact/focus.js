import * as THREE from 'three';

const CEILING_CLEARANCE = 2.25;

// Eşyaya bakan bir kamera pozu üretir. Kamera, eşyadan bulunduğu odanın merkezine doğru
// geri çekilir; böylece duvarın arkasına düşmeden odanın içinden bakar.
export function focusPose(item, rooms) {
  const box = new THREE.Box3().setFromObject(item);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z) * 0.5;

  const roomCenter = rooms[item.userData.room]?.center ?? new THREE.Vector3();
  const dir = new THREE.Vector3(roomCenter.x - center.x, 0, roomCenter.z - center.z);
  if (dir.lengthSq() < 0.01) dir.set(0.3, 0, 1);
  dir.normalize();

  // Odanın karşı duvarını aşmamak için oda merkezinin biraz ötesine kadar izin verilir.
  const toRoomCenter = Math.hypot(roomCenter.x - center.x, roomCenter.z - center.z);
  const distance = THREE.MathUtils.clamp(radius * 2.2 + 0.4, 0.9, Math.max(1.2, toRoomCenter + 0.9));
  const pos = center.clone().addScaledVector(dir, distance);
  pos.y = THREE.MathUtils.clamp(center.y + radius * 0.9 + 0.3, 0.6, CEILING_CLEARANCE);

  return { pos, look: center };
}
