import * as THREE from "three";
import { Chave } from './chave.js';
import { Elevador } from './elevador.js';
import { InimigoLostSoul } from '../personagens/inimigoLostSoul.js';
import { AreaTrigger } from './areaTrigger.js';
import { PlataformaChave} from './plataformaChave.js';
import { BlocoChave } from './blocoChave.js';
import { PortaArea } from "./portaArea.js";
import { GameController } from "../controller/gamecontroller.js";
import { Cacodemon } from "../personagens/inimigoCacodemon.js";
import { setMaterial } from "../Mesh/extractor.js";

//materiais
const material = new THREE.MeshLambertMaterial({color:'rgb(37, 72, 45)'});
const planeMaterial = new THREE.MeshLambertMaterial({color:'rgb(58, 7, 7)'});
const box1Material = new THREE.MeshLambertMaterial({color: 'rgb(77, 155, 132)'});
const box2Material  = new THREE.MeshLambertMaterial({color:'rgb(155, 77, 77)'});
const box3Material  = new THREE.MeshLambertMaterial({color:'rgb(77, 132, 155)'});
const box4Material  = new THREE.MeshLambertMaterial({color:'rgb(132, 77, 155)'});
const wallMaterial  = new THREE.MeshLambertMaterial({color:'rgb(255, 255, 255)'});
const columnMaterial = new THREE.MeshLambertMaterial({color:'rgb(158, 158, 158)'});

//geometrias
const planeGeometry = new THREE.PlaneGeometry(500, 500); 
const boxGeometry1 = new THREE.BoxGeometry(10, 4, 100);
const boxGeometry2 = new THREE.BoxGeometry(30, 4, 70);
const boxGeometry3 = new THREE.BoxGeometry(60, 4, 100);
const boxGeometry4 = new THREE.BoxGeometry(40, 4, 100);
const boxGeometry5 = new THREE.BoxGeometry(30, 4, 70);
const boxGeometry6 = new THREE.BoxGeometry(30, 4, 100);
const boxGeometry7 = new THREE.BoxGeometry(135, 4, 100);
const boxGeometry8 = new THREE.BoxGeometry(30, 4, 70);
const boxGeometry9 = new THREE.BoxGeometry(50, 4, 100);
const boxGeometry10 = new THREE.BoxGeometry(10, 4, 90);
const boxGeometry11 = new THREE.BoxGeometry(40, 4, 100);
const rampGeometry = new THREE.PlaneGeometry(30, Math.sqrt(30 * 30 + 4 * 4));
const wallGeometry = new THREE.PlaneGeometry(520, 50);
const columnGeometry = new THREE.CylinderGeometry(2, 2, 20, 32);
const topGeometry = new THREE.BoxGeometry(100, 2, 6);

const chao = []; // array para armazenar os objetos do chão
const paredes = []; // array para armazenar as paredes

let plataformaChave1 = null;
let chave1Obj = null;
let plataformaChave2 = null;
let chave2Obj = null;
let porta = null;
let pilarChave = null;
let elevador = null;

function inicializaCenario(scene, player) {
    // Cria o céu
    createSkybox(scene);

    // cria o chão
    const ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    chao.push(ground); // adiciona o chão ao array de chão

    // área 1
    let a1 = createArea1(scene, player);
    scene.add(a1);
  
    // área 2
    let a2 = createArea2(scene, player);
    scene.add(a2);

    // box 3
    let a3 = createArea3(scene, player);
    scene.add(a3);
    
    // box 4
    let a4 = createArea4(scene, player);
    scene.add(a4);

    //Cria as paredes
    const parede1 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede1.position.set(0, 25, -250);
    parede1.castShadow = true;
    paredes.push(parede1); 

    const parede2 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede2.position.set(0, 25, 250); 
    parede2.rotation.x = Math.PI;    
    parede1.castShadow = true;
    paredes.push(parede2);

    const parede3 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede3.position.set(-250, 25, 0);
    parede3.rotation.y = Math.PI / 2;
    parede1.castShadow = true;
    paredes.push(parede3); 

    const parede4 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede4.position.set(250, 25, 0); 
    parede4.rotation.y = Math.PI / -2;
    parede1.castShadow = true;
    paredes.push(parede4);

    chao.forEach(element => { element.receiveShadow = true; });

    //adiciona os objetos na cena
    scene.add(ground);
    scene.add(parede1);
    scene.add(parede2);    
    scene.add(parede3);
    scene.add(parede4);

    addInimigos(scene, player);

}

function createSkybox(scene){
    const texLoader = new THREE.TextureLoader();
    let tex = texLoader.load('./assets/panorama1.jpg');
    console.log("Skybox texture loaded:", tex);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
}

