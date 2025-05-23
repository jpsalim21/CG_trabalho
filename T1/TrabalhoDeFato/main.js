import * as THREE from "three";
import {initRenderer, 
        initDefaultBasicLight,
        setDefaultMaterial,
} from "../../libs/util/util.js";
import { PlayerController } from "./player.js";
import { inicializaCenario } from "./cenario.js";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });

const scene = new THREE.Scene();

let light = initDefaultBasicLight(scene);

inicializaCenario(scene); // inicializa o chão

// salim e mariana, pra colocar componentes de camera e movimento no arquvivo principal usem desta forma:
const player = new PlayerController(scene, initRenderer);
player.start();
