import * as THREE from 'three';
import { GLTFLoader } from '../../../build/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../../../build/jsm/loaders/OBJLoader.js';

const loaderOBJ = new OBJLoader();
const texLoader = new THREE.TextureLoader();

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

export { loadOBJ, loadGLTF };