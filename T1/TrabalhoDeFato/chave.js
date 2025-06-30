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
    constructor(scene){
        this.mesh = CSG.toMesh(csgObj, new THREE.Matrix4(), material);
        this.mesh.castShadow = true;

        this.mesh.position.set(5, 2, 2);

        scene.add(this.mesh);
    }
}

export { Chave };