import * as THREE from "three";

class PortaArea {
    constructor(scene, portaMesh, blocoChave, elevador, chave) {
        this.scene = scene;
        this.porta = portaMesh;
        this.blocoChave = blocoChave;
        this.elevador = elevador;
        this.chave = chave;
        this.chaveColocada = false;
        this.portaAberta = false;
        this.velocidade = 1;
        
        this.bbBlocoChave = new THREE.Box3().setFromObject(blocoChave);
        this.bbBlocoChaveHelper = new THREE.Box3Helper(this.bbBlocoChave, 0x00ff00);
        scene.add(this.bbBlocoChaveHelper);
        
        this.render();
    }

    update(player) {
        if (this.portaAberta) return;
        
        // Verifica se o jogador está perto do pilar da chave
        if (player.bb.intersectsBox(this.bbBlocoChave)) {
            if (gameController.chave1 && !this.chaveColocada) {
                this.chaveColocada = true;
                this.abrirPorta();
                this.chave.colocar(this.blocoChave.position + 1);
            }
        }
    }


    abrirPorta() {
        this.portaAberta = true;
        this.elevador.ativar();
    }

    render() {
        if (this.portaAberta && this.porta.position.y > -2) {
            this.porta.position.y -= this.velocidade * 0.016;
        }
        requestAnimationFrame(() => this.render());
    }
}

export { PortaArea };