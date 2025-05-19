import * as THREE from  'three';

const gravidade = -9.81;

class Entidade {
    constructor(geometria, material, posicao = new THREE.Vector3(0, 0, 0), rotacao = new THREE.Vector3(0, 0, 0), escala = new THREE.Vector3(1, 1, 1)) {
        this.mesh = new THREE.Mesh(geometria, material);
        this.mesh.position.copy(posicao);
        this.mesh.rotation.copy(rotacao);
        this.mesh.scale.copy(escala);
    }

    setPosicao(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    update(input){
        input = input.normalize();

        let velocidade = new THREE.Vector3(0, 0, 0);
        velocidade.x = input.x;
        velocidade.z = input.z;

        this.mesh.translateX(this.velocidade.x);
        this.mesh.translateY(this.velocidade.y);
        this.mesh.translateZ(this.velocidade.z);
    }
}