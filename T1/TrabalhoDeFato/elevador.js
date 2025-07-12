import * as THREE from 'three';
import { addChao, addParedes} from './cenario.js';

const geometry = new THREE.BoxGeometry(10, 20, 10);
const geometriaMaior = new THREE.BoxGeometry(20, 20, 20);
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

        this.mesh.position.copy(position);

        let elevadorchao = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 10),  material);
        elevadorchao.position.set(5, 0, -106);
        elevadorchao.receiveShadow = true;
        scene.add(elevadorchao);
        
        addChao(this.mesh); // adiciona o elevador ao chão
        addParedes(this.mesh); // adiciona o elevador às paredes
        
        this.falseMesh = new THREE.Mesh(geometriaMaior, material);
        this.mesh.add(this.falseMesh);
        this.falseMesh.position.set(0, 5, 0); // posição do falso teto
        this.falseMesh.visible = false; // torna o falso teto invisível
        

        this.bb = new THREE.Box3().setFromObject(this.falseMesh);
        this.scene.add(this.mesh);

        this.ativo = false;
        this.alturaInicial = position.y;
        this.alturaAlvo = -6;

        this.clock = new THREE.Clock();
        this.clock.start();
        this.tempoPassado = 0;

        this.playerDentro = false;

        this.enterIdle();
        this.render();
    }

    enterIdle(){
        this.bb.setFromObject(this.falseMesh);
        this.updateFunction = this.idle.bind(this);
        this.tempoPassado = 0;
    }

    idle(delta){
        if(this.bb.intersectsBox(this.player.bb)) {
            if(!this.playerDentro) {
                this.playerDentro = true;
                this.enterDescer();
            }
        } else{
            this.playerDentro = false;
        }
    }

    enterDescer(){
        this.updateFunction = this.descer.bind(this);
        this.tempoPassado = 0;
    }

    descer(delta){
        if(this.mesh.position.y > this.alturaInicial){
            this.mesh.position.y -= 2 * delta; // Desce a uma velocidade de 0.5 unidades por segundo
            this.bb.setFromObject(this.falseMesh);
        } else {
            this.enterEsperar();
        }
    }

    enterEsperar(){
        this.updateFunction = this.esperar.bind(this);
        this.tempoPassado = 0;
    }

    esperar(delta){
        this.tempoPassado += delta;
        if(this.tempoPassado >= 2) {
            this.tempoPassado = 0;
            this.enterSubir();
        }
    }

    enterSubir(){
        this.updateFunction = this.subir.bind(this);
        this.tempoPassado = 0;
    }

    subir(delta){
        const intersecao = this.bb.intersectsBox(this.player.bb);
        if(!intersecao && this.playerDentro) {
            this.playerDentro = false; // O jogador saiu do elevador
        }
        if(!this.playerDentro && intersecao) {
            this.enterDescer();
            this.playerDentro = true; // O jogador entrou no elevador
            return;
        }

        if(this.mesh.position.y < this.alturaAlvo){
            this.mesh.position.y += 2 * delta; // Sobe a uma velocidade de 0.5 unidades por segundo
            this.bb.setFromObject(this.falseMesh);
        } else {
            this.enterIdle();
        }
    }
        
    update(){
        this.updateFunction(this.clock.getDelta());
    }

    render(){
        this.update();
        requestAnimationFrame(() => this.render());
    }

}

export { Elevador };