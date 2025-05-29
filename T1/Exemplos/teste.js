import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import {PointerLockControls} from '../build/jsm/controls/PointerLockControls.js';
import {initRenderer,
        initDefaultBasicLight,
        onWindowResize} from "../libs/util/util.js";

var stats = new Stats();
var renderer = initRenderer("rgb(70, 150, 240)");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 2, -5);
camera.lookAt(new THREE.Vector3(0, 2, -2));
scene.add(camera);

const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2);
initDefaultBasicLight(scene); 

const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(58, 7, 7)' });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.position.set(0, 0, 0);
scene.add(ground);

const escada = new THREE.Group();
const boxMaterial   = new THREE.MeshBasicMaterial({ color: 'rgb(155, 77, 77)' });

// Parâmetros da escada
const degraus = 8;
const largura = 30;
const alturaTotal = 30;
const comprimento = 30;

const alturaDegrau = alturaTotal / degraus;
const profundidadeDegrau = comprimento / degraus;

for (let i = 0; i < degraus; i++) {
  const geometry = new THREE.BoxGeometry(largura, alturaDegrau, profundidadeDegrau);
  const degrau = new THREE.Mesh(geometry, planeMaterial); 
  
  // Posição:
  degrau.position.x = 0;
  degrau.position.y = (i + 0.5) * alturaDegrau;
  degrau.position.z = (i + 0.5) * profundidadeDegrau;
  
  escada.add(degrau);
}

//box 1
const boxGeometry1 = new THREE.BoxGeometry(10, 30, 100);
const box11 = new THREE.Mesh(boxGeometry1, boxMaterial);
box11.position.set(-195, 15, -150);
scene.add(box11);

const boxGeometry2 = new THREE.BoxGeometry(30, 30, 70);
const box12 = new THREE.Mesh(boxGeometry2, boxMaterial);
box12.position.set(-175, 15, -165);
scene.add(box12);

const boxGeometry3 = new THREE.BoxGeometry(60, 30, 100);
const box13 = new THREE.Mesh(boxGeometry3, boxMaterial);
box13.position.set(-130, 15, -150);
scene.add(box13);

const escada1 = escada.clone();
escada1.position.set(-175, 0, -100);
escada1.rotation.y = Math.PI; 
scene.add(escada1);

//box 2
const box21 = new THREE.Mesh(boxGeometry3, boxMaterial);
box21.position.set(-20, 15, -150);
scene.add(box21);

const box22 = new THREE.Mesh(boxGeometry2, boxMaterial);
box22.position.set(25, 15, -165);
scene.add(box22);

const box23 = new THREE.Mesh(boxGeometry1, boxMaterial);
box23.position.set(45, 15, -150);
scene.add(box23);

const escada2 = escada.clone();
escada2.position.set(25, 0, -100);
escada2.rotation.y = Math.PI; 
scene.add(escada2);

//box 3
const boxGeometry4 = new THREE.BoxGeometry(40, 30, 100);
const box31 = new THREE.Mesh(boxGeometry4, boxMaterial);
box31.position.set(120, 15, -150);
scene.add(box31);

const boxGeometry5 = new THREE.BoxGeometry(30, 30, 70);
const box32 = new THREE.Mesh(boxGeometry5, boxMaterial);
box32.position.set(155, 15, -165);
scene.add(box32);

const boxGeometry6 = new THREE.BoxGeometry(60, 30, 100);
const box33 = new THREE.Mesh(boxGeometry6, boxMaterial);
box33.position.set(185, 15, -150);
scene.add(box33);

const escada3 = escada.clone();
escada3.position.set(155, 0, -100);
escada3.rotation.y = Math.PI;
scene.add(escada3);

//box4
const boxGeometry7 = new THREE.BoxGeometry(135, 30, 100);
const box41 = new THREE.Mesh(boxGeometry7, boxMaterial);
box41.position.set(-82.5, 15, 150);
scene.add(box41);

const boxGeometry8 = new THREE.BoxGeometry(30, 30, 70);
const box42 = new THREE.Mesh(boxGeometry8, boxMaterial);
box42.position.set(0, 15, 165);
scene.add(box42);

const box43 = new THREE.Mesh(boxGeometry7, boxMaterial);
box43.position.set(82.5, 15, 150);
scene.add(box43);

const escada4 = escada.clone();
escada4.position.set(0, 0, 100);
scene.add(escada4);

//rampas
const rampGeometry = new THREE.PlaneGeometry(30, Math.sqrt(30 * 30 + 30 * 30));
const rampMaterial = new THREE.MeshBasicMaterial({ visible: false }); 
const ramp1 = new THREE.Mesh(rampGeometry, rampMaterial);
ramp1.rotation.x = -Math.atan(30 / 30);
ramp1.position.set(-175, 15, -115);
scene.add(ramp1);
const ramp2 = new THREE.Mesh(rampGeometry, rampMaterial);
ramp2.rotation.x = -Math.atan(30 / 30); 
ramp2.position.set(25, 15, -115);
scene.add(ramp2);
const ramp3 = new THREE.Mesh(rampGeometry, rampMaterial);
ramp3.rotation.x = -Math.atan(30 / 30); 
ramp3.position.set(155, 15, -115);
scene.add(ramp3);
const ramp4 = new THREE.Mesh(rampGeometry, rampMaterial);
ramp4.rotation.x = Math.atan(30 / 30);
ramp4.position.set(0, 15, 115);
scene.add(ramp4);


const WallGeometry = new THREE.PlaneGeometry(500, 50);
const wallMaterial  = new THREE.MeshBasicMaterial({ color: 'rgb(255, 255, 255)' });

const walls = [];

for (let i = 0; i < 4; i++) {
    walls.push(new THREE.Mesh(WallGeometry, wallMaterial));
}

walls[0].position.set(0, 25, -250);

walls[1].position.set(0, 25, 250);
walls[1].rotation.y = Math.PI;

walls[2].position.set(-250, 25, 0);
walls[2].rotation.y = Math.PI / 2;

walls[3].position.set(250, 25, 0);
walls[3].rotation.y = Math.PI / -2;


walls.forEach(wall => scene.add(wall));

const controls = new PointerLockControls(camera, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', function () {

    controls.lock();

}, false);

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
});

scene.add(controls.getObject());

const speed = 20;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));

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
        case 32:
            moveUp = value;
            break;
        case 16:
            moveDown = value;
            break;
    }
}

function moveAnimate(delta) {
    raycaster.ray.origin.copy(controls.getObject().position);
    const isIntersectingGround = raycaster.intersectObjects(ground).length > 0;
    // const isIntersectingRamp = raycaster.intersectObject([ramp1, ramp2, ramp3]).length > 0;

    if (moveForward) {
        controls.moveForward(speed * delta);
    }
    else if (moveBackward) {
        controls.moveForward(speed * -1 * delta);
    }

    if (moveRight) {
        controls.moveRight(speed * delta);
    }
    else if (moveLeft) {
        controls.moveRight(speed * -1 * delta);
    }

    if (moveUp && camera.position.y <= 100) {
        camera.position.y += speed * delta;
    }
    // else if (moveDown && !isIntersectingGround && !isIntersectingRamp) {
    //     camera.position.y -= speed * delta;
    // }
    // else if (isIntersectingRamp) {
    //     camera.position.y += speed / 2 * delta;
    // }
}

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

const clock = new THREE.Clock();
render();
function render() {
    stats.update();

    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}