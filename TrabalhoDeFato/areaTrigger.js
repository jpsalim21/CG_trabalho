import * as THREE from "three";
import { InimigoBase } from "./inimigoBase.js";


class AreaTrigger {
    constructor(scene, position, size, player){
        this.scene = scene;
        this.position = position;
        this.size = size;
        this.player = player;

        this.listeners = [];
        this.estaDentro = false;

        this.bb = new THREE.Box3(
            new THREE.Vector3(position.x - size.x / 2, position.y - size.y / 2, position.z - size.z / 2),
            new THREE.Vector3(position.x + size.x / 2, position.y + size.y / 2, position.z + size.z / 2)
        );

        this.render();
    }

    addListener(listener) {
        if (listener instanceof InimigoBase) {
            this.listeners.push(listener);
        }
    }
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    update(){
        if(this.bb.intersectsBox(this.player.bb)) {
            if (this.estaDentro){
                return;
            }
            this.estaDentro = true;
            this.trigger();
        } else {
            this.estaDentro = false;
        }
    }

    render() {
        this.update();
        requestAnimationFrame(() => this.render());
    }

    trigger(){
        this.listeners.forEach(listener => {
            if (listener instanceof InimigoBase) {
                listener.enterTriggered();
            }
        });
    }
}

export { AreaTrigger };