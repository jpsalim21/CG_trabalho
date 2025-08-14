import * as THREE from "three";
import { Chave } from './chave.js';
import { Elevador } from './elevador.js';
import { InimigoLostSoul } from '../personagens/inimigoLostSoul.js';
import { AreaTrigger } from './areaTrigger.js';
import { PlataformaChave} from './plataformaChave.js';
import { PortaArea } from "./portaArea.js";
import { GameController } from "../controller/gamecontroller.js";
import { Cacodemon } from "../personagens/inimigoCacodemon.js";
import { Zombieman } from "../personagens/zombieman.js";
import { setMaterial, createAdvancedMaterial, createLavaMaterial } from "../Mesh/extractor.js";
import { OBJLoader } from '../../../build/jsm/loaders/OBJLoader.js'; 
import { MTLLoader } from '../../../build/jsm/loaders/MTLLoader.js';

//texturas

const textureLoader = new THREE.TextureLoader();

const floorTexture = textureLoader.load('../../../assets/textures/granite.png');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

const brickTexture = textureLoader.load('../../../assets/textures/stone.jpg');
brickTexture.wrapS = THREE.RepeatWrapping;
brickTexture.wrapT = THREE.RepeatWrapping;
brickTexture.repeat.set(4, 2);

const cementTexture = textureLoader.load('../../../assets/textures/darkcement.jpg');
cementTexture.wrapS = THREE.RepeatWrapping;
cementTexture.wrapT = THREE.RepeatWrapping;
cementTexture.repeat.set(10, 10);

const asfaltoTexture = textureLoader.load('../../../assets/textures/asfalto.jpg');
asfaltoTexture.wrapS = THREE.RepeatWrapping;
asfaltoTexture.wrapT = THREE.RepeatWrapping;

const metalEscuroTexture = textureLoader.load('../../../assets/textures/metalescuro.jpg');
metalEscuroTexture.wrapS = THREE.RepeatWrapping;
metalEscuroTexture.wrapT = THREE.RepeatWrapping;

const metalTexturizadoTexture = textureLoader.load('../../../assets/textures/metaltexturizado.jpg');
metalTexturizadoTexture.wrapS = THREE.RepeatWrapping;
metalTexturizadoTexture.wrapT = THREE.RepeatWrapping;

const brick2Texture = textureLoader.load('../../../assets/textures/tijolos.jpg');
brick2Texture.wrapS = THREE.RepeatWrapping;
brick2Texture.wrapT = THREE.RepeatWrapping;
brick2Texture.repeat.set(2, 1);

const telhadoTexture = textureLoader.load('../../../assets/textures/telhado.jpg');
telhadoTexture.wrapS = THREE.RepeatWrapping;
telhadoTexture.wrapT = THREE.RepeatWrapping;
telhadoTexture.repeat.set(10, 10);

//materiais
const material = new THREE.MeshLambertMaterial({color:'rgb(37, 72, 45)'});
const planeMaterial = new THREE.MeshLambertMaterial({color:'rgb(58, 7, 7)'});
const box1Material = new THREE.MeshLambertMaterial({color: 'rgb(77, 155, 132)'});
const box2Material  = new THREE.MeshLambertMaterial({color:'rgb(155, 77, 77)'});
const box3Material  = new THREE.MeshLambertMaterial({color:'rgb(77, 132, 155)'});
const box4Material  = new THREE.MeshLambertMaterial({color:'rgb(132, 77, 155)'});
const wallMaterial  = new THREE.MeshLambertMaterial({color:'rgb(255, 255, 255)'});
const columnMaterial = new THREE.MeshLambertMaterial({color:'rgb(158, 158, 158)'});

const hangarMaterial = new THREE.MeshLambertMaterial({
    map: brick2Texture,
    side: THREE.DoubleSide 
});
const roofMaterial = new THREE.MeshLambertMaterial({
    map: telhadoTexture,
    side: THREE.DoubleSide
});
const hangarGateMaterial = new THREE.MeshLambertMaterial({
    map: metalEscuroTexture,
    side: THREE.DoubleSide
});
const floorMaterial = new THREE.MeshLambertMaterial({map: cementTexture});

