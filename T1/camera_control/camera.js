import * as THREE from "three";
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
} from "../../libs/util/util.js";
import { PlayerController } from "./player.js";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });

const scene = new THREE.Scene();

let light = initDefaultBasicLight(scene);

const groundTexturePath = "../../assets/textures/wood.png"; // caminho da textura do chão
const loader = new THREE.TextureLoader();
const groundTexture = loader.load(groundTexturePath);
groundTexture.colorSpace = THREE.SRGBColorSpace;
groundTexture.wrapS = THREE.MirroredRepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping; // repetição vertical para garantir que o chão não fique descontinuo ou desigual
groundTexture.repeat.set(15, 15); // muito chão
const planeGeometry = new THREE.PlaneGeometry(50, 50, 5); 
let ground = new THREE.Mesh(planeGeometry, material);
ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
scene.add(ground);


// salim e mariana, pra colocar componentes de camera e movimento no arquvivo principal usem desta forma:
const player = new PlayerController(scene, initRenderer);
player.start();
