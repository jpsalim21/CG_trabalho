import * as THREE from "three";
import { initRenderer, initDefaultBasicLight } from "../libs/util/util.js";
import { PlayerController } from "./player2.js";
import { inicializaCenario } from "./cenario.js";
import { Chave } from "./chave.js";
import { InimigoBase } from "./inimigoBase.js";
import { InimigoLostSoul } from "./inimigoLostSoul.js";
import { Cacodemon } from "./cacodemon.js";
import { AreaTrigger } from "./areaTrigger.js";
import { Elevador } from "./elevador.js";

const scene = new THREE.Scene();
let renderer = initRenderer();
renderer.setClearColor(0x70AFDA); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const player = new PlayerController(scene, renderer);

inicializaCenario(scene, player);

player.start();

const chave1 = new Chave(scene, player.bb); // cria a chave
//const inimigo = new InimigoBase(scene, 100, 10); // cria o inimigo

const areaTrigger = new AreaTrigger(
	scene,
	new THREE.Vector3(-160, 0, 0),
	new THREE.Vector3(10, 10, 10),
	player
);

new Cacodemon(scene, player, areaTrigger, 10, new THREE.Vector3(-160, 6, 0));

new InimigoLostSoul(scene, 20, 5, player, areaTrigger);

new Elevador(scene, new THREE.Vector3(50, 0, 50), player);

// Iluminação

let lightColor = new THREE.Color('rgb(255, 255, 255)');
let ambientLight = new THREE.AmbientLight(lightColor, 0.5);

let lightPosition = new THREE.Vector3(80, 100, 80);
let dirLight = new THREE.DirectionalLight(lightColor, 1);
dirLight.position.copy(lightPosition);
dirLight.castShadow = false;

let lightPosition2 = new THREE.Vector3(-200, 200, -200);
let dirLight2 = new THREE.DirectionalLight(lightColor, 3);
dirLight2.position.copy(lightPosition2);
dirLight2.castShadow = true;
dirLight2.shadow.mapSize.width = 1024;
dirLight2.shadow.mapSize.height = 1024;
dirLight2.shadow.camera.near = 0.5;
dirLight2.shadow.camera.far = 600;
dirLight2.shadow.camera.left = -250;
dirLight2.shadow.camera.right = 250;
dirLight2.shadow.camera.top = 250;
dirLight2.shadow.camera.bottom = -250;
dirLight2.shadow.bias = -0.001; 
dirLight2.shadow.radius = 2;

scene.add(ambientLight);
scene.add(dirLight);
scene.add(dirLight2);