//geometrias
const planeGeometry = new THREE.PlaneGeometry(500, 500); 
const boxGeometry1 = new THREE.BoxGeometry(10, 4, 100);
const boxGeometry2 = new THREE.BoxGeometry(30, 4, 70);
const boxGeometry3 = new THREE.BoxGeometry(60, 4, 100);
const boxGeometryArea3 = new THREE.BoxGeometry(100, 0.1, 100);
const boxGeometry7 = new THREE.BoxGeometry(135, 4, 100);
const boxGeometry8 = new THREE.BoxGeometry(30, 4, 70);
const boxGeometryA4 = new THREE.BoxGeometry(180, 4, 100, 100, 1, 50);
const boxGeometry9 = new THREE.BoxGeometry(50, 4, 100);
const boxGeometry10 = new THREE.BoxGeometry(10, 4, 90);
const boxGeometry11 = new THREE.BoxGeometry(40, 4, 100);
const rampGeometry = new THREE.PlaneGeometry(30, Math.sqrt(30 * 30 + 4 * 4));
const wallGeometry = new THREE.PlaneGeometry(520, 50);
const columnGeometry = new THREE.CylinderGeometry(2, 2, 20, 32, 10);
const topGeometry = new THREE.BoxGeometry(100, 2, 6);

const hangarWallGeometry = new THREE.BoxGeometry(100, 25, 2); 
const hangarBackWallGeometry = new THREE.BoxGeometry(100, 25, 2); 
const hangarRoofGeometry = new THREE.CylinderGeometry(49, 49, 100, 32, 1, false, Math.PI, Math.PI /2);
const hangarRoofGeometry2 = new THREE.CylinderGeometry(49, 49, 100, 32, 1, false, Math.PI / 2, Math.PI /2);
const hangarGateGeometry = new THREE.BoxGeometry(50, 25, 2); 
const ceilingGeometry = new THREE.BoxGeometry(100, 0.5, 98);

const chao = []; // array para armazenar os objetos do chão
const paredes = []; // array para armazenar as paredes

let plataformaChave1 = null;
let chave1Obj = null;
let plataformaChave2 = null;
let chave2Obj = null;
let plataformaChave3 = null;
let chave3Obj = null;
let porta = null;
let pilarChave = null;
let elevador = null;

