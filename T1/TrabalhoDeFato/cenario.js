import * as THREE from "three";
import { Chave } from './chave.js';
import { Elevador } from './elevador.js';
import { InimigoLostSoul } from './inimigoLostSoul.js';
import { AreaTrigger } from './areaTrigger.js';
import { PlataformaChave} from './plataformaChave.js';
import { PortaArea } from "./portaArea.js";
import gameController from './gamecontroller.js';

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
let porta = null;
let pilarChave = null;
let elevador = null;
let block15 = null;

function inicializaCenario(scene, player) {

    // Cria o chão
    const ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    chao.push(ground); // adiciona o chão ao array de chão

    // área 1
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

    // colunas na área 1
    const column = new THREE.Mesh(columnGeometry, columnMaterial);

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
    box1.add(column3Top);
    
    box1.add(box11);
    box1.add(box12);
    box1.add(box13);
    box1.add(escada1);
    box1.add(ramp1);
    box1.position.set(-150, 0, -150);

    // chave vermelha mostrada quando matar todos os inimigos
    chave1Obj = new Chave(scene, player.bb, 'vermelha');
    chave1Obj.mesh.visible = false;
    box1.add(chave1Obj.mesh);

    // plataforma da chave na área 1
    plataformaChave1 = new PlataformaChave(scene, new THREE.Vector3(0, 3, 0), chave1Obj);
    box1.add(plataformaChave1.plataforma);
    paredes.push(plataformaChave1.plataforma);
    chao.push(plataformaChave1.plataforma);


    // add inimigos na área 1
    const areaTrigger1 = new AreaTrigger(scene, new THREE.Vector3(-150, 0, -150), new THREE.Vector3(100, 10, 100), player);

    for (let i = 0; i < 5; i++) {
        const inimigo = new InimigoLostSoul( scene,  20, 5, player, areaTrigger1, 10);
        inimigo.object.position.set(-180 + i * 10, 8, -180 + i * 10); 
        console.log("Inimigo criado na área 1:", inimigo);
        gameController.addInimigoArea1(inimigo);
    }
  

    // área 2
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
    block1.position.set(-25, 9, 5);
    block1.castShadow = true;
    let block2 = block.clone();
    block2.position.set(40, 9, 35);
    block2.castShadow = true;
    let block3 = block.clone();
    block3.position.set(20, 16, -15);
    block3.castShadow = true;
    let block4 = block.clone();
    block4.position.set(0, 5, -45);
    block4.castShadow = true;
    let block5 = block.clone();
    block5.position.set(0, 5, 15);
    block5.castShadow = true;
    let block6 = block.clone();
    block6.position.set(30, 3, 15);
    block6.castShadow = true;
    let block7 = block.clone();
    block7.position.set(-20, 16, -15);
    block7.castShadow = true;
    let block8 = block.clone();
    block8.position.set(40, 16, -40);
    block8.castShadow = true;
    let block9 = block.clone();
    block9.position.set(-10, 15, 35);
    block9.castShadow = true;
    let block10 = block.clone();
    block10.position.set(20, 5, -35);
    block10.castShadow = true;
    let block11 = block.clone();
    block11.position.set(-40, 5, -5);
    block11.castShadow = true;
    let block12 = block.clone();
    block12.position.set(-40, 5, 25);
    block12.castShadow = true;
    let block13 = block.clone();
    block13.position.set(-30, 14, 45);
    block13.castShadow = true;
    let block14 = block.clone();
    block14.position.set(-40, 7, -45);
    block14.castShadow = true;
    block15 = block.clone();
    block15.position.set(0, -15, 0);
    block15.castShadow = true;
    box2.add(block1);
    box2.add(block2);
    box2.add(block3);
    box2.add(block4);
    box2.add(block5);    
    box2.add(block6);
    box2.add(block7);
    box2.add(block8);
    box2.add(block9);
    box2.add(block10);
    box2.add(block11);
    box2.add(block12);
    box2.add(block13);
    box2.add(block14);
    box2.add(block15);
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
    paredes.push(block15);

    // pilar para a chave
    const pilarGeometria = new THREE.BoxGeometry(2, 2, 2);
    pilarChave = new THREE.Mesh(pilarGeometria, wallMaterial);
    pilarChave.position.set(-3, 1, -95);
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
    elevador = new Elevador(scene, new THREE.Vector3(5, 0, -110), player);

    const areaPorta = new PortaArea(scene, porta, pilarChave, elevador, chave1Obj);

    // add inimigos na área 2
    const areaTrigger2 = new AreaTrigger( scene, new THREE.Vector3(0, 0, -150), new THREE.Vector3(100, 10, 100), player );


    const inimigo1 = new InimigoLostSoul( scene, 50, 5, player, areaTrigger2, 10);
    inimigo1.object.position.set(0, 21, -135);
    console.log("Inimigo criado na área 2:", inimigo1);
    gameController.addInimigoArea2(inimigo1);

    const inimigo2 = new InimigoLostSoul( scene, 50, 5, player, areaTrigger2, 10);
    inimigo2.object.position.set(20, 21, -185);
    console.log("Inimigo criado na área 2:", inimigo2);
    gameController.addInimigoArea2(inimigo2);

    const inimigo3 = new InimigoLostSoul( scene, 50, 5, player, areaTrigger2, 10);
    inimigo3.object.position.set(-40, 21, -125);
    console.log("Inimigo criado na área 2:", inimigo3);
    gameController.addInimigoArea2(inimigo3);

    //box 3
    const box31 = new THREE.Mesh(boxGeometry4, box3Material);
    box31.position.set(120, 2, -150);
    box31.castShadow = true;
    chao.push(box31);
    paredes.push(box31);
    
    const box32 = new THREE.Mesh(boxGeometry5, box3Material);
    box32.position.set(155, 2, -165);
    box32.castShadow = true;
    chao.push(box32);
    paredes.push(box32);
    
    const box33 = new THREE.Mesh(boxGeometry6, box3Material);
    box33.position.set(185, 2, -150);
    box33.castShadow = true;
    chao.push(box33);
    paredes.push(box33);
    
    const escada3 = createEscada();
    escada3.position.set(155, 0, -100);
    escada3.rotation.y = Math.PI;
    
    //box4
    const box41 = new THREE.Mesh(boxGeometry7, box4Material);
    box41.position.set(-82.5, 2, 150);
    box41.castShadow = true;
    chao.push(box41);
    paredes.push(box41);
    
    const box42 = new THREE.Mesh(boxGeometry8, box4Material);
    box42.position.set(0, 2, 165);
    box42.castShadow = true;
    chao.push(box42);
    paredes.push(box42);
    
    const box43 = new THREE.Mesh(boxGeometry7, box4Material);
    box43.position.set(82.5, 2, 150);
    box43.castShadow = true;
    chao.push(box43);
    paredes.push(box43);
    
    const escada4 = createEscada();
    escada4.position.set(0, 0, 100);
    
    // Cria as rampas

    // const ramp2 = new THREE.Mesh(rampGeometry, wallMaterial);
    // ramp2.rotation.x = -Math.atan(10/4); 
    // ramp2.position.set(0, 2, -105); 
    // ramp2.visible = true;
    // chao.push(ramp2);

    const ramp3 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp3.rotation.x = -Math.atan(30/4); 
    ramp3.position.set(155, 2, -115); 
    ramp3.visible = false;
    chao.push(ramp3);

    const ramp4 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp4.rotation.y = Math.PI;
    ramp4.rotation.x = Math.atan(30/4);
    ramp4.position.set(0, 2, 115); 
    ramp4.visible = false;
    chao.push(ramp4);

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

    //Adiciona os objetos na cena
    scene.add(ground);
    scene.add(box1);
    scene.add(box2);
    // scene.add(box21);
    // scene.add(box22);
    // scene.add(box23);
    scene.add(box31);
    scene.add(box32);
    scene.add(box33);
    scene.add(box41);
    scene.add(box42);
    scene.add(box43);
    // scene.add(escada2);
    scene.add(escada3);
    scene.add(escada4);
    // scene.add(ramp2);
    scene.add(ramp3);
    scene.add(ramp4);
    scene.add(parede1);
    scene.add(parede2);    
    scene.add(parede3);
    scene.add(parede4);
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

export { inicializaCenario, getParedes, getChao, addChao, plataformaChave1, chave1Obj, porta, pilarChave, elevador, block15};