function createArea1(scene, player){
    const box1 = new THREE.Object3D();
    const box11 = new THREE.Mesh(boxGeometry1, box1Material);
    box11.position.set(-45, 2, 0);
    box11.castShadow = true;
    chao.push(box11);
    paredes.push(box11);

    const box12 = new THREE.Mesh(boxGeometry2, box1Material);
    box12.position.set(-25, 2, -15);
    box12.castShadow = true;
    chao.push(box12);
    paredes.push(box12);

    const box13 = new THREE.Mesh(boxGeometry3, box1Material);
    box13.position.set(20, 2, 0);
    box13.castShadow = true;
    chao.push(box13);
    paredes.push(box13);

    const escada1 = createEscada();
    escada1.position.set(-25, 0, 50);
    escada1.rotation.y = Math.PI;

    const ramp1 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp1.rotation.x = -Math.atan(30/4); //(comprimento/altura)
    ramp1.position.set(-25, 2, 35);
    ramp1.visible = false;
    chao.push(ramp1);

    box1.add(box11);
    box1.add(box12);
    box1.add(box13);
    box1.add(escada1);
    box1.add(ramp1);
    box1.position.set(-150, 0, -150);
    
    let matCil = [
        setMaterial('./assets/intertravado.jpg', 1, 1), // Textura dos lados
        setMaterial('./assets/intertravado.jpg', 1, 1),
        setMaterial('./assets/intertravado.jpg', 1, 1)
    ]
    const column = new THREE.Mesh(columnGeometry, matCil);
    
    for (let i = 0; i < 14; i++) {
        let column1 = column.clone();
        column1.position.set(-47 + i*7.2, 14, -48);
        column1.castShadow = true;
        box1.add(column1);
        paredes.push(column1);
    }

    let columnTop = new THREE.Mesh(topGeometry, columnMaterial);
    let column1Top = columnTop.clone();
    column1Top.position.set(0, 25, -48);
    column1Top.castShadow = true;
    box1.add(column1Top);
    for (let i = 0; i < 13; i++) {
        let column2 = column.clone();
        column2.position.set(-47, 14, 47 - i*7.2);
        column2.castShadow = true;
        box1.add(column2);
        paredes.push(column2);
    }
    let column2Top = columnTop.clone();
    column2Top.position.set(-47, 25, 0);
    column2Top.rotation.y = Math.PI / 2;
    column2Top.castShadow = true;
    box1.add(column2Top);
    for (let i = 0; i < 13; i++) {
        let column3 = column.clone();
        column3.position.set(47, 14, 47 - i*7.2);
        column3.castShadow = true;
        box1.add(column3);
        paredes.push(column3);
    }
    let column3Top = columnTop.clone();
    column3Top.position.set(47, 25, 0);
    column3Top.rotation.y = Math.PI / -2;
    column3Top.castShadow = true;
    box1.add(column3Top);

    // chave vermelha mostrada quando matar todos os inimigos da área 2
    chave1Obj = new Chave(scene, player.bb, 'vermelha');
    chave1Obj.mesh.visible = false;

    // plataforma da chave na área 1
    plataformaChave1 = new PlataformaChave(scene, new THREE.Vector3(0, -2, 0), chave1Obj);
    box1.add(plataformaChave1.plataforma);
    paredes.push(plataformaChave1.plataforma);
    chao.push(plataformaChave1.plataforma);
    return box1;
}

