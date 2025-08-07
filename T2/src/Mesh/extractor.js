import * as THREE from 'three';
import { GLTFLoader } from '../../../build/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../../../build/jsm/loaders/OBJLoader.js';
import { SpriteMixer } from '../../sprites/SpriteMixer.js';

const loaderOBJ = new OBJLoader();
const texLoader = new THREE.TextureLoader();
const spriteMixer = SpriteMixer();

function loadOBJ(path, texturePath, tex, normal, rough, metal, metalness = 0.5, roughness = 1.0) {
    return new Promise((resolve, reject) => {
        const texture = texLoader.load(texturePath + tex);
        const normalMap = texLoader.load(texturePath + normal);
        const roughnessMap = texLoader.load(texturePath + rough);
        const metalnessMap = texLoader.load(texturePath + metal);

        return loaderOBJ.load(
            path,
            (object) => {
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    normalMap: normalMap,
                    roughnessMap: roughnessMap,
                    metalnessMap: metalnessMap,
                    metalness: metalness,
                    roughness: roughness,
                });
                
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material = material;
                        child.material.transparent = true;
                    }
                });
                
                resolve(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the model:', error);
                reject(error);
            }
        )
    });
}

function loadGLTF(path){
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                resolve(gltf.scene);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the glTF model:', error);
                reject(error);
            }
        );
    });
}

function loadSprite(path){


    this.spriteMixer = SpriteMixer();
            texLoader.load('./assets/textures/chaingun.png', (texture) => {
                const chaingunSprite = this.spriteMixer.ActionSprite(texture, 3, 1);
                chaingunSprite.position.set(0, -0.5 , -2.0);
                chaingunSprite.scale.set(0.8, 0.8, 0.8);
                
                this.weapons[1] = {
                    object: chaingunSprite,
                    actions: {
                        idle: this.spriteMixer.Action(chaingunSprite, 0, 0, 100),
                        shoot: this.spriteMixer.Action(chaingunSprite, 1, 4, 80) // movimento de tiro, começando no frame 1 e terminando no frame 4, com 80ms por frame
                    },
                    isShooting: false
                };
                this.camera.add(chaingunSprite); 
                chaingunSprite.visible = (this.activeWeapon === 1); 
            });
}

export { loadOBJ, loadGLTF };