function inicializaCenario(scene, player, renderer) {
    // Cria o céu
    createSkybox(scene);
    // cria o chão
    const ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    ground.receiveShadow = true;
    chao.push(ground); // adiciona o chão ao array de chão

    // área 1
    let a1 = createArea1(scene, player);
    scene.add(a1);
  
    // área 2
    let a2 = createArea2(scene, player);
    scene.add(a2);

    // box 3
    let a3 = createArea3(scene, player, renderer);
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
    // texturas
    var floor  = textureLoader.load('../../assets/textures/intertravado.jpg');
        floor.colorSpace = THREE.SRGBColorSpace;
        floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
        floor.repeat.set(100, 100);
    ground.material.map = floor;

    var wallTexture = textureLoader.load('./assets/textures/stonewall3.jpg');
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(20, 2);
    parede1.material.map = wallTexture;
    parede2.material.map = wallTexture;
    parede3.material.map = wallTexture;
    parede4.material.map = wallTexture;

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

    let materialPedra = createAdvancedMaterial('../../../assets/textures/displacement/', 'rockWall.jpg', 'rockWall_Normal.jpg', '', '', '', 1.66, 0.66);
    const box1 = new THREE.Object3D();
    const box11 = new THREE.Mesh(boxGeometry1, materialPedra);
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

    let materialLateral = createAdvancedMaterial('./assets/GreekPillar/', 
        'ao.jpg', 
        'normal.png', 
        '', 
        'dmap.png', 
        '', 
        0.5, 1, 
        {displacementScale: 1.0,
        metalness: 0.1,
        roughness: 0.8
    });

    let matCil = [
        materialLateral, // Textura dos lados
        setMaterial('./assets/intertravado.jpg', 1, 1),
        setMaterial('./assets/intertravado.jpg', 1, 1)
    ]
    const column = new THREE.Mesh(columnGeometry, matCil);

    for (let i = 0; i < 11; i++) {
        let column1 = column.clone();
        column1.position.set(-47 + i*9.36, 14, -46);
        column1.castShadow = true;
        box1.add(column1);
        paredes.push(column1);
    }
    let columnTop = new THREE.Mesh(topGeometry, columnMaterial);
    let column1Top = columnTop.clone();
    column1Top.position.set(0, 25, -48);
    column1Top.castShadow = true;
    box1.add(column1Top);
    for (let i = 10; i > 5; i--) {
        let column2 = column.clone();
        column2.position.set(-47, 14, 57 - i*9.2);
        column2.castShadow = true;
        box1.add(column2);
        paredes.push(column2);
    }
    let column2Top = columnTop.clone();
    column2Top.position.set(-47, 25, 0);
    column2Top.rotation.y = Math.PI / 2;
    column2Top.castShadow = true;
    box1.add(column2Top);
    for (let i = 0; i < 7; i++) {
        let column3 = column.clone();
        column3.position.set(47, 14, -37.24 + i*9.36);
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
    chave1Obj = new Chave(scene, player, 'vermelha');

    // plataforma da chave na área 1 - deve começar inativa
    plataformaChave1 = new PlataformaChave(scene, new THREE.Vector3(0, -2, 0), chave1Obj, player, false);
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
    //box2.add(block5);    
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

    // texturas
    // var textureLoader = new THREE.TextureLoader();

    // var metalWall = textureLoader.load('./assets/textures/metalparede.jpg');
    //     metalWall.colorSpace = THREE.SRGBColorSpace;
    //     metalWall.wrapS = metalWall.wrapT = THREE.RepeatWrapping;
    //     metalWall.repeat.set(1, 1);
    // box21.material = [metalWall, metalWall, , , metalWall, metalWall];
    // box22.material = [metalWall, metalWall, , , metalWall, metalWall];
    // box23.material = [metalWall, metalWall, , , metalWall, metalWall];


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
    chave2Obj = new Chave(scene, player, 'amarela');

    // plataforma da chave na área 2 - deve começar inativa
    plataformaChave2 = new PlataformaChave(scene, new THREE.Vector3(0, -2, 15), chave2Obj, player, false);
    plataformaChave2.plataforma.add(block5);
    block5.position.set(0, 18, 0);
    box2.add(plataformaChave2.plataforma);
    paredes.push(plataformaChave2.plataforma);
    chao.push(plataformaChave2.plataforma);

    // texturas
    let material1 = [
        setMaterial('./assets/textures/metalparede.jpg', 8, 1),
        setMaterial('./assets/textures/metalparede.jpg', 8, 1),
        setMaterial('./assets/textures/metalchao.jpg', 2, 5),
        setMaterial('./assets/textures/metalchao.jpg', 2, 5),
        setMaterial('./assets/textures/metalparede.jpg', 5, 1),
        setMaterial('./assets/textures/metalparede.jpg', 5, 1)];

    box21.material = material1;
    box23.material = material1;

    let material2 = [
        setMaterial('./assets/textures/metalparede.jpg', 5, 1),
        setMaterial('./assets/textures/metalparede.jpg', 5, 1),
        setMaterial('./assets/textures/metalchao.jpg', 2/3, 4),
        setMaterial('./assets/textures/metalchao.jpg', 2/3, 4),
        setMaterial('./assets/textures/metalparede.jpg', 1, 1),
        setMaterial('./assets/textures/metalparede.jpg', 1, 1)];

    box22.material = material2;

    let materialBlocos = [
        setMaterial('./assets/textures/metalbloco.jpg', 0.13, 1.5),
        setMaterial('./assets/textures/metalbloco.jpg', 0.13, 1.5),
        setMaterial('./assets/textures/metalbloco.jpg', 0.13, 0.1),
        setMaterial('./assets/textures/metalbloco.jpg', 0.13, 0.1),
        setMaterial('./assets/textures/metalbloco.jpg', 0.13, 1.5),
        setMaterial('./assets/textures/metalbloco.jpg', 0.13, 1.5)];
    block1.material = materialBlocos;
    block2.material = materialBlocos;
    block3.material = materialBlocos;
    block4.material = materialBlocos;
    block5.material = materialBlocos;
    block6.material = materialBlocos;
    block7.material = materialBlocos;
    block8.material = materialBlocos;
    block9.material = materialBlocos;
    block10.material = materialBlocos;
    block11.material = materialBlocos;
    block12.material = materialBlocos;
    block13.material = materialBlocos;
    block14.material = materialBlocos;

    porta.material = setMaterial('./assets/textures/metalporta.jpg', 1, 0.5);

    return box2;
}

function createArea3(scene, player, renderer){
    const chaoArea3 = new THREE.Mesh(boxGeometryArea3, floorMaterial);
    chaoArea3.position.set(150, 0.1, -150);
    chaoArea3.receiveShadow = true;
    chao.push(chaoArea3);
    scene.add(chaoArea3);

    const hangar = createHangar(scene, player, renderer);
    hangar.position.set(150, 0, -150); // posição da área 3
    scene.add(hangar);

    // Criar a chave azul e sua plataforma no hangar
    chave3Obj = new Chave(scene, player, 'azul');
    
    // Criar a plataforma para a chave azul posicionada no hangar
    // Passar false como último parâmetro para que comece inativa e 2.5 para altura menor
    plataformaChave3 = new PlataformaChave(scene, new THREE.Vector3(0, -2, 30), chave3Obj, player, false, 1.6);
    
    hangar.add(plataformaChave3.plataforma);
    paredes.push(plataformaChave3.plataforma);
    chao.push(plataformaChave3.plataforma);
    
    // Disponibilizar globalmente para o GameController
    window.plataformaChave3 = plataformaChave3;

    function createHangar(scene, player, renderer) {
        const hangar = new THREE.Object3D();

        const hangarPosition = new THREE.Vector3(150, 0, -150);
        hangar.position.copy(hangarPosition);
        
        // Planos de corte para os portões do hangar
        
        const leftClipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -100);  
        const rightClipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 200);

        const hangarGateMaterialClipped = hangarGateMaterial.clone();
        hangarGateMaterialClipped.clippingPlanes = [leftClipPlane, rightClipPlane];
        hangarGateMaterialClipped.clipIntersection = false; 
        
        // geometria para paredes estendidas 
        const extendedWallGeometry = new THREE.BoxGeometry(120, 40, 4); // mais larga, mais alta, mais grossa

        // Parede esquerda
        const wallLeft = new THREE.Mesh(hangarWallGeometry, hangarMaterial);
        wallLeft.position.set(-50, 12.5, 0);
        wallLeft.rotation.y = Math.PI / 2;
        wallLeft.castShadow = true;
        wallLeft.receiveShadow = true;
        hangar.add(wallLeft);
        paredes.push(wallLeft);

        // Parede esquerda estendida para cobrir completamente
        const extendedWallLeft = new THREE.Mesh(extendedWallGeometry, hangarMaterial);
        extendedWallLeft.position.set(-52, 20, 0); // um pouco mais para fora
        extendedWallLeft.rotation.y = Math.PI / 2;
        extendedWallLeft.castShadow = false; // não projeta sombra para evitar linhas no teto
        extendedWallLeft.receiveShadow = false;
        extendedWallLeft.visible = false; // invisível mas funcional
        hangar.add(extendedWallLeft);

        // Parede direita
        const wallRight = new THREE.Mesh(hangarWallGeometry, hangarMaterial);
        wallRight.position.set(50, 12.5, 0);
        wallRight.rotation.y = Math.PI / 2;
        wallRight.castShadow = true;
        wallRight.receiveShadow = true;
        hangar.add(wallRight);
        paredes.push(wallRight);

        // Parede direita estendida para cobrir completamente (solução do vazamento)
        const extendedWallRight = new THREE.Mesh(extendedWallGeometry, hangarMaterial);
        extendedWallRight.position.set(52, 20, 0); // um pouco mais para fora
        extendedWallRight.rotation.y = Math.PI / 2;
        extendedWallRight.castShadow = false; // não projeta sombra para evitar linhas no teto
        extendedWallRight.receiveShadow = false;
        extendedWallRight.visible = false; // invisível mas funcional
        hangar.add(extendedWallRight);

        // Parede de trás
        const wallBack = new THREE.Mesh(hangarBackWallGeometry, hangarMaterial);
        wallBack.position.set(0, 12.5, -49);
        wallBack.castShadow = true;
        wallBack.receiveShadow = true;
        hangar.add(wallBack);
        paredes.push(wallBack);

        // Parede de trás estendida para cobrir completamente
        const extendedWallBack = new THREE.Mesh(extendedWallGeometry, hangarMaterial);
        extendedWallBack.position.set(0, 20, -52); // mais para trás e mais alta
        extendedWallBack.castShadow = false; // não projeta sombra para evitar linhas no teto
        extendedWallBack.receiveShadow = false;
        extendedWallBack.visible = false; // invisível mas funcional
        hangar.add(extendedWallBack);

        // Paredes auxiliares mais altas para evitar vazamentos nas junções com o teto
        const tallWallGeometry = new THREE.BoxGeometry(100, 30, 2); // 5 unidades mais alta
        
        const tallWallLeft = new THREE.Mesh(tallWallGeometry, hangarMaterial);
        tallWallLeft.position.set(-50, 15, 0); 
        tallWallLeft.rotation.y = Math.PI / 2;
        tallWallLeft.castShadow = false; 
        tallWallLeft.visible = false; 
        hangar.add(tallWallLeft);

        const tallWallRight = new THREE.Mesh(tallWallGeometry, hangarMaterial);
        tallWallRight.position.set(50, 15, 0);
        tallWallRight.rotation.y = Math.PI / 2;
        tallWallRight.castShadow = false;
        tallWallRight.visible = false; 
        hangar.add(tallWallRight);

        const tallWallBack = new THREE.Mesh(tallWallGeometry, hangarMaterial);
        tallWallBack.position.set(0, 15, -49);
        tallWallBack.castShadow = false;
        tallWallBack.visible = false;
        hangar.add(tallWallBack);
        
        const roof = new THREE.Mesh(hangarRoofGeometry, roofMaterial);
        roof.position.set(0, 25, 0);
        roof.rotation.x = Math.PI / 2;  
        roof.rotation.z = Math.PI;
        roof.castShadow = true;
        roof.receiveShadow = true;
        hangar.add(roof);

        const roof2 = new THREE.Mesh(hangarRoofGeometry2, roofMaterial);
        roof2.position.set(0, 25, 0);
        roof2.rotation.x = Math.PI / 2;  
        roof2.rotation.z = Math.PI;
        roof2.castShadow = true;
        roof2.receiveShadow = true;
        hangar.add(roof2);

        const mainCeilingGeometry = new THREE.PlaneGeometry(102, 102); 
        const mainCeiling = new THREE.Mesh(mainCeilingGeometry, roofMaterial);
        mainCeiling.position.set(0, 25.1, 0); 
        mainCeiling.rotation.x = -Math.PI / 2; 
        mainCeiling.castShadow = true;
        //mainCeiling.receiveShadow = true;
        hangar.add(mainCeiling);

        // tetos adicionais nas bordas para garantir cobertura total
        const edgeCeilingGeometry = new THREE.PlaneGeometry(104, 104);
        const edgeCeiling = new THREE.Mesh(edgeCeilingGeometry, roofMaterial);
        edgeCeiling.position.set(0, 24.9, 0); 
        edgeCeiling.rotation.x = -Math.PI / 2;
        edgeCeiling.castShadow = true;
        edgeCeiling.receiveShadow = true;
        hangar.add(edgeCeiling);

        // painéis laterais do teto para conectar com as paredes
        const sideCeilingGeometry = new THREE.BoxGeometry(100, 2, 100);
        const sideCeiling = new THREE.Mesh(sideCeilingGeometry, roofMaterial);
        sideCeiling.position.set(0, 26, 0); // acima do teto principal
        sideCeiling.castShadow = true;
        sideCeiling.receiveShadow = true;
        hangar.add(sideCeiling);
        
        console.log("Sistema de bloqueio de luz implementado");

        // Portão 
        const gateLeft = new THREE.Mesh(hangarGateGeometry, hangarGateMaterialClipped);
        gateLeft.position.set(-24, 12.5, 48.5);
        gateLeft.castShadow = true;
        gateLeft.receiveShadow = true;
        hangar.add(gateLeft);
        paredes.push(gateLeft);

        const gateRight = new THREE.Mesh(hangarGateGeometry, hangarGateMaterialClipped);
        gateRight.position.set(24, 12.5, 48.5);
        gateRight.castShadow = true;
        gateRight.receiveShadow = true;
        hangar.add(gateRight);
        paredes.push(gateRight);

    
        loadPlaneInHangar(hangar);

        addZombiemen(scene, player);

        // Trigger para controle de iluminação do hangar
        const hangarLightingTrigger = {
            position: new THREE.Vector3(150, 12, -150), // centro do hangar
            size: new THREE.Vector3(90, 25, 90), // área do hangar
            bb: new THREE.Box3(
                new THREE.Vector3(150 - 45, 0, -150 - 45),
                new THREE.Vector3(150 + 45, 25, -150 + 45)
            ),
            playerInside: false,
            
            update: function() {
                const playerInside = this.bb.intersectsBox(player.bb);
                
                if (playerInside && !this.playerInside) {
                    // jogador entrou no hangar
                    this.playerInside = true;
                    if (window.lightingController) {
                        window.lightingController.enterHangar();
                    }
                } else if (!playerInside && this.playerInside) {
                    // jogador saiu do hangar
                    this.playerInside = false;
                    if (window.lightingController) {
                        window.lightingController.exitHangar();
                    }
                }
            }
        };

        const triggerPosition = new THREE.Vector3(150, 1, -60); 
        const triggerSize = new THREE.Vector3(60, 10, 50); 

        const gateTrigger = {
            position: triggerPosition,
            size: triggerSize,
            bb: new THREE.Box3(
                new THREE.Vector3(triggerPosition.x - triggerSize.x / 2, triggerPosition.y - triggerSize.y / 2, triggerPosition.z - triggerSize.z / 2),
                new THREE.Vector3(triggerPosition.x + triggerSize.x / 2, triggerPosition.y + triggerSize.y / 2, triggerPosition.z + triggerSize.z / 2)
            ),
            triggered: false,
            
            update: function() {
                if (!this.triggered && this.bb.intersectsBox(player.bb)) {
                    // verificar se o jogador possui a chave amarela
                    if (GameController.instance && GameController.instance.chave2) {
                        console.log("TRIGGER ATIVADO! Jogador entrou na área do hangar com a chave amarela!");
                        console.log("Posição do jogador:", player.cameraHolder.position);
                        console.log("Bounding box do trigger:", this.bb);
                        this.triggered = true;
                        openHangarGate(gateLeft, gateRight, renderer);
                        showTemporaryMessage("Chave amarela detectada! Portão do hangar aberto.", 3000);
                    } else {
                        console.log("Jogador tentou entrar no hangar sem a chave amarela!");
                        //showTemporaryMessage("Você precisa da chave amarela para abrir o portão do hangar!", 3000);
                    }
                }
            }
        };

        
        // O trigger será verificado através de outro sistema
        /*
        const originalRender = gateTrigger.update;
        function renderTrigger() {
            originalRender.call(gateTrigger);
            requestAnimationFrame(renderTrigger);
        }
        renderTrigger();
        */

        // Solução alternativa: Adicionar os triggers ao array de objetos que são verificados regularmente
        if (!window.gameUpdateCallbacks) {
            window.gameUpdateCallbacks = [];
        }
        window.gameUpdateCallbacks.push(() => gateTrigger.update());
        window.gameUpdateCallbacks.push(() => hangarLightingTrigger.update());

        console.log("Trigger do hangar criado na posição:", triggerPosition);
        console.log("Bounding box do trigger:", gateTrigger.bb);
        console.log("Trigger de iluminação do hangar criado");
        console.log("Bounding box do trigger de iluminação:", hangarLightingTrigger.bb);

        return hangar;
    }

    function openHangarGate(gateLeft, gateRight, renderer) {
        console.log("Função openHangarGate chamada!");
        const duration = 15000; 

    
        const gateWidth = hangarGateGeometry.parameters.width; 
    
        const targetPositionLeft = -70; 
        const targetPositionRight = 70;

        const startPositionLeft = gateLeft.position.x;
        const startPositionRight = gateRight.position.x;
        const startTime = Date.now();

        function animateGate() {
            const elapsed = Date.now() - startTime;
            let progress = Math.min(elapsed / duration, 1);

            gateLeft.position.x = startPositionLeft + (targetPositionLeft - startPositionLeft) * progress;
            gateRight.position.x = startPositionRight + (targetPositionRight - startPositionRight) * progress;

            if (progress < 1) {
                requestAnimationFrame(animateGate);
            } else {
                gateLeft.position.x = targetPositionLeft;
                gateRight.position.x = targetPositionRight;

                console.log("Portão do hangar aberto!");
                
                const indexLeft = paredes.indexOf(gateLeft);
                if (indexLeft > -1) paredes.splice(indexLeft, 1);
                
                const indexRight = paredes.indexOf(gateRight);
                if (indexRight > -1) paredes.splice(indexRight, 1);
            }
        }

        requestAnimationFrame(animateGate);
    }

    function loadPlaneInHangar(hangar) {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('../assets/objects/');
        mtlLoader.load('plane.mtl', function (materials) {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('../assets/objects/');
            objLoader.load('plane.obj', function (obj) {
                obj.visible = true;
                obj.name = 'hangarPlane';
                
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                    }
                });

                const scale = getMaxSize(obj); 
                const desiredScale = 45; 
                obj.scale.set(
                    desiredScale * (1.0/scale),
                    desiredScale * (1.0/scale),
                    desiredScale * (1.0/scale)
                );

                obj.position.set(0, 0, -10); 
                
                obj.rotation.y = -1; 

                const box = new THREE.Box3().setFromObject(obj);
                if (box.min.y > 0) {
                    obj.translateY(-box.min.y);
                } else {
                    obj.translateY(-1 * box.min.y);
                }

                console.log("Avião carregado no hangar!");
                hangar.add(obj); 
                
                addPlaneCollision(obj);
            }, 
            
            function (progress) {
                console.log('Carregando avião:', (progress.loaded / progress.total * 100) + '%');
            },
        
            function (error) {
                console.error('Erro ao carregar o avião:', error);
            });
        },
        
        function (progress) {
            console.log('Carregando materiais do avião:', (progress.loaded / progress.total * 100) + '%');
        },

        function (error) {
            console.error('Erro ao carregar materiais do avião:', error);
        });
    }


    function getMaxSize(obj) {
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        return Math.max(size.x, size.y, size.z);
    }

    function addPlaneCollision(planeObj) {
        const box = new THREE.Box3().setFromObject(planeObj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log("Bounding box do avião:", {
            size: size,
            center: center,
            planePosition: planeObj.position
        });
        
        const collisionGeometry = new THREE.BoxGeometry(
            size.x * 0.4, 
            size.y * 0.8, 
            size.z * 0.4  
        );
        
        // descomentando tem um auxilio visual
        const collisionMaterial = new THREE.MeshBasicMaterial({ 
            // color: 0xff0000,
            // transparent: true, 
            // opacity: 0.3,
            // wireframe: true
            visible: false
        });
        
        const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        
        const worldPosition = new THREE.Vector3();
        planeObj.getWorldPosition(worldPosition);
        collisionMesh.position.copy(worldPosition);
        
        collisionMesh.name = 'planeCollision';
        
        // para que seja detectado nas colisões
        paredes.push(collisionMesh);
        
        planeObj.parent.parent.add(collisionMesh); // parent.parent porque o avião está no hangar que está na cena
        
        console.log("Colisão do avião adicionada:", {
            worldPosition: worldPosition,
            collisionPosition: collisionMesh.position,
            paredesLength: paredes.length
        });
    }

    function addZombiemen(scene, player) {
        const numZombiemen = 8;
        const hangarCenter = new THREE.Vector3(150, 0, -150);
        const spawnAreaSize = 85;

        const hangarTrigger = new AreaTrigger(scene, hangarCenter, new THREE.Vector3(100, 25, 100), player);

        const planeExclusionCenter = new THREE.Vector3(150, 0, -160); // posição aproximada do avião
        const planeExclusionRadius = 25; // raio de exclusão ao redor do avião

        for (let i = 0; i < numZombiemen; i++) {
            let spawnPosition;
            let attempts = 0;
            const maxAttempts = 50;

            // tenta encontrar uma posição válida que não esteja muito perto do avião
            do {
                const x = hangarCenter.x + (Math.random() - 0.5) * spawnAreaSize;
                const z = hangarCenter.z + (Math.random() - 0.5) * spawnAreaSize;
                spawnPosition = new THREE.Vector3(x, 0, z);
                attempts++;
                
                // verifica se a posição está longe o suficiente do avião
                const distanceToPlane = spawnPosition.distanceTo(planeExclusionCenter);
                if (distanceToPlane > planeExclusionRadius) {
                    break; // posição válida encontrada
                }
                
            } while (attempts < maxAttempts);
            
            // se não encontrou uma posição válida após muitas tentativas, usa uma posição padrão segura
            if (attempts >= maxAttempts) {
                const angle = (i / numZombiemen) * Math.PI * 2;
                const radius = 30;
                spawnPosition = new THREE.Vector3(
                    hangarCenter.x + Math.cos(angle) * radius,
                    0,
                    hangarCenter.z + Math.sin(angle) * radius
                );
            }

            const zombieman = new Zombieman(scene, player, spawnPosition, hangarTrigger);
            
            // Registrar o zombieman na área 3 do GameController
            GameController.instance.addInimigoArea3(zombieman);
            
        }
    }
}