function createArea2(scene, player){
    const box2 = new THREE.Object3D();

    const box21 = new THREE.Mesh(boxGeometry9, box2Material);
    box21.position.set(-25, 2, 0);
    box21.castShadow = true;
    chao.push(box21);
    paredes.push(box21);

    const box22 = new THREE.Mesh(boxGeometry10, box2Material);
    box22.position.set(5, 2, -5);
    box22.castShadow = true;
    chao.push(box22);
    paredes.push(box22);

    const box23 = new THREE.Mesh(boxGeometry11, box2Material);
    box23.position.set(30, 2, 0);
    box23.castShadow = true;
    chao.push(box23);
    paredes.push(box23);

    box2.add(box21);
    box2.add(box22);
    box2.add(box23);
    box2.position.set(0, 0, -150);

    // blocos de diferentes alturas
    const block = new THREE.Mesh(new THREE.BoxGeometry(5, 25, 5), box2Material);
    let block1 = block.clone();
    block1.position.set(-25, 19, 5);
    block1.castShadow = true;
    let block2 = block.clone();
    block2.position.set(40, 19, 35);
    block2.castShadow = true;
    let block3 = block.clone();
    block3.position.set(20, 26, -15);
    block3.castShadow = true;
    let block4 = block.clone();
    block4.position.set(0, 15, -45);
    block4.castShadow = true;
    let block5 = block.clone();
    block5.position.set(0, 15, 15);
    block5.castShadow = true;
    let block6 = block.clone();
    block6.position.set(30, 13, 15);
    block6.castShadow = true;
    let block7 = block.clone();
    block7.position.set(-20, 26, -15);
    block7.castShadow = true;
    let block8 = block.clone();
    block8.position.set(40, 26, -40);
    block8.castShadow = true;
    let block9 = block.clone();
    block9.position.set(-10, 25, 35);
    block9.castShadow = true;
    let block10 = block.clone();
    block10.position.set(20, 15, -35);
    block10.castShadow = true;
    let block11 = block.clone();
    block11.position.set(-40, 25, -5);
    block11.castShadow = true;
    let block12 = block.clone();
    block12.position.set(-40, 15, 25);
    block12.castShadow = true;
    let block13 = block.clone();
    block13.position.set(-30, 24, 45);
    block13.castShadow = true;
    let block14 = block.clone();
    block14.position.set(-40, 17, -45);
    block14.castShadow = true;

    box2.add(block1);
    box2.add(block2);
    box2.add(block3);
    box2.add(block4);
    box2.add(block6);
    box2.add(block7);
    box2.add(block8);
    box2.add(block9);
    box2.add(block10);
    box2.add(block11);
    box2.add(block12);
    box2.add(block13);
    box2.add(block14);

    paredes.push(block1);
    paredes.push(block2);
    paredes.push(block3);
    paredes.push(block4);
    paredes.push(block5);    
    paredes.push(block6);
    paredes.push(block7);
    paredes.push(block8);
    paredes.push(block9);
    paredes.push(block10);
    paredes.push(block11);
    paredes.push(block12); 
    paredes.push(block13);
    paredes.push(block14);

    chao.push(block1);
    chao.push(block2);
    chao.push(block3);
    chao.push(block4);
    chao.push(block5);
    chao.push(block6);
    chao.push(block7);
    chao.push(block8);
    chao.push(block9);
    chao.push(block10);
    chao.push(block11);
    chao.push(block12);
    chao.push(block13);
    chao.push(block14);

    // pilar para a chave
    const pilarGeometria = new THREE.BoxGeometry(4, 2, 4);
    pilarChave = new THREE.Mesh(pilarGeometria, wallMaterial);
    pilarChave.position.set(4, 1, -65);
    pilarChave.castShadow = true;
    paredes.push(pilarChave);
    chao.push(pilarChave);
    scene.add(pilarChave);

    // porta da área 2
    const portaGeometria = new THREE.BoxGeometry(0.1, 4, 10);
    porta = new THREE.Mesh(portaGeometria, wallMaterial);
    porta.position.set(5, 2, -100);
    porta.rotation.y = Math.PI / 2;
    porta.castShadow = true;
    paredes.push(porta);
    scene.add(porta);
    
    // elevador da área 2
    elevador = new Elevador(scene, new THREE.Vector3(5, 0, -106), player);

    const areaPorta = new PortaArea(scene, porta, pilarChave, player, chave1Obj);

    // chave amarela mostrada quando matar todos os inimigos
    chave2Obj = new Chave(scene, player.bb, 'amarela');
    chave2Obj.mesh.visible = false;

    // plataforma da chave na área 2
    plataformaChave2 = new PlataformaChave(scene, new THREE.Vector3(0, -2, 15), chave2Obj);
    plataformaChave2.plataforma.add(block5);
    block5.position.set(0, 18, 0);
    box2.add(plataformaChave2.plataforma);
    paredes.push(plataformaChave2.plataforma);
    chao.push(plataformaChave2.plataforma);

    /*
    // plataforma da chave na área 1
    plataformaChave1 = new PlataformaChave(scene, new THREE.Vector3(0, -2, 0), chave1Obj);
    box1.add(plataformaChave1.plataforma);
    paredes.push(plataformaChave1.plataforma);
    chao.push(plataformaChave1.plataforma);
    */

    return box2;
}

function createArea3(scene, player){
    const box3 = new THREE.Object3D();
    const box31 = new THREE.Mesh(boxGeometry4, box3Material);
    box31.position.set(120, 2, -150);
    box31.castShadow = true;
    box3.add(box31);
    chao.push(box31);
    paredes.push(box31);
    
    const box32 = new THREE.Mesh(boxGeometry5, box3Material);
    box32.position.set(155, 2, -165);
    box32.castShadow = true;
    box3.add(box32);
    chao.push(box32);
    paredes.push(box32);
    
    const box33 = new THREE.Mesh(boxGeometry6, box3Material);
    box33.position.set(185, 2, -150);
    box33.castShadow = true;
    box3.add(box33);
    chao.push(box33);
    paredes.push(box33);
    
    const escada3 = createEscada();
    escada3.position.set(155, 0, -100);
    escada3.rotation.y = Math.PI;
    box3.add(escada3);
    return box3;
}

