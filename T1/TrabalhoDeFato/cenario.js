import * as THREE from "three";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });
const planeGeometry = new THREE.PlaneGeometry(50, 50, 5); 

let chao = []; // array para armazenar os objetos do chão
let paredes = []; // array para armazenar as paredes

function inicializaCenario(scene) {
    /*
    const groundTexturePath = "../../assets/textures/wood.png"; // caminho da textura do chão
    const loader = new THREE.TextureLoader();
    const groundTexture = loader.load(groundTexturePath);
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    groundTexture.wrapS = THREE.MirroredRepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping; // repetição vertical para garantir que o chão não fique descontinuo ou desigual
    groundTexture.repeat.set(15, 15); // muito chão
    */

    let ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    scene.add(ground);
}

function getParedes() {
    return paredes;
}

function getChao() {
    return chao;
}



export { inicializaCenario, getParedes, getChao };