import * as THREE from  'three';

const geometria = new THREE.SphereGeometry(0.5, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 'rgb(241, 6, 6)' });

const posInicial = new THREE.Vector3(0, -10, 0);

class Bullet {
    constructor(posicao) {
        this.mesh = new THREE.Mesh(geometria, material);
        this.mesh.position.copy(posicao);
        this.velocidade = 10;
        this.movendo = false;
    }

    atirar(posicao, alvo) {
        this.mesh.position.copy(posicao);
        this.mesh.lookAt(alvo);
        this.movendo = true;
    }

    update() {
        if (!this.movendo) return;

        this.mesh.translateZ(this.velocidade);
    }
}

class BulletPool {
    constructor() {
        this.bullets = [];
        this.bulletsInUse = [];
        this.poolSize = 10;

        for (let i = 0; i < this.poolSize; i++) {
            this.bullets.push(new Bullet(posInicial));
        }
    }

    getBullet() {
        if (this.bullets.length > 0) {
            return this.bullets.pop();
        } else {
            return new Bullet(posInicial);
        }
    }

    atirar(posicao, alvo) {
        let bullet = this.getBullet();

        if (bullet) {
            bullet.mesh.position.copy(posicao);
            bullet.setDirecao(alvo);
            this.bulletsInUse.push(bullet);
        }
    }
}