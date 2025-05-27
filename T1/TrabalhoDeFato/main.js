import * as THREE from "three";
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
} from "../../libs/util/util.js";
import { PlayerController } from "./player2.js";
import { inicializaCenario } from "./cenario.js";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });

const scene = new THREE.Scene();
let renderer = initRenderer("rgb(235, 130, 216)"); // inicializa o renderizador com um rosa muito massa

let light = initDefaultBasicLight(scene);

inicializaCenario(scene); // inicializa o chão

// salim e mariana, pra colocar componentes de camera e movimento no arquvivo principal usem desta forma:
const player = new PlayerController(scene, renderer);
// const player = new PlayerController(scene, renderer);
player.start();


const normal = new THREE.Vector3(1, 0, 0);

const direcao = new THREE.Vector3(1, 0, 1).normalize();

const projection = direcao.clone().projectOnPlane(normal);
console.log("Direção:", projection);
