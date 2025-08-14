import * as THREE from "three";
import { SoundController } from "../controller/soundcontroller.js";

import { GameController } from "../controller/gamecontroller.js";

class PortaArea {
    constructor(scene, portaMesh, blocoChave, player, chave) {
        this.scene = scene;
        this.porta = portaMesh;
        this.blocoChave = blocoChave;
        this.chave = chave;
        this.chaveColocada = false;
        this.portaAberta = false;
        this.velocidade = 1;
        this.player = player;

        this.soundController = new SoundController(player.getCamera());
        
        this.bbBlocoChave = new THREE.Box3(
            new THREE.Vector3(blocoChave.position.x - 3, blocoChave.position.y - 1, blocoChave.position.z - 3),
            new THREE.Vector3(blocoChave.position.x + 3, blocoChave.position.y + 3, blocoChave.position.z + 3)
        );
        
        this.render();
    }

    update() {
        if (this.portaAberta) return;
        
        // Verifica se o jogador está perto do pilar da chave
        if (this.bbBlocoChave.intersectsBox(this.player.bb)) {
            if (GameController.instance.chave1 && !this.chaveColocada) {
                this.chaveColocada = true;
                showTemporaryMessage("Área 2 desbloqueada, mate todos os inimigos para conseguir a chave amarela.");
                this.portaAberta = true;
                const position = this.blocoChave.position.clone();
                position.y += 3; 
                this.soundController.play("portaAbrindo");
                this.chave.colocar(position);
            }
        }
    }

    render() {
        this.update();
        if (this.portaAberta && this.porta.position.y > -2.1) {
            this.porta.position.y -= this.velocidade * 0.016;
        }
        requestAnimationFrame(() => this.render());
    }
}

export { PortaArea };