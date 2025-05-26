import * as THREE from "three";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });
const material2 = new THREE.MeshBasicMaterial({ color: 'rgb(0, 106, 255)' });
const planeGeometry = new THREE.PlaneGeometry(100, 100, 5); 
const cubeGeometry = new THREE.BoxGeometry(10, 5, 10); // geometria do cubo

let chao = []; // array para armazenar os objetos do chão
let paredes = []; // array para armazenar as paredes

function inicializaCenario(scene) {
    // Cria o chão
    let ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    chao.push(ground); // adiciona o chão ao array de chão

    // Cubo provisório
    let cubo1 = new THREE.Mesh(cubeGeometry, material2);
    cubo1.position.set(0, 2.5, -20);
    chao.push(cubo1);
    paredes.push(cubo1);

    let cubo2 = new THREE.Mesh(cubeGeometry, material2);
    cubo2.position.set(-6.75, -0.3, -20);
    cubo2.rotation.z = Math.PI / 4;
    chao.push(cubo2);
    paredes.push(cubo2);


    //Adiciona os objetos na cena
    scene.add(ground);
    scene.add(cubo1);
    scene.add(cubo2);
}

//Só pra gente puxar os objetos para a colisão
function getParedes() {
    return paredes;
}

//Só pra gente puxar os objetos para a colisão
function getChao() {
    return chao;
}



export { inicializaCenario, getParedes, getChao };