import * as THREE from 'three';
import { GLTFLoader } from 'three/addons';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { listen } from "@tauri-apps/api/event";
import { VRM } from '@pixiv/three-vrm'
import { setPositionFromBonePosition, Message } from './OSCReceiver';



const scene = new THREE.Scene();

// カメラの準備
const camera = new THREE.PerspectiveCamera(45, 960 / 540, 0.1, 1000)
camera.position.set(0, 0.5, -2.0)
camera.rotation.set(0, Math.PI, 0)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(960, 540)
document.body.appendChild(renderer.domElement)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5)
directionalLight.position.set(1, 1, 1)
scene.add(directionalLight)


const loader = new GLTFLoader();
let vrm: VRM;
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

loader.load(
  '/src/assets/sample.vrm',

  (gltf) => {
    vrm = gltf.userData.vrm;
    scene.add(vrm.scene);
  },
  (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
  (error) => console.error(error),
);
listen<Message>('OscPacket', (e) => {
  setPositionFromBonePosition(e.payload.bone, vrm);
});

function tick() {
  requestAnimationFrame(tick)
  renderer.render(scene, camera)
}
tick()