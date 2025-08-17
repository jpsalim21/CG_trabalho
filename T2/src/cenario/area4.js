import * as THREE from 'three';
import { loadChessPiece, setMaterial, createLavaMaterial } from '../Mesh/extractor.js';
import { addChao, addParedes } from './cenario.js';
import { portaA4 } from './portaArea4.js';
import { ParedeA4 } from './paredesA4.js';
import { PainElemental } from '../personagens/inimigoPainElemental.js';
import { Cacodemon } from '../personagens/inimigoCacodemon.js';
import { AreaTrigger } from './areaTrigger.js';

let painElemental;
let cacodemons = [];
let areaTrigger;
let portal;
let portalOpen = false;
let gameEnded = false;
let victoryScreen;
let restartButton;

const boxGeometry = new THREE.BoxGeometry(200, 4, 200, 50, 1, 50);

const baseGeo = new THREE.CylinderGeometry(3, 3, 2);

const tamQuadrado = -25;
const posEsquerda = 87.5;

let piecesMeshWhite = {};
let piecesMeshBlack = {};
const collisionGeo = new THREE.BoxGeometry(3.5, 6, 3.5);

let whitePawnsPositions = [
    new THREE.Vector3(posEsquerda + tamQuadrado, 2, posEsquerda),
    new THREE.Vector3(posEsquerda + 2 * tamQuadrado, 2, posEsquerda + tamQuadrado),
    new THREE.Vector3(posEsquerda + tamQuadrado, 2, posEsquerda + 3 * tamQuadrado),
    new THREE.Vector3(posEsquerda + 2 * tamQuadrado, 2, posEsquerda + 4 * tamQuadrado),
    new THREE.Vector3(posEsquerda + tamQuadrado, 2, posEsquerda + 5 * tamQuadrado),
    new THREE.Vector3(posEsquerda + tamQuadrado, 2, posEsquerda + 6 * tamQuadrado),
    new THREE.Vector3(posEsquerda + tamQuadrado, 2, posEsquerda + 7 * tamQuadrado),
];
let blackPawnsPositions = [
    new THREE.Vector3(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 2 * tamQuadrado),
    new THREE.Vector3(posEsquerda + 3 * tamQuadrado, 2, posEsquerda + 4 * tamQuadrado),
    new THREE.Vector3(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 5 * tamQuadrado),
    new THREE.Vector3(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 7 * tamQuadrado)
];


function createChessBoard(scene, player, chave){
    const texLoader = new THREE.TextureLoader();

    const tabuleiroMaterial = setMaterial('./assets/xadrez/xadrez2.png', 4, 4);
    const materialLado = setMaterial('./assets/textures/metalparede.jpg', 8, 1);
    tabuleiroMaterial.colorSpace = THREE.SRGBColorSpace;
    tabuleiroMaterial.normalMap = texLoader.load('./assets/xadrez/xadreznormal.jpg');
    tabuleiroMaterial.normalMap.wrapS = tabuleiroMaterial.normalMap.wrapT = THREE.RepeatWrapping;
    tabuleiroMaterial.normalMap.repeat.set(4/3, 4/3);
    tabuleiroMaterial.displacementMap = texLoader.load('./assets/xadrez/height.png');
    tabuleiroMaterial.displacementScale = 1.0;
    tabuleiroMaterial.displacementMap.wrapS = tabuleiroMaterial.displacementMap.wrapT = THREE.RepeatWrapping;
    tabuleiroMaterial.displacementMap.repeat.set(4/3, 4/3);

    const materiais = [
        materialLado,
        materialLado,
        tabuleiroMaterial,
        materialLado,
        materialLado,
        materialLado
    ];
    const boxMesh = new THREE.Mesh(boxGeometry, materiais);
    boxMesh.position.set(0, 2, 150);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    addChao(boxMesh);
    addParedes(boxMesh);
    scene.add(boxMesh);

    loadPieces(boxMesh);

    let paredes = new ParedeA4(scene, player);

    let porta = new portaA4(scene, new THREE.Vector3(30, 0.8, 30), player, chave, paredes);
    addParedes(porta.mesh);
    addChao(porta.mesh);

    criaBases(scene);

    // tela de vitória
    victoryScreen = document.getElementById("victory-screen");
    restartButton = document.getElementById("restart-btn");
        
    // botão de reinício
    restartButton.addEventListener("click", () => {
        player.reiniciarJogo();
    }, false);

    adicionarInimigos(scene, player);
}

async function loadPieces(pai){
    const pieceNames = ['King', 'Queen', 'Bishop', 'Knight', 'Rook', 'Pawn'];
    for (const name of pieceNames) {
        piecesMeshBlack[name] = await loadChessPiece(`./assets/xadrez/${name}.glb`, 'rgba(60, 60, 60, 1)');
        piecesMeshBlack[name].scale.set(2, 2, 2);
        piecesMeshBlack[name].castShadow = true;
        piecesMeshWhite[name] = await loadChessPiece(`./assets/xadrez/${name}.glb`, 'rgba(200, 200, 200, 1)');
        piecesMeshWhite[name].scale.set(2, 2, 2);
        piecesMeshWhite[name].castShadow = true;
    }
    arrangePieces(pai);
}

