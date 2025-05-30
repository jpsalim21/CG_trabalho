import * as THREE from  'three';
import { getParedes } from './cenario.js';
import {setDefaultMaterial} from "../../libs/util/util.js";

const geometria = new THREE.SphereGeometry(0.8, 16, 16);
const material = setDefaultMaterial();

const posInicial = new THREE.Vector3(0, -10, 0);
const teto = 150;
const chao = -5;
const limiteLateral = 250;
const limiteLateralNegativo = -250;

class Bullet {
    constructor(posicao, pool, scene) {
        this.mesh = new THREE.Mesh(geometria, material);
        this.mesh.position.copy(posicao);
        this.velocidade = 2;
        this.movendo = false;
        this.mesh.visible = false;
        this.pool = pool;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 3;
        this.direcao = new THREE.Vector3(0, 0, 1);

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

        this.direcao = new THREE.Vector3(0, 0, 1);
        this.direcao.applyQuaternion(this.mesh.quaternion);
        this.direcao.normalize();

        this.render();
        //this.clock.start();
    }

    //Método chamado a cada frame
    render() {
        if (!this.movendo) return;
        this.mesh.translateZ(this.velocidade);
        if (this.mesh.position.y > teto || this.mesh.position.y < chao) {
            this.reset();
            return;
        }
        else if (this.mesh.position.x > limiteLateral || this.mesh.position.x < limiteLateralNegativo) {
            this.reset();
            return;
        }
        else if (this.mesh.position.z > limiteLateral || this.mesh.position.z < limiteLateralNegativo) {
            this.reset();
            return;
        }

        this.isColliding();

        requestAnimationFrame(() => this.render());
    }
    isColliding(){
        this.raycaster.set(this.mesh.getWorldPosition(new THREE.Vector3()), this.direcao);
        const paredes = this.pool.listaParede;
        const intersects = this.raycaster.intersectObjects(paredes);
        if (intersects.length > 0) {
            this.reset();
        }
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
        let delta = this.clock.getDelta();

        this.listaParede = getParedes();

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
        if(delta < 0.5) return;
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