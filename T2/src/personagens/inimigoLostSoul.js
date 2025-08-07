import { InimigoBase } from "./inimigoBase.js";
import { OBJLoader } from '../../../build/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { getParedes, getChao } from "../cenario/cenario.js";
import { GameController } from "../controller/gamecontroller.js";
import { removeInimigoColisao, addInimigoColisao } from "./inimigocontroller.js";
import { loadOBJ } from "../Mesh/extractor.js";

const path = "./assets/skullMelhor.obj";
const texturePath = "./assets/skul/";


class InimigoLostSoul extends InimigoBase {
    constructor(scene, vida, ataque, player, observer, velocidade = 10) {
        super(scene, vida, 10, player, observer);
        this.player = player;
        this.velocidade = velocidade;
        this.rodando = true;

        this.bulletPool = this.player.getBulletPool();

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;
        this.rayGround = new THREE.Raycaster();
        this.rayGround.far = 1.0;
        this.rayGround.near = 0.1;

        this.updateFunction = null;
        this.estado = null;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();
        this.clock = new THREE.Clock();
        this.clock.start();

        this.timeOnState = 0;
        this.maxTime = 5;

        this.sinOffset = Math.random() * 2 * Math.PI;

        this.loadModel();

        this.scene.add(this.object);
    }

    async loadModel() {
        try {
            this.mesh = await loadOBJ(path, texturePath, "skull_blood_BaseColor.png", "skull_blood_Normal.png", "skull_Roughness.png", "skull_blood_Metallic.png");
            this.scene.add(this.mesh);
            this.setup();
        } catch (error) {
            console.error('Error loading model:', error);
            return;
        }
    }
    
    setup() {
        super.setup();
        
        this.bb = new THREE.Box3().setFromObject(this.mesh);
        addInimigoColisao(this);

        this.enterIdle();

        this.rodando = true;
    }

    morrer() {
        this.rodando = false;

        const metodoDestructor = this.destructor.bind(this);
        let start = null;
        const initialOpacities = [];
        const mesh = this.mesh;
        mesh.traverse(child => {
            if (child.isMesh && child.material) {
                initialOpacities.push(child.material.opacity ?? 1);
            }
        });
        const duration = 0.7; // segundos
        function animateFadeOut(timestamp) {
            if (!start) start = timestamp;
            const elapsed = (timestamp - start) / 1000;
            const t = Math.min(elapsed / duration, 1);

            let i = 0;
            mesh.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.opacity = initialOpacities[i] * (1 - t);
                    i++;
                }
            });

            if (t < 1) {
                requestAnimationFrame(animateFadeOut);
            } else {
                metodoDestructor();
            }
        }

        requestAnimationFrame(animateFadeOut);
        GameController.instance.inimigoMorreu(this);
    }

    destructor(){
        removeInimigoColisao(this);
        this.observer.removeListener(this);
        this.scene.remove(this.mesh);
        this.mesh = null;
        this.bulletPool = null;
        this.clock = null;
    }

    update(){
        if (!this.rodando) return;
        
        this.testeColisao();
        
        if (this.updateFunction) {
            const delta = this.clock.getDelta();
            this.updateFunction(delta);
            this.bb.setFromObject(this.mesh);
        }
    }

    testeColisao(){
        const objects = this.bulletPool.getBulletsInUse();

        const bullet = objects.find(obj => this.bb.intersectsBox(obj.bb));
        if (bullet) {
            bullet.reset();
            this.tomarDano(10);
        }
    }

    wallCollision(dir, delta, scale = 1){
        const quaternion = this.object.quaternion.clone();
        let direcao = dir.clone();
        direcao.applyQuaternion(quaternion);

        this.rayWall.set(this.object.position, direcao);

        const objects = getParedes().concat(getChao());
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);

        
        if (intersectedObjects.length > 0) {
            let normal = intersectedObjects[0].face.normal;
            
            normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersectedObjects[0].object.matrixWorld)).normalize();
            
            let dNova = direcao.clone().projectOnPlane(normal); // Projeta a direção no plano para não atravessar paredes
            direcao = dNova.normalize();
        }
        
        this.object.position.add(direcao.multiplyScalar(this.velocidade * delta * scale));
    }

    groundCollision(){
        this.rayGround.set(this.object.position, new THREE.Vector3(0, -1, 0));
        const objects = getChao();
        const intersectedObjects = this.rayGround.intersectObjects(objects, true);

        if (intersectedObjects.length > 0) {
            const groundY = intersectedObjects[0].point.y;
            if (this.object.position.y - 2.0 < groundY) {
                this.object.position.y = groundY + 2.0;
            }
        }
    }

    //#region MÁQUINA DE ESTADOS

    enterIdle(){
        if(this.estado === "idle") return;

        this.clockIdle.start();
        this.altura = this.object.position.y;
        this.updateFunction = this.idle.bind(this);
        this.estado = "idle";

    }

    idle(delta){
        let seno = Math.sin(this.clockIdle.getElapsedTime() * 2 + this.sinOffset);

        this.object.position.y = this.altura + seno;
        this.bb.setFromObject(this.mesh);
    }

    enterTriggered(){
        if(this.estado === "triggered") return;

        this.timeOnState = 0;
        this.dirSignal = Math.random() < 0.5 ? -1 : 1;
        this.updateFunction = this.triggered.bind(this);
        this.estado = "triggered";
        this.maxTime = 0.5 + Math.random() * 5; // Tempo aleatório entre 1 e 5 segundos
    }

    triggered(delta){
        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            this.enterAttack();
            return;
        }

        let direcao = this.player.getCamPosition().clone().sub(this.object.position);
        direcao.y = 0;
        direcao.normalize();
        direcao.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.dirSignal * Math.PI / 2);
        let alvo = this.object.position.clone().add(direcao);
        this.object.lookAt(alvo);
        
        const dir = new THREE.Vector3(0, 0, 1);
        this.wallCollision(dir, delta, 1.0);
        this.groundCollision();
    }

    enterAttack(){
        if(this.estado === "attack") return;

        this.timeOnState = 0;
        const alvo = this.player.getCamPosition();
        this.direcao = alvo.clone().sub(this.object.position).normalize();
        this.object.lookAt(alvo);
        this.updateFunction = this.attack.bind(this);
        this.estado = "attack";
        this.maxTime = 1 + Math.random() * 2; // Tempo aleatório entre 1 e 3 segundos
    }

    attack(delta){
        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            this.enterTriggered();
            return;
        }
        const dir = new THREE.Vector3(0, 0, 1);
        this.wallCollision(dir, delta, 5.0);
        this.groundCollision();
    }
    //#endregion

}

export { InimigoLostSoul };