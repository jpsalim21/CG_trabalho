import * as THREE from "three";
import {initRenderer, 
        initDefaultBasicLight,
} from "../libs/util/util.js";
import { PlayerController } from "./player2.js";
import { inicializaCenario } from "./cenario.js";
import { Chave } from "./chave.js";
import { InimigoBase } from "./inimigoBase.js";
import { InimigoLostSoul } from "./inimigoLostSoul.js";
import { AreaTrigger } from "./areaTrigger.js";
import { Elevador } from "./elevador.js";

const scene = new THREE.Scene();
let renderer = initRenderer(); // inicializa o renderizador com um rosa muito massa

inicializaCenario(scene); // inicializa o chão


const player = new PlayerController(scene, renderer);
player.start();

const chave1 = new Chave(scene, player.bb); // cria a chave
//const inimigo = new InimigoBase(scene, 100, 10); // cria o inimigo

const areaTrigger = new AreaTrigger(scene, new THREE.Vector3(-160, 0, 0), new THREE.Vector3(10, 10, 10), player);

new InimigoLostSoul(scene, 20, 5, player, areaTrigger);

new Elevador(scene, new THREE.Vector3(50, 0, 50), player);

// Iluminação

let lightPosition = new THREE.Vector3(10, 100, 10);
let lightColor = new THREE.Color('rgb(255, 255, 255)');
let dirLight = new THREE.DirectionalLight(lightColor, 3);
dirLight.position.copy(lightPosition);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 600;
dirLight.shadow.camera.left = -500;
dirLight.shadow.camera.right = 500;
dirLight.shadow.camera.top = 500;
dirLight.shadow.camera.bottom = -500;
dirLight.shadow.bias = -0.0001; // Ajuste fino do viés da sombra
dirLight.shadow.radius = 2; // Suavização das sombras


let lightPosition2 = new THREE.Vector3(-30, 100, -30);
let dirLight2 = new THREE.DirectionalLight(lightColor, 1);
dirLight2.position.copy(lightPosition2);
dirLight2.castShadow = true;
dirLight2.shadow.mapSize.width = 1024;
dirLight2.shadow.mapSize.height = 1024;
dirLight2.shadow.camera.near = 0.5;
dirLight2.shadow.camera.far = 600;
dirLight2.shadow.camera.left = -500;
dirLight2.shadow.camera.right = 500;
dirLight2.shadow.camera.top = 500;
dirLight2.shadow.camera.bottom = -500;
dirLight2.shadow.bias = -0.0001; // Ajuste fino do viés da sombra
dirLight2.shadow.radius = 2; // Suavização das sombras

scene.add(dirLight);
scene.add(dirLight2);