import * as THREE from 'three';
import { GLTFLoader } from 'three/addons';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { listen } from "@tauri-apps/api/event";
import { VRM, VRMHumanBoneName, VRMUtils } from '@pixiv/three-vrm'

const boneName = [
  "RightHand",
  "RightLowerArm",
  "RightUpperArm",
  "RightShoulder",
  "LeftHand",
  "LeftLowerArm",
  "LeftUpperArm",
  "LeftShoulder",
  "RightUpperLeg",
  "RightLowerLeg",
  "RightToes",
  "LeftUpperLeg",
  "LeftLowerLeg",
  "LeftToes",
  "Hips",
  "Head",
] as const;


type BoneName = typeof boneName[number];

type Transform = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
    w: number;
  }
};
type MessageCamera = {
  transform: Transform;
  fog: number;
};
type BonePosition = {
  transform: Transform;
  name: BoneName;
}

type Message = {
  time: readonly number[];
  bone: readonly BonePosition[];
  camera: readonly MessageCamera[];
  root: readonly Transform[];
}
type Event = {
  payload: Message
}


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

const setPositionFromBonePosition = (boneArray: readonly BonePosition[], vrm: VRM | undefined) => {
  if (!vrm) {
    return;
  }
  for (const bone of boneArray) {
    const node = vrm.humanoid.getNormalizedBone(VRMHumanBoneName[bone.name])?.node;
    if (!!node) {
      const t = bone.transform;
      node.position.set(t.position.x, t.position.y, t.position.z);
      node.quaternion.set(-t.rotation.x, -t.rotation.y, t.rotation.z, t.rotation.w);
    }
  }
  vrm.humanoid.update();
}

listen('OscPacket', (e: Event) => {
  setPositionFromBonePosition(e.payload.bone, vrm);
});

function tick() {
  requestAnimationFrame(tick)
  renderer.render(scene, camera)
}
tick()