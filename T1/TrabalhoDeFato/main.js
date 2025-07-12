import * as THREE from "three";
import { initRenderer, initDefaultBasicLight } from "../libs/util/util.js";
import { PlayerController } from "./player2.js";
import { inicializaCenario } from "./cenario.js";
import { GameController } from "./gamecontroller.js";

const scene = new THREE.Scene();
let renderer = initRenderer();
renderer.setClearColor(0x70AFDA); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

new GameController();

const player = new PlayerController(scene, renderer);

inicializaCenario(scene, player);

player.start();

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

// objetivos
class MessageSystem {
  constructor() {
    this.container = document.getElementById('temporary-messages-container');
    this.messageQueue = [];
    this.isShowing = false;
  }

  showMessage(text, duration = 5000) {
    this.messageQueue.push({ text, duration });
    if (!this.isShowing) this.processQueue();
  }

  processQueue() {
    if (this.messageQueue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const { text, duration } = this.messageQueue.shift();
    
    const messageElement = document.createElement('div');
    messageElement.className = 'temporary-message';
    messageElement.textContent = text;
    
    this.container.appendChild(messageElement);
    
    setTimeout(() => {
      messageElement.remove();
      setTimeout(() => this.processQueue(), 300); // delay
    }, duration);
  }
}

const messageSystem = new MessageSystem();
window.showTemporaryMessage = (text, duration) => messageSystem.showMessage(text, duration);

