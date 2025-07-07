import * as THREE from 'three';

const spriteMaterial = new THREE.SpriteMaterial({ color: 0x00ff00 });

class InimigoBase {
    constructor(scene, vida, ataque, player){
        this.vida = vida;
        this.maxVida = vida;
        this.ataque = ataque;
        this.player = player; 
        this.isEnemy = true;

        this.scene = scene;

        this.object = new THREE.Object3D();
        this.object.userData.isEnemy = true;
        this.object.position.set(0, 0, 0);
        this.mesh = null;
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.scale.set(2, 0.4, 1);
        this.sprite.position.set(10, 2, 10);
        scene.add(this.sprite);
    }

    setup(){
        if(this.mesh){
            this.mesh.add(this.sprite);
            this.sprite.position.set(0, 4, 0);
            this.object.add(this.sprite);
            this.object.add(this.mesh);
            this.scene.add(this.object);
            this.object.userData.inimigoInstance = this;
        }
        this.render();
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
        this.sprite.scale.set(2 * porcentagemVida, 0.4, 1);
    }

    morrer(){
        throw new Error("Método 'morrer' não implementado na classe base InimigoBase.");
    }

    render() {
        this.update();
        requestAnimationFrame(() => this.render());
    }

    update(){
        throw new Error("Método 'update' não implementado na classe base InimigoBase.");
    }
}

export { InimigoBase };