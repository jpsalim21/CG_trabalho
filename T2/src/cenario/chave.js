import * as THREE from 'three';
import { CSG } from '../../../libs/other/CSGMesh.js';    
import { GameController } from "../controller/gamecontroller.js";
import { SoundController } from "../controller/soundcontroller.js";

const vermelha = new THREE.MeshPhongMaterial({color: 'rgb(196, 18, 18)', shininess: 100});
const amarela = new THREE.MeshPhongMaterial({color: 'rgb(255, 255, 65)', shininess: 100});
const azul = new THREE.MeshPhongMaterial({color: 'rgb(18, 18, 196)', shininess: 100});
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
    constructor(scene, player, tipo = 'vermelha') {
        this.scene = scene;
        this.mesh = CSG.toMesh(csgObj, new THREE.Matrix4(), vermelha);
        this.mesh.castShadow = true;

        this.mesh.position.set(0, 2, -15);

        this.player = player; 
        this.bb = new THREE.Box3().setFromObject(this.mesh);
        this.soundController = new SoundController(player.getCamera());

        this.tipo = tipo;
        this.adquirida = false;
        this.colocada = false;
        this.playerbb = player.bb;
        
        this.ativa = false;

        if (tipo == 'vermelha') {
            this.mesh.material = vermelha;
            GameController.instance.iChave1 = this;
        } else if (tipo == 'amarela') {
            this.mesh.material = amarela;   
            GameController.instance.iChave2 = this;
        } else if (tipo == 'azul') {
            this.mesh.material = azul;   
            GameController.instance.iChave3 = this;
        }

        this.render();
    }

    update(){
        this.mesh.rotateX(0.01);
        this.mesh.rotateY(0.01);
        this.mesh.rotateZ(0.01);
        
        if (this.adquirida || !this.mesh) return;

        if(this.bb.intersectsBox(this.playerbb) && this.ativa){
            this.adquirida = true;
            
            if (this.tipo === 'vermelha') {
                GameController.instance.chave1 = true;
                showTemporaryMessage("Chave vermelha adquirida! Use-a para desbloquear a área 2.", 5000);
            } else if (this.tipo === 'amarela') {
                GameController.instance.chave2 = true;
                showTemporaryMessage("Chave amarela adquirida! Use-a para desbloquear a área 3", 5000);
            } else if (this.tipo === 'azul') {
                GameController.instance.chave3 = true;
                showTemporaryMessage("Chave azul adquirida! Use-a para desbloquear a área 4", 5000);
            }
            this.destroy();
        }
    }

    render(){
        this.update();
        requestAnimationFrame(() => this.render());
    }

    destroy(){
        if (this.mesh) {
            this.mesh.visible = false;
        }
    }

    colocar(posicao) {
        if (this.adquirida && !this.colocada) {
            this.scene.add(this.mesh);
            this.mesh.position.copy(posicao);
            console.log("Chave visível:", this.mesh.position);
            this.mesh.visible = true;
            this.colocada = true;
            this.soundController.play("chave");
        }
    }

    pegaPorController(){
        this.adquirida = true;
        this.mesh.visible = false;
        this.colocada = false;
    }
}

export { Chave };