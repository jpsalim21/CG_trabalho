import { InimigoBase } from "./inimigoBase.js";
import { OBJLoader } from '../../build/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { BulletPool } from "./disparo.js";
import { getParedes, getChao } from "./cenario.js";

const path = "../assets/skullMelhor.obj";
const texturePath = "../assets/skul/";


class InimigoLostSoul extends InimigoBase {
    constructor(scene, vida, ataque, player, velocidade = 0.05) {
        super(scene, vida, ataque, player);
        this.player = player;
        this.velocidade = velocidade;
        this.rodando = true;

        this.bulletPool = this.player.getBulletPool();

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;

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

        this.bb = new THREE.Box3().setFromObject(this.mesh);
        this.bbHelper = new THREE.Box3Helper(this.bb, 0xffff00);
        this.scene.add(this.bbHelper);

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
    }

    update(){
        if (!this.rodando) return;

        let distancia = this.object.position.distanceTo(this.player.getCamPosition());
        this.testeColisao();
        if (distancia > 3) {
            this.object.lookAt(this.player.getCamPosition());
            this.object.translateZ(this.velocidade);
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

    wallCollision(){
        const quaternion = this.object.quaternion;
        let direcao = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);

        this.rayWall.set(this.object.position, direcao);

        const objects = getParedes().concat(getChao());
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);




    }

}

export { InimigoLostSoul };