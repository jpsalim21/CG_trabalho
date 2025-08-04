import * as THREE from "three";

let listaInimigos = [];

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

function testaColisao(playerBb){
    listaInimigos.forEach(element => {
        if(element.bb.intersectsBox(playerBb)){
            return element.ataque;
        }
    });
    return 0; // Retorna 0 se não houver colisão
}


export { addInimigoColisao, removeInimigoColisao, getInimigosColisao, testaColisao };