function createArea4(scene, player){
    const box4 = new THREE.Object3D();

    let materialTeste = createLavaMaterial(10, 10, {emissiveIntensity: 3.0, displacementScale: 0.8});
    let materials = [
        box4Material,
        box4Material,
        materialTeste,
        box4Material,
        box4Material,
        box4Material
    ]

    const box41 = new THREE.Mesh(boxGeometryA4, materials);
    box41.position.set(0, 2, 150);
    box41.castShadow = true;
    box4.add(box41);
    chao.push(box41);
    paredes.push(box41);
    /*
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
    paredes.push(box43); */
    
    const escada4 = createEscada();
    escada4.position.set(0, 0, 70);
    box4.add(escada4);

    
    // Cria as rampas


    const ramp4 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp4.rotation.y = Math.PI;
    ramp4.rotation.x = Math.atan(30/4);
    ramp4.position.set(0, 2, 85); 
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

    // Adiciona um delay para garantir que tudo esteja inicializado antes de criar os inimigos
    //setTimeout(() => {
        const inimigo1 = new Cacodemon(scene, player, areaTrigger2, 10, new THREE.Vector3(0, 45, -135));
        console.log("Inimigo criado na área 2:", inimigo1);
        GameController.instance.addInimigoArea2(inimigo1);
        
        const inimigo2 = new Cacodemon(scene, player, areaTrigger2, 10, new THREE.Vector3(20, 45, -185));
        console.log("Inimigo criado na área 2:", inimigo2);
        GameController.instance.addInimigoArea2(inimigo2);
        
        const inimigo3 = new Cacodemon(scene, player, areaTrigger2, 10, new THREE.Vector3(-40, 45, -125));
        console.log("Inimigo criado na área 2:", inimigo3);
        GameController.instance.addInimigoArea2(inimigo3);
    //}, 100); // 100ms de delay
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

export { inicializaCenario, getParedes, getChao, addChao, addParedes, plataformaChave1, chave1Obj, plataformaChave2, chave2Obj, plataformaChave3, chave3Obj, porta, pilarChave, elevador};