import * as THREE from 'three';
import { CSG } from '../libs/other/CSGMesh.js';    

const material = new THREE.MeshPhongMaterial({
    color: 'rgb(196, 18, 18)',
    shininess: 100,
});
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
    constructor(scene, playerbb){
        this.mesh = CSG.toMesh(csgObj, new THREE.Matrix4(), material);
        this.mesh.castShadow = true;

        this.mesh.position.set(0, 2, -15);

        this.bb = new THREE.Box3().setFromObject(this.mesh);
        this.bbHelper = new THREE.Box3Helper(this.bb, 'white');
        this.bbHelper.visible = true; 
        
        this.playerbb = playerbb; 

        scene.add(this.bbHelper);
        scene.add(this.mesh);
        this.render();
    }

    update(){
        this.mesh.rotateX(0.01);
        this.mesh.rotateY(0.01);
        this.mesh.rotateZ(0.01);

        if(this.bb.intersectsBox(this.playerbb)){
            console.log("Colisão detectada com a chave!");
            this.destroy();
        }
    }

    render(){
        this.update();
        requestAnimationFrame(() => this.render());
    }

    destroy(){
        if (this.mesh && this.bbHelper) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.bbHelper.geometry.dispose();
            this.bbHelper.material.dispose();
            this.mesh.parent.remove(this.mesh);
            this.bbHelper.parent.remove(this.bbHelper);
        }
    }
}

export { Chave };