function arrangePieces(pai){
    let kw, kb, qw, qb, bw1, bb1, bb2, nb1, nb2, rw1, rw2, rb1, rb2;
    kw = piecesMeshWhite['King'];
    kw.scale.set(2.1, 2.1, 2.1);
    kb = piecesMeshBlack['King'];
    qw = piecesMeshWhite['Queen'];
    qb = piecesMeshBlack['Queen'];
    piecesMeshWhite['Bishop'].scale.set(1.8, 1.8, 1.8);
    piecesMeshBlack['Bishop'].scale.set(1.8, 1.8, 1.8);
    bw1 = piecesMeshWhite['Bishop'].clone();
    bb1 = piecesMeshBlack['Bishop'].clone();
    bb2 = piecesMeshBlack['Bishop'];
    nb1 = piecesMeshBlack['Knight'].clone();
    nb2 = piecesMeshBlack['Knight'];
    rb1 = piecesMeshBlack['Rook'].clone();
    rb2 = piecesMeshBlack['Rook'];
    rw1 = piecesMeshWhite['Rook'].clone();
    rw2 = piecesMeshWhite['Rook'];
    pai.add(kw);
    pai.add(kb);
    pai.add(qw);
    pai.add(qb);
    pai.add(bw1);
    pai.add(bb1);
    pai.add(bb2);
    pai.add(nb1);
    pai.add(nb2);
    pai.add(rb1);
    pai.add(rb2);
    pai.add(rw1);
    pai.add(rw2);

    // Colisão
    const collisionMesh = new THREE.Mesh(collisionGeo, new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }));
    collisionMesh.visible = false;
    collisionMesh.castShadow = true;
    let cClones = []
    let c1 = collisionMesh.clone();
    kw.add(c1);
    c1.position.set(0, 3, 0);
    let c2 = collisionMesh.clone();
    kb.add(c2);
    c2.position.set(0, 3, 0);
    let c3 = collisionMesh.clone();
    qw.add(c3);
    c3.position.set(0, 3, 0);
    let c4 = collisionMesh.clone();
    qb.add(c4);
    c4.position.set(0, 3, 0);
    let c5 = collisionMesh.clone();
    bw1.add(c5);
    c5.position.set(0, 3, 0);
    let c6 = collisionMesh.clone();
    bb1.add(c6);
    c6.position.set(0, 3, 0);
    let c7 = collisionMesh.clone();
    bb2.add(c7);
    c7.position.set(0, 3, 0);
    let c8 = collisionMesh.clone();
    nb1.add(c8);
    c8.position.set(0, 3, 0);
    let c9 = collisionMesh.clone();
    nb2.add(c9);
    c9.position.set(0, 3, 0);
    let c10 = collisionMesh.clone();
    rb1.add(c10);
    c10.position.set(0, 3, 0);
    let c11 = collisionMesh.clone();
    rb2.add(c11);
    c11.position.set(0, 3, 0);
    let c12 = collisionMesh.clone();
    rw1.add(c12);
    c12.position.set(0, 3, 0);
    let c13 = collisionMesh.clone();
    rw2.add(c13);
    c13.position.set(0, 3, 0);
    cClones.push(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13);
    for(let i = 0; i < cClones.length; i++) {
        addParedes(cClones[i]);
    }

    // White pieces positions
    kw.position.set(87.5, 2, -62.5);
    rw1.position.set(87.5, 2, -37.5);
    rw2.position.set(87.5, 2, 87.5);
    bw1.position.set(posEsquerda + tamQuadrado, 2, posEsquerda + tamQuadrado);
    qw.position.set(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 6 * tamQuadrado);

    //Black pieces positions
    kb.position.set(posEsquerda + 7 * tamQuadrado, 5, posEsquerda + 6 * tamQuadrado);
    kb.rotation.z = 0.2; // Inverte a rotação do rei preto
    kb.rotation.x = Math.PI / 2 * 1.05; // Inverte a rotação do rei preto
    qb.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    bb1.position.set(posEsquerda + 2 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    bb2.position.set(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 4 * tamQuadrado);
    nb1.position.set(posEsquerda + 5 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    nb2.position.set(posEsquerda + 4 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    rb1.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 5 * tamQuadrado);
    rb2.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 0 * tamQuadrado);

    nb1.rotation.y = Math.PI / 2; // 90 graus em radianos
    nb2.rotation.y = Math.PI / 2; // 90 graus em radianos

    let colPawns = [];
    // White pawns positions
    for (let i = 0; i < whitePawnsPositions.length; i++) {
        const pawn = piecesMeshWhite['Pawn'].clone();
        pawn.position.copy(whitePawnsPositions[i]);
        let c = collisionMesh.clone();
        pawn.add(c);
        c.position.set(0, 3, 0);
        colPawns.push(c);
        pai.add(pawn);
    }

    // Black pawns positions
    for (let i = 0; i < blackPawnsPositions.length; i++) {
        const pawn = piecesMeshBlack['Pawn'].clone();
        pawn.position.copy(blackPawnsPositions[i]);
        let c = collisionMesh.clone();
        pawn.add(c);
        c.position.set(0, 3, 0);
        colPawns.push(c);
        pai.add(pawn);
    }

    for (let i = 0; i < colPawns.length; i++) {
        addParedes(colPawns[i]);
    }

}

