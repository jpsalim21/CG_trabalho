import * as THREE from "three";
import { InimigoBase } from "./inimigoBase.js";


class AreaTrigger {
    constructor(scene, position, size, player){
        this.scene = scene;
        this.position = position;
        this.size = size;
        this.player = player;

        this.listeners = [];

        this.bb = new THREE.Box3(
            new THREE.Vector3(position.x - size.x / 2, position.y - size.y / 2, position.z - size.z / 2),
            new THREE.Vector3(position.x + size.x / 2, position.y + size.y / 2, position.z + size.z / 2)
        );
        this.bbHelper = new THREE.Box3Helper(this.bb, 0x00ff00);
        this.scene.add(this.bbHelper);

        this.render();
    }

    addListener(listener) {
        if (listener instanceof InimigoBase) {
            this.listeners.push(listener);
        }
    }

    update(){
        if(this.bb.intersectsBox(this.player.bb)){
            this.trigger();
        }
    }

    render() {
        this.update();
        requestAnimationFrame(() => this.render());
    }

    trigger(){
        console.log("Trigger activated!");
        this.listeners.forEach(listener => {
            if (listener instanceof InimigoBase) {
                listener.enterTriggered();
            }
        });
    }
}

export { AreaTrigger };