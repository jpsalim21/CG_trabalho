import * as THREE from "three";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });
const material2 = new THREE.MeshBasicMaterial({ color: 'rgb(0, 106, 255)' });
const materialParede = new THREE.MeshBasicMaterial({ color: 'rgb(68, 68, 68)' }); // Material para as paredes
const planeGeometry = new THREE.PlaneGeometry(500, 500, 5);
const paredeGeometry = new THREE.PlaneGeometry(500, 100, 5); // Geometria para as paredes frontais e traseiras

const cubeGeometry = new THREE.BoxGeometry(5, 5, 5); // Geometria do cubo

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

    const parede1 = new THREE.Mesh(paredeGeometry, materialParede); // Cria a parede frontal
    parede1.position.set(0, 50, -250); // Posiciona a parede frontal
    parede1.rotation.x = 0 * Math.PI; // Rotaciona para ficar horizontal
    paredes.push(parede1); // Adiciona a parede frontal ao array de paredes
    scene.add(parede1); // Adiciona a parede frontal à cena

    const parede2 = new THREE.Mesh(paredeGeometry, materialParede); // Cria a parede traseira
    parede2.position.set(0, 50, 250); // Posiciona a parede traseira
    parede2.rotation.x = 1 * Math.PI; // Rotaciona para ficar horizontal   
    paredes.push(parede2); // Adiciona a parede traseira ao array de paredes
    scene.add(parede2); // Adiciona a parede traseira à cena

    const parede3 = new THREE.Mesh(paredeGeometry, materialParede); // Cria a parede esquerda
    parede3.position.set(-250, 50, 0); // Posiciona a parede esquerda
    parede3.rotation.y = 0.5 * Math.PI; // Rotaciona para ficar vertical
    paredes.push(parede3); // Adiciona a parede esquerda ao array de paredes
    scene.add(parede3); // Adiciona a parede esquerda à cena

    const parede4 = new THREE.Mesh(paredeGeometry, materialParede); // Cria a parede direita
    parede4.position.set(250, 50, 0); // Posiciona a parede direita
    parede4.rotation.y = -0.5 * Math.PI; // Rotaciona para ficar vertical
    paredes.push(parede4); // Adiciona a parede direita ao array de paredes
    scene.add(parede4); // Adiciona a parede direita à cena

    //Adiciona os objetos na cena
    scene.add(ground);
    scene.add(cubo1);
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