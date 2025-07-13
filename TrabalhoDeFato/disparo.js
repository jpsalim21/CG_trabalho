import * as THREE from  'three';
import { getParedes } from './cenario.js';

const geometria = new THREE.SphereGeometry(0.8, 16, 16);

const posInicial = new THREE.Vector3(0, -10, 0);
const teto = 150;
const chao = -5;

class Bullet {
    constructor(posicao, pool, scene) {
        this.mesh = new THREE.Mesh(geometria, new THREE.MeshLambertMaterial({color: pool.color}) );
        this.mesh.position.copy(posicao);
        this.velocidade = 90;
        this.movendo = false;
        this.mesh.visible = false;
        this.pool = pool;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 1;
        this.direcao = new THREE.Vector3(0, 0, 1);

        this.bb = new THREE.Box3().setFromObject(this.mesh);

        scene.add(this.mesh);
    }

    // Método chamado quando vamos atirar a bala
    atirar(posicao, alvo) {
        this.mesh.position.copy(posicao);
        this.mesh.lookAt(alvo);
        this.movendo = true;
        this.mesh.visible = true;

        this.direcao = new THREE.Vector3(0, 0, 1);
        this.direcao.applyQuaternion(this.mesh.quaternion);
        this.direcao.normalize();
    }

    //Método chamado a cada frame
    render(delta) {
        if (!this.movendo) return;
        this.mesh.translateZ(this.velocidade * delta);

        this.bb.setFromObject(this.mesh);

        if (this.mesh.position.y > teto || this.mesh.position.y < chao) {
            this.reset();
            return;
        }

        this.isColliding();
    }
    isColliding(){
        this.raycaster.set(this.mesh.getWorldPosition(new THREE.Vector3()), this.direcao);
        const paredes = this.pool.listaParede;
        const intersects = this.raycaster.intersectObjects(paredes, false);
        if (intersects.length > 0) {
            this.reset();
        }
    }

    // Método chamado quando a bala sai da tela ou atinge um alvo
    reset() {
        this.movendo = false;
        this.mesh.position.copy(posInicial);
        this.bb.setFromObject(this.mesh);
        this.mesh.visible = false;
        this.pool.resetBullet(this);
    }
}

//Pool para quantidade de balas que o jogador pode disparar
class BulletPool {
    constructor(scene, color = 0xff0000) { //cor padrão é vermelha
        this.bullets = [];
        this.bulletsInUse = [];
        this.poolSize = 10;
        this.color = color;

        this.scene = scene;
        this.clock = new THREE.Clock();
        this.clock.getDelta();

        this.clockBala = new THREE.Clock();
        this.clockBala.getDelta();

        this.listaParede = getParedes();

        for (let i = 0; i < this.poolSize; i++) {
            this.bullets.push(new Bullet(posInicial, this, this.scene));
        }
        this.render();
    }

    render() {
        let delta = this.clockBala.getDelta();

        this.bulletsInUse.forEach(b => {
            b.render(delta);
        });

        requestAnimationFrame(() => this.render());
    }

    // pegar uma bala da pool ou criar uma nova se não houver nenhuma disponível
    getBullet() {
        if (this.bullets.length > 0) {
            return this.bullets.pop();
        } else {
            return new Bullet(posInicial, this, this.scene);
        }
    }

    // quando o jogador atira
    atirar(posicao, alvo) {
        let delta = this.clock.getElapsedTime();
        if(delta < 0.5) return;
        let bullet = this.getBullet();
        bullet.atirar(posicao, alvo);
        this.bulletsInUse.push(bullet);
        this.clock.start();
    }

    // quando a bala precisa ser resetada
    resetBullet(bullet) {
        this.bullets.push(bullet);
        this.bulletsInUse.splice(this.bulletsInUse.indexOf(bullet), 1);
    }

    getBulletsInUse() {
        return this.bulletsInUse;
    }
}

export { BulletPool };