import * as THREE from 'three';

const paredeGeo = new THREE.BoxGeometry(201, 90, 1);

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

        this.aberto = false;
        this.comecou = false;
    }

    update() {
        if(this.aberto) return;


    }

    render(){
        if(!this.comecou){
            this.player.
        }
        this.update();
        requestAnimationFrame(() => this.render());
    }
}

export { ParedeA4 };