function criaBases(scene){
    const texLoader = new THREE.TextureLoader();
    let materialLava = setMaterial('./assets/LavaTexture/basecolor.png', 2, 2);
    materialLava.colorSpace = THREE.SRGBColorSpace;
    materialLava.normalMap = texLoader.load('./assets/LavaTexture/normal.png');
    materialLava.emissiveMap = texLoader.load('./assets/LavaTexture/emissive.png');
    materialLava.emissiveIntensity = 4;
    const materialLado = setMaterial('../../../assets/textures/displacement/rockWall.jpg', 8, 1);
    let base = new THREE.Mesh(baseGeo, [materialLado, materialLava, materialLava]);
    base.position.set(0, 5, 200);
    scene.add(base);
    addChao(base);
    addParedes(base);

    let b2 = base.clone();
    b2.position.set(20, 5, 160);
    scene.add(b2);
    addChao(b2);
    addParedes(b2);

    let b3 = base.clone();
    b3.position.set(70, 5, 140);
    scene.add(b3);
    addChao(b3);
    addParedes(b3);

    let b4 = base.clone();
    b4.position.set(-70, 5, 120);
    scene.add(b4);
    addChao(b4);
    addParedes(b4);

    let b5 = base.clone();
    b5.position.set(-40, 5, 100);
    scene.add(b5);
    addChao(b5);
    addParedes(b5);

}

function adicionarInimigos(scene, player){
    areaTrigger = new AreaTrigger(scene, new THREE.Vector3(0, 2, 150), new THREE.Vector3(200, 10, 200), player);

    painElemental = new PainElemental(scene, player, areaTrigger, 10, new THREE.Vector3(0, 10, 200));
    
    cacodemons.push(new Cacodemon(scene, player, areaTrigger, 10, new THREE.Vector3(20, 10, 160)));
    cacodemons.push(new Cacodemon(scene, player, areaTrigger, 10, new THREE.Vector3(70, 10, 140)));
    cacodemons.push(new Cacodemon(scene, player, areaTrigger, 10, new THREE.Vector3(-70, 10, 120)));
    cacodemons.push(new Cacodemon(scene, player, areaTrigger, 10, new THREE.Vector3(-40, 10, 120)));

    // Verificar inimigos periodicamente
    setInterval(verificarInimigos, 1000, scene, player);
}

function verificarInimigos(scene, player) {
    if (portalOpen || gameEnded) return;

    let painDerrotados = !painElemental || painElemental.vida <= 0;
    let cacodemonsDerrotados = cacodemons.every(c => !c || c.vida <= 0);
    painDerrotados = true;
    if (painDerrotados && cacodemonsDerrotados) {
        criaPortal(scene, player);
        portalOpen = true;
        showTemporaryMessage("Todos os inimigos derrotados! O portal de saída foi aberto.", 5000);
    }
}

function criaPortal(scene, player) {
    const portalPos = new THREE.Vector3(0, 9, 245);
    const portalGeometry = new THREE.BoxGeometry(15, 10, 1);
    const portalMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.copy(portalPos);
    
    const edges = new THREE.EdgesGeometry(portalGeometry);
    const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
    );
    portal.add(line);
    scene.add(portal);
    
    // trigger pra quando o jogador entrar
    const portalTrigger = {
        bb: new THREE.Box3(
            new THREE.Vector3(portalPos.x - 7.5, portalPos.y - 5, portalPos.z - 0.5),
            new THREE.Vector3(portalPos.x + 7.5, portalPos.y + 5, portalPos.z + 0.5)
        ),
        update: function() {
            if (this.bb.intersectsBox(player.bb) && !gameEnded) {
                gameEnded = true;

                player.disableControls();
                player.mira.style.display = "none";
                player.blocker.style.display = "none"
                player.instructions.style.display = "none";
                victoryScreen.style.display = "flex";
            }
        }
    };
    
    if (!window.gameUpdateCallbacks) {
        window.gameUpdateCallbacks = [];
    }
    window.gameUpdateCallbacks.push(() => portalTrigger.update());
}

export { createChessBoard };