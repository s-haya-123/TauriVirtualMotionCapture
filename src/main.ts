import * as THREE from 'three';
import { GLTFLoader } from 'three/addons';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

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
// Install GLTFLoader plugin
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

loader.load(
  // URL of the VRM you want to load
  '/src/assets/sample.vrm',

  // called when the resource is loaded
  (gltf) => {
    // retrieve a VRM instance from gltf
    const vrm = gltf.userData.vrm;

    // add the loaded vrm to the scene
    scene.add(vrm.scene);

    // deal with vrm features
    console.log(vrm);
  },

  // called while loading is progressing
  (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

  // called when loading has errors
  (error) => console.error(error),
);
// アニメーションループの開始
function tick() {
  requestAnimationFrame(tick)
  renderer.render(scene, camera)
}
tick()