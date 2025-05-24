import * as THREE from  'three';

const geometria = new THREE.SphereGeometry(0.2, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 'rgb(241, 6, 6)' });

const posInicial = new THREE.Vector3(0, -10, 0);
const teto = 30;
const chao = -5;
const limiteLateral = 250;
const limiteLateralNegativo = -250;

class Bullet {
    constructor(posicao, pool, scene) {
        this.mesh = new THREE.Mesh(geometria, material);
        this.mesh.position.copy(posicao);
        this.velocidade = 0.5;
        this.movendo = false;
        this.mesh.visible = false;
        this.pool = pool;

        this.clock = new THREE.Clock();
        this.clock.stopped = true;

        scene.add(this.mesh);
    }

    // Método chamado quando vamos atirar a bala
    atirar(posicao, alvo) {
        this.mesh.position.copy(posicao);
        this.mesh.lookAt(alvo);
        this.movendo = true;
        this.mesh.visible = true;
        this.render();
        //this.clock.start();
    }

    //Método chamado a cada frame
    render() {
        if (!this.movendo) return;
        this.mesh.translateZ(this.velocidade);
        if (this.mesh.position.y > teto || this.mesh.position.y < chao) {
            this.reset();
        } //Daqui pra frente, não sei se é bom continuar, mas por enquanto, vou deixar assim
        else if (this.mesh.position.x > limiteLateral || this.mesh.position.x < limiteLateralNegativo) {
            this.reset();
        }
        else if (this.mesh.position.z > limiteLateral || this.mesh.position.z < limiteLateralNegativo) {
            this.reset();
        }
        requestAnimationFrame(() => this.render());
    }

    // Método chamado quando a bala deve ser destruída/resetada (por exemplo, quando sai da tela ou atinge um alvo)
    reset() {
        this.movendo = false;
        this.mesh.position.copy(posInicial);
        this.mesh.visible = false;
        this.pool.resetBullet(this);
    }
}

class BulletPool {
    constructor(scene) {
        this.bullets = [];
        this.bulletsInUse = [];
        this.poolSize = 10;

        this.scene = scene;
        this.clock = new THREE.Clock();

        for (let i = 0; i < this.poolSize; i++) {
            this.bullets.push(new Bullet(posInicial, this, this.scene));
        }
    }

    // Um método para pegar uma bala da pool ou criar uma nova se não houver nenhuma disponível
    getBullet() {
        if (this.bullets.length > 0) {
            return this.bullets.pop();
        } else {
            return new Bullet(posInicial, this, this.scene);
        }
    }

    // Método chamado quando o jogador atira
    atirar(posicao, alvo) {
        let delta = this.clock.getElapsedTime();
        if(delta < 0.2) return;
        let bullet = this.getBullet();
        bullet.atirar(posicao, alvo);
        this.bulletsInUse.push(bullet);
        this.clock.start();
    }

    // Método que a bala chama quando ela precisa ser resetada
    resetBullet(bullet) {
        this.bullets.push(bullet);
        this.bulletsInUse.splice(this.bulletsInUse.indexOf(bullet), 1);
    }
}

export { BulletPool };