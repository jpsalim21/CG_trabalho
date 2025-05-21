import * as THREE from  'three';

const geometria = new THREE.SphereGeometry(0.5, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 'rgb(241, 6, 6)' });

const posInicial = new THREE.Vector3(0, -10, 0);

class Bullet {
    constructor(posicao, pool) {
        this.mesh = new THREE.Mesh(geometria, material);
        this.mesh.position.copy(posicao);
        this.velocidade = 10;
        this.movendo = false;
        this.mesh.visible = false;
        this.pool = pool;
    }

    // Método chamado quando vamos atirar a bala
    atirar(posicao, alvo) {
        this.mesh.position.copy(posicao);
        this.mesh.lookAt(alvo);
        this.movendo = true;
        this.mesh.visible = true;
    }

    //Método chamado a cada frame
    update() {
        if (!this.movendo) return;

        this.mesh.translateZ(this.velocidade);
    }

    // Método chamado quando a bala deve ser destruída/resetada (por exemplo, quando sai da tela ou atinge um alvo)
    reset() {
        this.movendo = false;
        this.mesh.position.copy(posInicial);
        this.mesh.visible = false;
        this.pool.resetBullet(this); // Talvez tenha um jeito melhor de fazer isso, mas por enquanto é assim
    }
}

class BulletPool {
    constructor() {
        this.bullets = [];
        this.bulletsInUse = [];
        this.poolSize = 10;

        for (let i = 0; i < this.poolSize; i++) {
            this.bullets.push(new Bullet(posInicial), this);
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

        bullet.atirar(posicao, alvo);
        
        this.bulletsInUse.push(bullet);
    }

    resetBullet(bullet) {
        this.bullets.push(bullet);
        this.bulletsInUse.splice(this.bulletsInUse.indexOf(bullet), 1);
    }
}