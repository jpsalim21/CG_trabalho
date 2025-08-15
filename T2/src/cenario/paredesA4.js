import * as THREE from 'three';
import { addParedes } from './cenario.js';


const paredeGeo = new THREE.BoxGeometry(201, 90, 1);

const alturaAlvo = -41;

class ParedeA4 {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        let parede1 = new THREE.Mesh(paredeGeo, new THREE.MeshBasicMaterial({ color: 0x001020 }));
        parede1.position.set(100, 2, 150);
        parede1.rotation.y = Math.PI / 2;
        parede1.castShadow = true;
        scene.add(parede1);
    
        let parede2 = new THREE.Mesh(paredeGeo, new THREE.MeshBasicMaterial({ color: 0x001020 }));
        parede2.position.set(-100, 2, 150);
        parede2.rotation.y = -Math.PI / 2;
        parede2.castShadow = true;
        scene.add(parede2);
    
        let parede3 = new THREE.Mesh(paredeGeo, new THREE.MeshBasicMaterial({ color: 0x001020 }));
        parede3.position.set(0, 2, 50);
        parede3.castShadow = true;
        scene.add(parede3);

        this.p1 = parede1;
        this.p2 = parede2;
        this.p3 = parede3;

        addParedes(parede1);
        addParedes(parede2);
        addParedes(parede3);

        this.aberto = false;
        this.comecou = false;
        this.clock = new THREE.Clock();
    }

    update(delta) {
        if(this.aberto) return;

        let posDelta = 10 * delta;
        if(this.p1.position.y > alturaAlvo){
            this.p1.position.y -= posDelta;
            this.p2.position.y -= posDelta;
            this.p3.position.y -= posDelta;
        } else if (!this.aberto) {
            this.player.shaking = false;
            this.aberto = true;
        }
    }

    render(){
        if(!this.comecou){
            this.comecou = true;
            this.player.shaking = true;
            this.clock.start();
        }
        this.update(this.clock.getDelta());
        requestAnimationFrame(() => this.render());
    }
}

export { ParedeA4 };