function createArea4(scene, player){
    const box4 = new THREE.Object3D();
    const box41 = new THREE.Mesh(boxGeometry7, box4Material);
    box41.position.set(-82.5, 2, 150);
    box41.castShadow = true;
    box4.add(box41);
    chao.push(box41);
    paredes.push(box41);
    
    const box42 = new THREE.Mesh(boxGeometry8, box4Material);
    box42.position.set(0, 2, 165);
    box42.castShadow = true;
    box4.add(box42);
    chao.push(box42);
    paredes.push(box42);
    
    const box43 = new THREE.Mesh(boxGeometry7, box4Material);
    box43.position.set(82.5, 2, 150);
    box43.castShadow = true;
    box4.add(box43);
    chao.push(box43);
    paredes.push(box43);
    
    const escada4 = createEscada();
    escada4.position.set(0, 0, 100);
    box4.add(escada4);
    
    // Cria as rampas

    const ramp3 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp3.rotation.x = -Math.atan(30/4); 
    ramp3.position.set(155, 2, -115); 
    ramp3.visible = false;
    box4.add(ramp3);
    chao.push(ramp3);

    const ramp4 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp4.rotation.y = Math.PI;
    ramp4.rotation.x = Math.atan(30/4);
    ramp4.position.set(0, 2, 115); 
    ramp4.visible = false;
    box4.add(ramp4);
    chao.push(ramp4);
    return box4;
}

function addInimigos(scene, player) {

    // add inimigos na área 1
    const areaTrigger1 = new AreaTrigger(scene, new THREE.Vector3(-150, 0, -150), new THREE.Vector3(100, 10, 100), player);

    for (let i = 0; i < 5; i++) {
        const inimigo = new InimigoLostSoul( scene,  20, 5, player, areaTrigger1, 10);
        inimigo.object.position.set(-180 + i * 10, 8, -180 + i * 10); 
        console.log("Inimigo criado na área 1:", inimigo);
        GameController.instance.addInimigoArea1(inimigo);
    }

    // add inimigos na área 2
    const areaTrigger2 = new AreaTrigger( scene, new THREE.Vector3(0, 0, -150), new THREE.Vector3(100, 10, 100), player );

    const inimigo1 = new Cacodemon(scene, player, areaTrigger2, 10, new THREE.Vector3(0, 21, -135));
    console.log("Inimigo criado na área 2:", inimigo1);
    GameController.instance.addInimigoArea2(inimigo1);
    
    const inimigo2 = new Cacodemon(scene, player, areaTrigger2, 10, new THREE.Vector3(20, 21, -185));
    console.log("Inimigo criado na área 2:", inimigo2);
    GameController.instance.addInimigoArea2(inimigo2);
    
    const inimigo3 = new Cacodemon(scene, player, areaTrigger2, 10, new THREE.Vector3(-40, 21, -125));
    console.log("Inimigo criado na área 2:", inimigo3);
    GameController.instance.addInimigoArea2(inimigo3);
}

//Só pra gente puxar os objetos para a colisão
function getParedes() {
    return paredes;
}

//Só pra gente puxar os objetos para a colisão
function getChao() {
    return chao;
}

function createEscada(){
    // Cria as escadas
    const escada = new THREE.Object3D();

    const degraus = 8;
    const largura = 30;
    const alturaTotal = 4;
    const comprimento = 30;
    
    const alturaDegrau = alturaTotal / degraus;
    const profundidadeDegrau = comprimento / degraus;
    
    for (let i = 0; i < degraus; i++) {
      const geometry = new THREE.BoxGeometry(largura, alturaDegrau, profundidadeDegrau);
      const degrau = new THREE.Mesh(geometry, planeMaterial); 
      
      degrau.position.x = 0;
      degrau.position.y = (i + 0.5) * alturaDegrau;
      degrau.position.z = (i + 0.5) * profundidadeDegrau;
      degrau.castShadow = true;
      
      escada.add(degrau);
    }

    return escada;
}

function addChao(objeto){
    chao.push(objeto);
}

function addParedes(objeto){
    paredes.push(objeto);
}

export { inicializaCenario, getParedes, getChao, addChao, addParedes, plataformaChave1, chave1Obj, plataformaChave2, chave2Obj, porta, pilarChave, elevador};