import * as THREE from "three";
import { SoundController } from "../controller/soundcontroller.js";

class PlataformaChave {
    constructor(scene, position, chave, player, iniciaAtiva = true) {
        this.scene = scene;
        this.position = position;
        this.chave = chave;
        this.alturaAlvo = 5;
        this.velocidade = 0.8;
        this.ativo = iniciaAtiva;

        this.soundController = new SoundController(player.getCamera());
        
        this.plataforma = new THREE.Mesh(new THREE.BoxGeometry(3.5,2,3.5), new THREE.MeshLambertMaterial({ color: 0x888888 }));
        this.plataforma.position.copy(position);
        this.plataforma.add(chave.mesh);
        chave.mesh.position.set(0, 3, 0);
        this.chave.bb.setFromObject(this.chave.mesh);
        this.plataforma.castShadow = true;
        scene.add(this.plataforma);
        
        // Se não deve iniciar ativa, oculta a chave
        if (!iniciaAtiva) {
            this.chave.mesh.visible = false;
            this.chave.ativa = false;
        } else {
            this.chave.ativa = true;
        }
        
        this.render();
    }

    ativar() {
        console.log("Plataforma ativada");
        this.ativo = true;
        this.chave.mesh.visible = true;
        this.chave.ativa = true;
    }

    desativar() {
        console.log("Plataforma desativada");
        this.ativo = false;
        this.chave.mesh.visible = false;
        this.chave.ativa = false;
    }

    update() {
        if (!this.ativo) return;
        
        if (this.plataforma.position.y < this.alturaAlvo) {
            this.plataforma.position.y += this.velocidade * 0.016;
            this.chave.bb.setFromObject(this.chave.mesh);
            this.soundController.play("plataformaMovendo");
        }
    }

    render() {
        this.update();
        requestAnimationFrame(() => this.render());
    }
}

export { PlataformaChave };