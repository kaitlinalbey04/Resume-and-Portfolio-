import * as THREE from "https://esm.sh/three@0.164.1";
import { OrbitControls } from "https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://esm.sh/three@0.164.1/examples/jsm/loaders/STLLoader.js";

const viewerElements = document.querySelectorAll(".model-viewer");
const loader = new STLLoader();
const modelBaseUrl = "https://media.githubusercontent.com/media/kaitlinalbey04/Resume-and-Portfolio-/main/portfolio/assets/";

viewerElements.forEach((element) => {
  addLaunchButton(element);
});

function addLaunchButton(element) {
  const launchButton = document.createElement("button");
  launchButton.className = "model-viewer-launch";
  launchButton.type = "button";
  launchButton.textContent = "View 3D model";
  element.appendChild(launchButton);

  launchButton.addEventListener("click", () => {
    launchButton.remove();
    element.classList.add("is-active");
    initializeViewer(element);
  });
}

function initializeViewer(element) {
  let animationFrameId;
  let model;
  let isStopped = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef2f3);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  element.appendChild(renderer.domElement);
  element.classList.add("is-loading");
  element.dataset.loading = "Loading 3D model...";

  const stopButton = document.createElement("button");
  stopButton.className = "model-viewer-stop";
  stopButton.type = "button";
  stopButton.textContent = "Close 3D model";
  element.appendChild(stopButton);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x66747a, 2.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(3, 5, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = false;

  const resizeObserver = new ResizeObserver(resizeViewer);
  resizeObserver.observe(element);

  stopButton.addEventListener("click", () => {
    isStopped = true;
    cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    controls.dispose();
    model?.geometry.dispose();
    model?.material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    stopButton.remove();
    element.classList.remove("is-active", "is-loading", "has-error");
    delete element.dataset.loading;
    addLaunchButton(element);
  });

  loader.load(
    `${modelBaseUrl}${encodeURIComponent(element.dataset.model)}`,
    (geometry) => {
      if (isStopped) {
        geometry.dispose();
        return;
      }

      geometry.computeVertexNormals();
      geometry.center();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const boxSize = new THREE.Vector3();
      geometry.boundingBox.getSize(boxSize);
      const largestDimension = Math.max(boxSize.x, boxSize.y, boxSize.z) || 1;
      const displayScale = 1.8 / largestDimension;

      const material = new THREE.MeshStandardMaterial({
        color: 0x7899a3,
        metalness: 0.15,
        roughness: 0.42,
      });
      model = new THREE.Mesh(geometry, material);
      model.scale.setScalar(displayScale);
      model.castShadow = true;
      model.receiveShadow = true;
      scene.add(model);

      const radius = (geometry.boundingSphere?.radius || 1) * displayScale;
      const cameraDistance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.05;
      camera.position.set(cameraDistance, cameraDistance * 0.65, cameraDistance);
      camera.near = Math.max(radius / 100, 0.01);
      camera.far = radius * 100;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.minDistance = radius * 0.8;
      controls.maxDistance = radius * 8;
      controls.update();
      element.classList.remove("is-loading");
      delete element.dataset.loading;
      resizeViewer();
    },
    (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        element.dataset.loading = `Loading 3D model... ${percentage}%`;
      }
    },
    () => {
      if (isStopped) {
        return;
      }

      element.classList.remove("is-loading");
      element.classList.add("has-error");
      delete element.dataset.loading;
      renderer.domElement.remove();
    },
  );

  function resizeViewer() {
    const width = element.clientWidth;
    const height = element.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }

  resizeViewer();
  animate();
}