import { InimigoBase } from "./inimigoBase.js";
import { OBJLoader } from '../../build/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { BulletPool } from "./disparo.js";
import { getParedes, getChao } from "./cenario.js";
import gameController from "./gamecontroller.js";

const path = "../assets/skullMelhor.obj";
const texturePath = "../assets/skul/";


class InimigoLostSoul extends InimigoBase {
    constructor(scene, vida, ataque, player, observer, velocidade = 10) {
        super(scene, vida, ataque, player, observer);
        this.player = player;
        this.velocidade = velocidade;
        this.rodando = true;

        this.bulletPool = this.player.getBulletPool();

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;

        this.updateFunction = null;
        this.estado = null;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();
        this.clock = new THREE.Clock();
        this.clock.start();

        this.timeOnState = 0;
        this.maxTime = 5;

        this.loadModel();

        this.scene.add(this.object);
    }

    loadModel() {
        const loader = new OBJLoader();
        const texLoader = new THREE.TextureLoader();

        const texture = texLoader.load(`${texturePath}skull_blood_BaseColor.png`);
        const normalMap = texLoader.load(`${texturePath}skull_blood_Normal.png`);
        const roughnessMap = texLoader.load(`${texturePath}skull_Roughness.png`);
        const metalnessMap = texLoader.load(`${texturePath}skull_blood_Metallic.png`);

        loader.load(
            path,
            (object) => {
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    normalMap: normalMap,
                    roughnessMap: roughnessMap,
                    metalnessMap: metalnessMap,
                    metalness: 0.5,
                    roughness: 1.0,
                });

                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = material;
                        child.material.transparent = true;
                    }
                });

                this.mesh = object;
                this.setup();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the model:', error);
            }
        )
    }

    setup() {
        super.setup();
        
        // this.object.position.set(-10, 5, 0);

        this.bb = new THREE.Box3().setFromObject(this.mesh);
        this.bbHelper = new THREE.Box3Helper(this.bb, 0xffff00);
        this.scene.add(this.bbHelper);

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
        gameController.inimigoMorreu(this);
    }

    destructor(){
        this.observer.removeListener(this);
        this.scene.remove(this.bbHelper);
        this.scene.remove(this.mesh);
        this.mesh = null;
        this.bbHelper = null;
        this.bulletPool = null;
        this.clock.stop();
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
            this.tomarDano(20);
            console.log("Colidiu com pelo menos uma bounding box!");
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

    //#region MÁQUINA DE ESTADOS

    enterIdle(){
        if(this.estado === "idle") return;

        this.clockIdle.start();
        this.altura = this.object.position.y;
        this.updateFunction = this.idle.bind(this);
        this.estado = "idle";

    }

    idle(delta){
        let seno = Math.sin(this.clockIdle.getElapsedTime() * 2);

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
    }

    enterAttack(){
        if(this.estado === "attack") return;

        this.timeOnState = 0;
        const alvo = this.player.getCamPosition();
        this.direcao = alvo.clone().sub(this.object.position).normalize();
        this.object.lookAt(alvo);
        this.updateFunction = this.attack.bind(this);
        this.estado = "attack";
        this.maxTime = 2 + Math.random() * 2; // Tempo aleatório entre 4 e 10 segundos
    }

    attack(delta){
        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            this.enterTriggered();
            return;
        }
        const dir = new THREE.Vector3(0, 0, 1);
        this.wallCollision(dir, delta, 2.0);
    }
    //#endregion

}

export { InimigoLostSoul };