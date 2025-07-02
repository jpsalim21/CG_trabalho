import * as THREE from 'three';

const spriteMaterial = new THREE.SpriteMaterial({ color: 0x00ff00 });

class InimigoBase {
    constructor(scene, vida, ataque){
        this.vida = vida;
        this.maxVida = vida;
        this.ataque = ataque;

        this.scene = scene;

        this.mesh = null;
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.scale.set(2, 0.4, 1);
        //this.sprite.visible = false;
        this.sprite.position.set(10, 2, 10);
        scene.add(this.sprite);
    }

    setup(){
        this.mesh.add(this.sprite);
        this.sprite.position.set(0, 1, 0);
        this.scene.add(this.mesh);
    }

    tomarDano(dano) {
        this.vida -= dano;
        if (this.vida < 0) {
            this.vida = 0;
            console.log("Inimigo derrotado!");
            this.morrer();
        }
        this.atualizarBarraVida();
    }

    atualizarBarraVida() {
        let porcentagemVida = this.vida / this.maxVida;
        this.sprite.scale(2 * porcentagemVida, 0.4, 1);
    }

    morrer(){
        throw new Error("Método 'morrer' não implementado na classe base InimigoBase.");
    }
}

export { InimigoBase };