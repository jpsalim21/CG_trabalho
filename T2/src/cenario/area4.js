import * as THREE from 'three';
import { loadChessPiece, setMaterial } from '../Mesh/extractor.js';
import { addChao, addParedes } from './cenario.js';

const boxGeometry = new THREE.BoxGeometry(200, 4, 200);

let piecesMeshWhite = {};
let piecesMeshBlack = {};

let whitePawnsPositions = [];
let blackPawnsPositions = [];

const tamQuadrado = -25;
const posEsquerda = 87.5;

function createChessBoard(scene){
    const tabuleiroMaterial = setMaterial('./assets/xadrez/xadrez2.png', 4, 4);
    const boxMesh = new THREE.Mesh(boxGeometry, tabuleiroMaterial);
    boxMesh.position.set(0, 2, 150);
    addChao(boxMesh);
    scene.add(boxMesh);

    loadPieces(boxMesh)
}

async function loadPieces(pai){
    const pieceNames = ['King', 'Queen', 'Bishop', 'Knight', 'Rook', 'Pawn'];
    for (const name of pieceNames) {
        piecesMeshBlack[name] = await loadChessPiece(`./assets/xadrez/${name}.glb`, 'rgba(60, 60, 60, 1)');
        piecesMeshBlack[name].scale.set(2, 2, 2);
        piecesMeshWhite[name] = await loadChessPiece(`./assets/xadrez/${name}.glb`, 'rgba(200, 200, 200, 1)');
        piecesMeshWhite[name].scale.set(2, 2, 2);
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

    // White pieces positions
    kw.position.set(87.5, 2, -62.5);
    rw1.position.set(87.5, 2, -37.5);
    rw2.position.set(87.5, 2, 87.5);
    bw1.position.set(posEsquerda + tamQuadrado, 2, posEsquerda + tamQuadrado);
    qw.position.set(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 6 * tamQuadrado);

    //Black pieces positions
    kb.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 6 * tamQuadrado);
    qb.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    bb1.position.set(posEsquerda + 2 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    bb2.position.set(posEsquerda + 6 * tamQuadrado, 2, posEsquerda + 4 * tamQuadrado);
    nb1.position.set(posEsquerda + 5 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    nb2.position.set(posEsquerda + 4 * tamQuadrado, 2, posEsquerda + 3 * tamQuadrado);
    rb1.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 5 * tamQuadrado);
    rb2.position.set(posEsquerda + 7 * tamQuadrado, 2, posEsquerda + 0 * tamQuadrado);

    nb1.rotation.y = Math.PI / 2; // 90 graus em radianos
    nb2.rotation.y = Math.PI / 2; // 90 graus em radianos

}

export { createChessBoard };