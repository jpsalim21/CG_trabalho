import { InimigoBase } from "./inimigoBase.js";
import { OBJLoader } from '../../build/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { BulletPool } from "./disparo.js";

const path = "../assets/skull.obj";
const texturePath = "../assets/skul/";


class InimigoLostSoul extends InimigoBase {
    constructor(scene, vida, ataque, player, velocidade = 0.05) {
        super(scene, vida, ataque, player);
        this.player = player;
        this.velocidade = velocidade;
        this.rodando = true;

        this.bulletPool = this.player.getBulletPool();

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
                    }
                });

                this.mesh = object;
                this.mesh.position.set(0.325, -23, 2);
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
        this.mesh.visible = false;
        console.log("Lost Soul derrotada!");
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

}

export { InimigoLostSoul };