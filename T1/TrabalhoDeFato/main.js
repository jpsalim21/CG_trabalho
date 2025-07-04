import * as THREE from "three";
import {initRenderer, 
        initDefaultBasicLight,
} from "../libs/util/util.js";
import { PlayerController } from "./player2.js";
import { inicializaCenario } from "./cenario.js";
import { Chave } from "./chave.js";
import { InimigoBase } from "./inimigoBase.js";
import { InimigoLostSoul } from "./inimigoLostSoul.js";

const scene = new THREE.Scene();
let renderer = initRenderer(); // inicializa o renderizador com um rosa muito massa

let light = initDefaultBasicLight(scene);

inicializaCenario(scene); // inicializa o chão


const player = new PlayerController(scene, renderer);
player.start();

const chave1 = new Chave(scene, player.bb); // cria a chave
//const inimigo = new InimigoBase(scene, 100, 10); // cria o inimigo

const inimigoLostSoul = new InimigoLostSoul(scene, 50, 5, player);