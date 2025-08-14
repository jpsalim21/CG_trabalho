import * as THREE from "three";

const tempoInvencivel = 1;
let listaInimigos = [];
let clock = new THREE.Clock();
clock.start();

function addInimigoColisao(inimigo) {
    listaInimigos.push(inimigo);
}
function removeInimigoColisao(inimigo) {
    const index = listaInimigos.indexOf(inimigo);
    if (index > -1) {
        listaInimigos.splice(index, 1);
    }
}

function getInimigosColisao() {
    return listaInimigos;
}

function testaColisao(player){
    let elapsed = clock.getElapsedTime();
    if(elapsed < tempoInvencivel) return 0;

    for(let i = 0; i < listaInimigos.length; i++){
        // ignora balas do próprio jogador para evitar auto-dano
        if(listaInimigos[i].isPlayerBullet === true) {
            continue;
        }
        
        if(listaInimigos[i].bb.intersectsBox(player.bb)){
            clock.start();
            return listaInimigos[i].ataque;
        }
    }
    return 0;
}


export { addInimigoColisao, removeInimigoColisao, getInimigosColisao, testaColisao };