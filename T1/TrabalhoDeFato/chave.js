import * as THREE from 'three';
import { CSG } from '../libs/other/CSGMesh.js';    
import { GameController } from "./gamecontroller.js";

const vermelha = new THREE.MeshPhongMaterial({color: 'rgb(196, 18, 18)', shininess: 100});
const amarela = new THREE.MeshPhongMaterial({color: 'rgb(255, 255, 65)', shininess: 100});
const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3));
const cilMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 32));
const cilMesh2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 32));
const cilMesh3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 32));

cilMesh.rotateX(Math.PI / 2);
cilMesh2.rotateX(Math.PI / 2);
cilMesh2.rotateZ(Math.PI / 2);

cilMesh.matrixAutoUpdate = false;
cilMesh.updateMatrix();
cilMesh2.matrixAutoUpdate = false;
cilMesh2.updateMatrix();
cilMesh3.matrixAutoUpdate = false;
cilMesh3.updateMatrix();

const cubeCSG = CSG.fromMesh(cubeMesh);
const cilCSG = CSG.fromMesh(cilMesh);
const cilCSG2 = CSG.fromMesh(cilMesh2);
const cilCSG3 = CSG.fromMesh(cilMesh3);

let csgObj = cubeCSG.subtract(cilCSG);
csgObj = csgObj.subtract(cilCSG2);
csgObj = csgObj.subtract(cilCSG3);


class Chave {
    constructor(scene, playerbb, tipo = 'vermelha') {
        this.scene = scene;
        this.mesh = CSG.toMesh(csgObj, new THREE.Matrix4(), vermelha);
        this.mesh.castShadow = true;

        this.mesh.position.set(0, 2, -15);

        this.playerbb = playerbb; 
        this.bb = new THREE.Box3().setFromObject(this.mesh);
        this.bbHelper = new THREE.Box3Helper(this.bb, 'white');
        this.bbHelper.visible = true; 
        
        this.tipo = tipo;
        this.adquirida = false;
        this.colocada = false;
        this.playerbb = playerbb;
        
        this.ativa = false;

        if (tipo == 'vermelha') {
            this.mesh.material = vermelha;
        } else {
            this.mesh.material = amarela;   
        }

        scene.add(this.bbHelper);
        this.render();
    }

    update(){
        this.mesh.rotateX(0.01);
        this.mesh.rotateY(0.01);
        this.mesh.rotateZ(0.01);
        
        if (this.adquirida || !this.mesh) return;

        if(this.bb.intersectsBox(this.playerbb) && this.ativa){
            this.adquirida = true;
            this.destroy();

            if (this.tipo === 'vermelha') {
                GameController.instance.chave1 = true;
            } else {
                GameController.instance.chave2 = true;
            }
        }
    }

    render(){
        this.update();
        requestAnimationFrame(() => this.render());
    }

    destroy(){
        if (this.mesh && this.bbHelper) {
            this.mesh.visible = false;
            this.bbHelper.parent.remove(this.bbHelper);
        }
    }

    colocar(posicao) {
        if (this.adquirida && !this.colocada) {
            this.scene.add(this.mesh);
            this.mesh.position.copy(posicao);
            console.log("Chave visível:", this.mesh.position);
            this.mesh.visible = true;
            this.colocada = true;
        }
    }
}

export { Chave };