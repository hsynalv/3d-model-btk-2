import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Model ışık içermediği için sahne ışığı burada kurulur:
// yumuşak ortam yansıması, gökyüzü/zemin dolgu ışığı ve pencerelerden giren gölgeli güneş.
export function addLighting(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x3a3128, 0.6);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe2b8, 2.6);
  sun.position.set(6, 9, 8);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = sun.shadow.camera;
  s.left = -7;
  s.right = 7;
  s.top = 6;
  s.bottom = -6;
  s.near = 1;
  s.far = 30;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  return { hemi, sun };
}
