import * as THREE from 'three';
import { GLTFLoader } from '../../../build/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../../../build/jsm/loaders/OBJLoader.js';
import { SpriteMixer } from '../../sprites/SpriteMixer.js';

const loaderOBJ = new OBJLoader();
const texLoader = new THREE.TextureLoader();
const spriteMixer = SpriteMixer();

function loadOBJ(path, texturePath, tex, normal = "", rough = "", metal = "", metalness = 0.5, roughness = 1.0) {
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
                console.log((xhr.loaded / xhr.total * 100) + '% loaded ' + texturePath + tex);
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

function setMaterial(file, repeatU = 1, repeatV = 1, color = 'rgb(255,255,255)'){
    let mat = new THREE.MeshStandardMaterial({ map: texLoader.load(file), color:color, roughness: 0.8, metalness: 0.2});
    mat.map.colorSpace = THREE.SRGBColorSpace;
    mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
    mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
    mat.map.repeat.set(repeatU,repeatV); 
    return mat;
}

function loadGLB(path, texturePath, normal = "", diffuse = "", specular = "") {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        const normalMap = texLoader.load(texturePath + normal);
        const diffuseMap = texLoader.load(texturePath + diffuse);
        const specularMap = texLoader.load(texturePath + specular);

        loader.load(
            path,
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        //child.material.map = texture;
                        child.material.normalMap = normalMap;
                        child.material.metalness = 0.5;
                        child.material.roughness = 1.0;
                    }
                });
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

function createAdvancedMaterial(texturePath, diffuse, normal, emission, displacement, ao, repeatU = 1, repeatV = 1, options = {}) {
    const {
        metalness = 0.5,
        roughness = 1.0,
        displacementScale = 0.5,
        emissiveIntensity = 1.0,
        emissiveColor = 0x222222
    } = options;

    const material = new THREE.MeshStandardMaterial({
        map: texLoader.load(texturePath + diffuse),
        normalMap: texLoader.load(texturePath + normal),
        emissiveMap: texLoader.load(texturePath + emission),
        emissive: new THREE.Color(emissiveColor),
        emissiveIntensity: emissiveIntensity,
        displacementMap: texLoader.load(texturePath + displacement),
        displacementScale: displacementScale,
        aoMap: texLoader.load(texturePath + ao),
        metalness: metalness,
        roughness: roughness,
        transparent: true
    });

    material.map.colorSpace = THREE.SRGBColorSpace;
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(repeatU,repeatV);
    material.normalMap.wrapS = material.normalMap.wrapT = THREE.RepeatWrapping;
    material.normalMap.repeat.set(repeatU, repeatV);
    material.emissiveMap.wrapS = material.emissiveMap.wrapT = THREE.RepeatWrapping;
    material.emissiveMap.repeat.set(repeatU, repeatV);
    material.displacementMap.wrapS = material.displacementMap.wrapT = THREE.RepeatWrapping;
    material.displacementMap.repeat.set(repeatU, repeatV);
    return material;
}

// Adicione esta função ao seu extractor.js
function createLavaMaterial(repeatU = 1, repeatV = 1, options = {}) {
    const texturePath = "./assets/LavaTexture/";
    const {
        metalness = 0.1, // Lava geralmente não é metálica
        roughness = 0.8, // Lava tem superfície irregular
        displacementScale = 0.5,
        emissiveIntensity = 2.0, // Lava brilha bastante
        emissiveColor = 0xff4400 // Cor laranja/vermelha para lava
    } = options;

    const material = new THREE.MeshStandardMaterial({
        map: texLoader.load(texturePath + "Stylized_Lava_001_basecolor.png"), // Diffuse
        normalMap: texLoader.load(texturePath + "Stylized_Lava_001_normal.png"),
        roughnessMap: texLoader.load(texturePath + "Stylized_Lava_001_roughness.png"),
        aoMap: texLoader.load(texturePath + "Stylized_Lava_001_ambientOcclusion.png"), // Ambient Occlusion
        emissiveMap: texLoader.load(texturePath + "Stylized_Lava_001_emissive.png"),
        displacementMap: texLoader.load(texturePath + "Stylized_Lava_001_height.png"), // Height = Displacement
        
        emissive: new THREE.Color(emissiveColor),
        emissiveIntensity: emissiveIntensity,
        displacementScale: displacementScale,
        metalness: metalness,
        roughness: roughness,
        transparent: false // Lava geralmente não é transparente
    });

    // Configurações de repetição para todas as texturas
    const textures = [
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.aoMap,
        material.emissiveMap,
        material.displacementMap
    ];

    textures.forEach(texture => {
        if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatU, repeatV);
        }
    });

    return material;
}

function loadChessPiece(path, color= 'white'){
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: color,
                            metalness: 0.5,
                            roughness: 0.5
                        });
                    }
                });
                resolve(gltf.scene);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the chess piece model:', error);
                reject(error);
            }
        );
    });
}

export { loadOBJ, loadGLTF, setMaterial, loadGLB, createAdvancedMaterial, createLavaMaterial, loadChessPiece };