import { InimigoBase } from "./inimigoBase.js";
import { OBJLoader } from '../../build/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { BulletPool } from "./disparo.js";
import { getParedes, getChao } from "./cenario.js";

const path = "../assets/skullMelhor.obj";
const texturePath = "../assets/skul/";


class InimigoLostSoul extends InimigoBase {
    constructor(scene, vida, ataque, player, velocidade = 0.1) {
        super(scene, vida, ataque, player);
        this.player = player;
        this.velocidade = velocidade;
        this.rodando = true;

        this.bulletPool = this.player.getBulletPool();

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;

        this.updateFunction = null;
        this.estado = null;

        this.clock = new THREE.Clock();
        this.clock.start();

        this.loadModel();
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

        this.object.position.set(0, 5, 0);

        this.bb = new THREE.Box3().setFromObject(this.mesh);
        this.bbHelper = new THREE.Box3Helper(this.bb, 0xffff00);
        this.scene.add(this.bbHelper);

        //this.enterIdle();

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
    }

    destructor(){
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

        if (this.updateFunction) {
            const delta = this.clock.getDelta();
            this.updateFunction(delta);
        }


        /*
        let distancia = this.object.position.distanceTo(this.player.getCamPosition());
        this.testeColisao();
        if (distancia > 3) {
            this.object.lookAt(this.player.getCamPosition());
            this.wallCollision();
            this.bb.setFromObject(this.mesh);
        }
        */
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

    wallCollision(){
        const quaternion = this.object.quaternion;
        let direcao = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);

        this.rayWall.set(this.object.position, direcao);

        const objects = getParedes().concat(getChao());
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);

        if (intersectedObjects.length > 0) {
            let normal = intersectedObjects[0].face.normal;

            normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersectedObjects[0].object.matrixWorld)).normalize();
            
            let dNova = direcao.clone().projectOnPlane(normal); // Projeta a direção no plano para não atravessar paredes
            direcao = dNova.normalize();
        }

        this.object.position.addScaledVector(direcao, this.velocidade);
    }

    //#region MÁQUINA DE ESTADOS

    enterIdle(){
        if(this.estado === "idle") return;

        this.altura = this.object.position.y;
        this.updateFunction = this.idle.bind(this);
        this.estado = "idle";
    }

    idle(delta){
        let seno = Math.sin(this.clock.getElapsedTime() * 2);

        this.object.position.y = this.altura + seno;
        this.bb.setFromObject(this.mesh);
    }

    enterAttack(){
        if(this.estado === "attack") return;

        this.updateFunction = this.attack.bind(this);
        this.estado = "attack";
    }

    attack(delta){

    }
    //#endregion

}

export { InimigoLostSoul };