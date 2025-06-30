import * as THREE from "three";
import {initRenderer, 
        initDefaultBasicLight,
} from "../libs/util/util.js";
import { PlayerController } from "./player2.js";
import { inicializaCenario } from "./cenario.js";
import { Chave } from "./chave.js";

const scene = new THREE.Scene();
let renderer = initRenderer(); // inicializa o renderizador com um rosa muito massa

let light = initDefaultBasicLight(scene);

inicializaCenario(scene); // inicializa o chão


const player = new PlayerController(scene, renderer);
player.start();

const chave1 = new Chave(scene, player.bb); // cria a chave
