import * as THREE from "three";
import Stats from "../../build/jsm/libs/stats.module.js";
import { PointerLockControls } from "../../build/jsm/controls/PointerLockControls.js";
import {
  initRenderer,
  initDefaultBasicLight,
  onWindowResize,
} from "../../libs/util/util.js";

// Inicializa o renderizador com uma cor de fundo
const renderer = initRenderer("rgb(70, 150, 240)");

// Cria a cena
const scene = new THREE.Scene();

// Cria a câmera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5); // Posiciona a câmera acima do chão
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Olha para o centro do chão

// Adiciona uma luz básica à cena
initDefaultBasicLight(scene);

// Adiciona o chão à cena
const loader = new THREE.TextureLoader();
const groundTexture = loader.load("../../assets/textures/wood.png"); // Ajuste o caminho conforme necessário
groundTexture.colorSpace = THREE.SRGBColorSpace;
groundTexture.wrapS = THREE.MirroredRepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(8, 8);

const planeGeometry = new THREE.PlaneGeometry(50, 50, 5);
const planeMaterial = new THREE.MeshLambertMaterial({
  map: groundTexture,
});
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.position.set(0, 0, 0);
ground.rotation.x = -0.5 * Math.PI; // Rotaciona para ficar horizontal
scene.add(ground);

// Cria os controles de ponteiro
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

// Elementos do DOM para o blocker e instruções
const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");

// Evento para travar o ponteiro ao clicar nas instruções
instructions.addEventListener(
  "click",
  function () {
    controls.lock();
  },
  false
);

// Eventos para mostrar/esconder instruções
controls.addEventListener("lock", function () {
  instructions.style.display = "none";
  blocker.style.display = "none";
});
controls.addEventListener("unlock", function () {
  blocker.style.display = "block";
  instructions.style.display = "";
});

// Variáveis de movimento
const speed = 20;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// Captura de teclas
window.addEventListener("keydown", (event) =>
  movementControls(event.keyCode, true)
);
window.addEventListener("keyup", (event) =>
  movementControls(event.keyCode, false)
);

function movementControls(key, value) {
  switch (key) {
    case 87: // W
      moveForward = value;
      break;
    case 83: // S
      moveBackward = value;
      break;
    case 65: // A
      moveLeft = value;
      break;
    case 68: // D
      moveRight = value;
      break;
    case 32: // Space
      moveUp = value;
      break;
    case 16: // Shift
      moveDown = value;
      break;
  }
}

// Função de animação de movimento
function moveAnimate(delta) {
  if (moveForward) {
    controls.moveForward(speed * delta);
  } else if (moveBackward) {
    controls.moveForward(-speed * delta);
  }
  if (moveRight) {
    controls.moveRight(speed * delta);
  } else if (moveLeft) {
    controls.moveRight(-speed * delta);
  }
  if (moveUp && camera.position.y <= 100) {
    camera.position.y += speed * delta;
  } else if (moveDown) {
    camera.position.y -= speed * delta;
  }
}

// Listener para redimensionamento da janela
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// Relógio para calcular delta time
const clock = new THREE.Clock();

// Função de renderização
function render() {
  if (controls.isLocked) {
    moveAnimate(clock.getDelta());
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
