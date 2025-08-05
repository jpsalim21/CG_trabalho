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

function testaColisao(player){
    listaInimigos.forEach(element => {
        if(element.bb.intersectsBox(player.bb)) {
            let foda = element.ataque;
            console.log(foda);
            return foda;
        }
    });
}


export { addInimigoColisao, removeInimigoColisao, getInimigosColisao, testaColisao };