import * as THREE from "three";
import {setDefaultMaterial} from "../../libs/util/util.js";

const cubeGeometry = new THREE.BoxGeometry(5, 5, 5); // Geometria do cubo

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });
const materialParede = new THREE.MeshBasicMaterial({ color: 'rgb(68, 68, 68)' });
const materialEscada = setDefaultMaterial(); 
const planeGeometry = new THREE.PlaneGeometry(500, 500, 5);
const paredeGeometry = new THREE.PlaneGeometry(500, 100, 5); 

const degrauGeo = new THREE.BoxGeometry(24, 3, 3); 
const boxAreas = new THREE.BoxGeometry(120, 48, 96); 
const xzPlane = Math.sqrt(24**2 + 24**2);
const rampaGeo = new THREE.PlaneGeometry(xzPlane, xzPlane, 5);

let chao = []; 
let paredes = []; 

function inicializaCenario(scene) {
    // Cria o chão
    let ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    chao.push(ground); // adiciona o chão ao array de chão

    // #region Paredes
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
    // #endregion Paredes

    const area3Obj = area3(); 
    scene.add(area3Obj);
    area3Obj.position.set(135, 0, -125); 

    const area1Obj = area1();
    scene.add(area1Obj);
    area1Obj.position.set(-135, 0, -125);

    const area2Obj = area2();
    scene.add(area2Obj);
    area2Obj.position.set(0, 0, -125);

    const area4Obj = area4();
    scene.add(area4Obj);
    area4Obj.position.set(0, 0, 125);

    //Adiciona os objetos na cena
    scene.add(ground);
}

function escada(){
    const obj = new THREE.Object3D(); // Cria um objeto vazio para agrupar os degraus

    for (let i = 0; i < 8; i++) {
        const degrau = new THREE.Mesh(degrauGeo, materialEscada);
        degrau.position.set(0, 22.5 - (i * 3), 10.5 - (i * 3));
        obj.add(degrau);
    }
    return obj;
}

function area3() {
    const obj = new THREE.Object3D();
    const geoBox = new THREE.BoxGeometry(48, 48, 24);

    const escadaObj = escada();
    const boxArea = new THREE.Mesh(boxAreas, materialEscada);
    const box2 = new THREE.Mesh(geoBox, materialEscada);
    const box3 = new THREE.Mesh(geoBox, materialEscada);
    const rampa = new THREE.Mesh(rampaGeo, materialEscada);

    obj.add(escadaObj);
    obj.add(boxArea);
    obj.add(box2);
    obj.add(box3);
    obj.add(rampa);

    boxArea.position.set(0, 0, 48);
    escadaObj.position.set(0, 0, -12);
    box2.position.set(36, 0, -12);
    box3.position.set(-36, 0, -12);
    rampa.position.set(0, 12, -12);
    rampa.rotation.x = Math.PI / 4;
    rampa.rotation.y = Math.PI;
    rampa.visible = false;

    chao.push(rampa);
    chao.push(boxArea);
    chao.push(box2);
    chao.push(box3);
    paredes.push(boxArea);
    paredes.push(box2);
    paredes.push(box3);

    obj.rotation.y = Math.PI;

    return obj;
}

function area1() {
    const obj = new THREE.Object3D();
    const geoBox1 = new THREE.BoxGeometry(72, 48, 24);
    const geoBox2 = new THREE.BoxGeometry(24, 48, 24);

    const escadaObj = escada();
    const boxArea = new THREE.Mesh(boxAreas, materialEscada);
    const box2 = new THREE.Mesh(geoBox1, materialEscada);
    const box3 = new THREE.Mesh(geoBox2, materialEscada);
    const rampa = new THREE.Mesh(rampaGeo, materialEscada);
    obj.add(escadaObj);
    obj.add(boxArea);
    obj.add(box2);
    obj.add(box3);
    obj.add(rampa);
    boxArea.position.set(0, 0, 48);
    escadaObj.position.set(24, 0, -12);
    box2.position.set(-24, 0, -12);
    box3.position.set(48, 0, -12);
    rampa.position.set(24, 12, -12);
    rampa.rotation.x = Math.PI / 4;
    rampa.rotation.y = Math.PI;
    rampa.visible = false;
    chao.push(rampa);
    chao.push(boxArea);
    chao.push(box2);
    chao.push(box3);
    paredes.push(boxArea);
    paredes.push(box2);
    paredes.push(box3);

    obj.rotation.y = Math.PI;

    return obj;
}

function area2(){
    const obj = new THREE.Object3D();
    const geoBox1 = new THREE.BoxGeometry(72, 48, 24);
    const geoBox2 = new THREE.BoxGeometry(24, 48, 24);

    const escadaObj = escada();
    const boxArea = new THREE.Mesh(boxAreas, materialEscada);
    const box2 = new THREE.Mesh(geoBox1, materialEscada);
    const box3 = new THREE.Mesh(geoBox2, materialEscada);
    const rampa = new THREE.Mesh(rampaGeo, materialEscada);
    obj.add(escadaObj);
    obj.add(boxArea);
    obj.add(box2);
    obj.add(box3);
    obj.add(rampa);
    boxArea.position.set(0, 0, 48);
    escadaObj.position.set(-24, 0, -12);
    box2.position.set(24, 0, -12);
    box3.position.set(-48, 0, -12);
    rampa.position.set(-24, 12, -12);
    rampa.rotation.x = Math.PI / 4;
    rampa.rotation.y = Math.PI;
    rampa.visible = false;
    chao.push(rampa);
    chao.push(boxArea);
    chao.push(box2);
    chao.push(box3);
    paredes.push(boxArea);
    paredes.push(box2);
    paredes.push(box3);

    obj.rotation.y = Math.PI;

    return obj;
}

function area4(){
    const obj = new THREE.Object3D();
    const geoBox1 = new THREE.BoxGeometry(250, 48, 96);
    const geoBox2 = new THREE.BoxGeometry(113, 48, 24);

    const escadaObj = escada();
    const box1 = new THREE.Mesh(geoBox1, materialEscada);
    const box2 = new THREE.Mesh(geoBox2, materialEscada);
    const rampa = new THREE.Mesh(rampaGeo, materialEscada);
    const box3 = new THREE.Mesh(geoBox2, materialEscada);
    obj.add(escadaObj);
    obj.add(box1);
    obj.add(box2);
    obj.add(box3);
    obj.add(rampa);
    box1.position.set(0, 0, 48);
    escadaObj.position.set(0, 0, -12);
    box2.position.set(68.5, 0, -12);
    box3.position.set(-68.5, 0, -12);
    rampa.position.set(0, 12, -12);
    rampa.rotation.x = Math.PI / 4;
    rampa.rotation.y = Math.PI;
    rampa.visible = false;

    
    chao.push(rampa);
    chao.push(box1);
    chao.push(box2);
    chao.push(box3);
    paredes.push(box1);
    paredes.push(box2);
    paredes.push(box3);
    
    return obj;
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