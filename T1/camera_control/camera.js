import * as THREE from "three";
import { PointerLockControls } from "../../build/jsm/controls/PointerLockControls.js";
import { initRenderer, initDefaultBasicLight, onWindowResize } from "../../libs/util/util.js";

// inicializa o renderizador com um rosa muito massa
const renderer = initRenderer("rgb(235, 130, 216)");

// pra criar a cena
const scene = new THREE.Scene();

// cria a camera
const camera = new THREE.PerspectiveCamera( //(fov, aspect, near, far)
	45, //45° de abertura para simular a visão humana
	window.innerWidth / window.innerHeight, // proporção da tela: divide largura da tela pela altura da tela para não esticar a imagem
	0.1, // define a distância mínima da câmera em que objetos começam a ser renderizados
	1000 // define a distância máxima da câmera em que objetos são renderizados
);
camera.position.set(0, 2, 5); // posiciona a camera na altura (estimada)de um ser humano
camera.lookAt(new THREE.Vector3(4, 1, 2)); // começa olhando pra frente
// adiciona uma luz básica à cena
initDefaultBasicLight(scene);

// adiciona o chão à cena
const loader = new THREE.TextureLoader();
const groundTexture = loader.load("../../assets/textures/wood.png");
groundTexture.colorSpace = THREE.SRGBColorSpace;
groundTexture.wrapS = THREE.MirroredRepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping; // repetição vertical para garantir que o chão não fique descontinuo ou desigual
groundTexture.repeat.set(15, 15); // muito chão

const planeGeometry = new THREE.PlaneGeometry(50, 50, 5); // (largura, altura, segmentos)
const planeMaterial = new THREE.MeshLambertMaterial({
	map: groundTexture,
});
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
scene.add(ground);

// cria os controles de ponteiro
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

// elementos do DOM para o blocker e instruções
const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");

// evento para travar o ponteiro ao clicar nas instruções
instructions.addEventListener(
	"click",
	function () {
		controls.lock();
	},
	false
);

// eventos para mostrar/esconder instruções
controls.addEventListener("lock", function () {
	instructions.style.display = "none";
	blocker.style.display = "none";
});
controls.addEventListener("unlock", function () {
	blocker.style.display = "block";
	instructions.style.display = "";
});

// Variáveis de movimento
const speed = 15;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// captura de teclas (o keyCode foi preterido por key, que é mais moderno)
window.addEventListener("keydown", (event) => movementControls(event.key, true));
window.addEventListener("keyup", (event) => movementControls(event.key, false));

function movementControls(key, value) {
	switch (key) {
		case "w":
		case "ArrowUp":
			moveForward = value;
			break;
		case "s":
		case "ArrowDown":
			moveBackward = value;
			break;
		case "a":
		case "ArrowLeft":
			moveLeft = value;
			break;
		case "d":
		case "ArrowRight":
			moveRight = value;
			break;
		case " ":
			moveUp = value;
			break;
		case "Shift":
			moveDown = value;
			break;
	}
}

// função de animação de movimento usando matrizes
function moveAnimate(delta) {
	// delta = é o tempo decorrido desde o último frame
	const moveDistance = speed * delta; // distância de movimento proporcional ao tempo para manter a velocidade constante e suave

	// da matriz que representa a transformacao global (rotacao, translacao e escala) da camera, vamos extrair o componente de rotação
	const rotationMatrix = new THREE.Matrix4().extractRotation(camera.matrixWorld);

	// vetores base transformados pela rotação da câmera

	const forwardVector = new THREE.Vector3(0, 0, -1).applyMatrix4(rotationMatrix);
	// o vetor para frente é o vetor -Z
	// multiplicamos pela matriz de rotação para obter o vetor na direção da câmera
	// como resultado, temos a direção para onde a câmera está olhando no espaço
	const rightVector = new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix);
	// o vetor para a direita é o vetor +X
	// direcao perpendicular ao vetor para frente no plano horizontal
	const upVector = new THREE.Vector3(0, 1, 0).applyMatrix4(rotationMatrix);
	// o vetor para cima é o vetor +Y
	// mantemos o vetor para cima na direção Y, pois não queremos que a câmera gire para cima ou para baixo

	// calcula o vetor de movimento com base nas teclas pressionadas

	const movementVector = new THREE.Vector3(); // vetor de movimento inicializado em (0, 0, 0)
	// multiplicamos o vetor de movimento pela distância de movimento e somamos ao vetor de movimento total
	// dessa forma, o vetor de movimento (ou seja, sua posição) é atualizado frequentemente
	if (moveForward) movementVector.add(forwardVector.multiplyScalar(moveDistance));
	if (moveBackward) movementVector.add(forwardVector.multiplyScalar(-moveDistance));
	if (moveRight) movementVector.add(rightVector.multiplyScalar(moveDistance));
	if (moveLeft) movementVector.add(rightVector.multiplyScalar(-moveDistance));
	if (moveUp) movementVector.add(upVector.multiplyScalar(moveDistance));
	if (moveDown) movementVector.add(upVector.multiplyScalar(-moveDistance));

	// aqui somamos o vetor de movimento à posição atual da câmera
	camera.position.add(movementVector);

	// aqui atualizamos a matriz de transformação da câmera para efetuar as mudanças na posição
	camera.updateMatrixWorld();
}

window.addEventListener(
	"resize",
	function () {
		onWindowResize(camera, renderer);
	},
	false
);

// relógio para calcular delta time
const clock = new THREE.Clock();

function render() {
	if (controls.isLocked) {
		moveAnimate(clock.getDelta());
	}
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}
render();
