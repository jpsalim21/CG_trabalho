import * as THREE from 'three';
import { addChao } from './cenario.js';

const geometry = new THREE.BoxGeometry(10, 20, 10);
const material = new THREE.MeshLambertMaterial({
    color: 'rgb(200, 200, 200)',
    emissive: 'rgb(100, 100, 100)',
    emissiveIntensity: 0.5,
    transparent: true,
});

class Elevador {
    constructor(scene, position, player){
        this.scene = scene;
        this.player = player;

        this.mesh = new THREE.Mesh(geometry, material);
        position.y -= 10.1;

        this.falseMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.falseMesh);
        this.falseMesh.position.set(0, 10, 0); // posição do falso teto
        this.falseMesh.visible = false; // torna o falso teto invisível
        
        this.mesh.position.copy(position);
        addChao(this.mesh); // adiciona o elevador ao chão
        
        this.bb = new THREE.Box3().setFromObject(this.falseMesh);
        this.bbHelper = new THREE.Box3Helper(this.bb, 'blue');
        this.scene.add(this.bbHelper);
        this.scene.add(this.mesh);


        this.updateFunction = this.waiting.bind(this);
        this.render();
    }

    update(){
        this.updateFunction();
    }

    render(){
        this.update();
        requestAnimationFrame(() => this.render());
    }


    waiting(){
        this.bb.setFromObject(this.falseMesh);
        if(this.bb.intersectsBox(this.player.bb)) {
            this.updateFunction = this.moving.bind(this);
            console.log("Jogador entrou no elevador, iniciando movimento.");
        }
    }

    moving(){
        this.bb.setFromObject(this.falseMesh);
        if(this.bb.intersectsBox(this.player.bb)) {
            this.mesh.position.y += 0.1; // move o elevador para cima
            if (this.mesh.position.y >= 6) { // altura máxima do elevador
                this.updateFunction = this.nada.bind(this); // volta para a função de espera
            }
        } else {
            this.updateFunction = this.waiting.bind(this); // volta para a função de espera se o jogador sair do elevador
        }
    }

    nada(){

    }

}

export { Elevador };