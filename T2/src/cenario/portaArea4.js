import * as THREE from 'three';

import { SoundController } from "../controller/soundcontroller.js";
import { GameController } from "../controller/gamecontroller.js";

class portaA4 {
    constructor(scene, position, player, chave, paredes) {
        this.scene = scene;
        this.position = position;
        this.player = player;
        this.chave = chave;
        this.chaveColocada = false;
        this.paredes = paredes;

        this.aberto = false;
        this.soundController = new SoundController(player.getCamera());

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 3),
            new THREE.MeshLambertMaterial({color:'rgba(128, 134, 127, 1)'}) // Cor marrom para a porta
        );
        this.mesh.position.copy(position);
        this.mesh.castShadow = true; // A porta pode projetar sombras
        scene.add(this.mesh);

        this.bb = new THREE.Box3(
            new THREE.Vector3(position.x - 3, position.y - 1, position.z - 3),
            new THREE.Vector3(position.x + 3, position.y + 3, position.z + 3)
        );

        this.animationFrameID = null; // Para controle do loop de renderização
        this.render();
    }

    update() {
        console.log("Atualizando porta A4", this.aberto);
        if (this.aberto){
            this.stopRender();
            return; // Se a porta já está aberta, não faz nada
        } 
        
        if (this.bb.intersectsBox(this.player.bb)) {
            if (GameController.instance.chave1 && !this.chaveColocada) {
                this.aberto = true;
                this.chaveColocada = true;
                showTemporaryMessage("Área 4 desbloqueada, mate todos os inimigos para vencer.");
                const position = this.mesh.position.clone();
                position.y += 3; 
                this.soundController.play("portaAbrindo");
                this.chave.colocar(position);
                this.paredes.render();
            }
        }
    }

    render() {
        this.update();
        this.animationFrameID = requestAnimationFrame(() => this.render());
    }

    stopRender() {
        if (this.animationFrameID) {
            cancelAnimationFrame(this.animationFrameID); // Cancela o loop de renderização
            this.animationFrameID = null; // Reseta o ID para evitar chamadas futuras
        }
    }
}

export { portaA4 };