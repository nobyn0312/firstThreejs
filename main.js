import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd6d1c1); // 暗めのきなり色

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// レンダラー
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 0.5;
controls.update();

// ライト設定

// 環境光（少し明るめ）
const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.8);
scene.add(ambientLight);

// ブルー系ポイントライト（やや明るめのアクセント）
const blueLight = new THREE.PointLight(0x6699ff, 0.3, 80);
blueLight.position.set(-5, 5, 5);
scene.add(blueLight);

// 暖色系メインスポットライト（明るくして角度少し広げる）
const warmSpotLight = new THREE.SpotLight(0xffb066, 1);
warmSpotLight.position.set(5, 10, 5);
warmSpotLight.angle = Math.PI / 7; // 約25度
warmSpotLight.penumbra = 0.7;
warmSpotLight.distance = 30;
warmSpotLight.castShadow = true;
warmSpotLight.shadow.mapSize.width = 2048;
warmSpotLight.shadow.mapSize.height = 2048;
warmSpotLight.shadow.camera.near = 0.5;
warmSpotLight.shadow.camera.far = 50;
scene.add(warmSpotLight);
warmSpotLight.target.position.set(0, 0, 0);
scene.add(warmSpotLight.target);

// 部屋の左側用スポットライト（明るくして角度少し広げる）
const leftSpotLight = new THREE.SpotLight(0xffdca3, 0.45);
leftSpotLight.position.set(-7, 5, 3);
leftSpotLight.angle = Math.PI / 7; // 約25度
leftSpotLight.penumbra = 0.8;
leftSpotLight.distance = 25;
leftSpotLight.castShadow = true;
scene.add(leftSpotLight);
leftSpotLight.target.position.set(0, 0, 0);
scene.add(leftSpotLight.target);

// 半球光（空と地面の自然光、明るめ）
const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.8);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// モデル読み込み
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

loader.load(
  '/rooms_2.glb',
  function (gltf) {
    scene.add(gltf.scene);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.2;

    const offsetX = maxDim * 0.5;
    const offsetY = maxDim * 0.3;

    camera.position.set(
      center.x + offsetX,
      center.y + offsetY,
      center.z + cameraZ
    );

    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
