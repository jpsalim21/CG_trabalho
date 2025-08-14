import * as THREE from "three";
import { initRenderer, initDefaultBasicLight } from "../libs/util/util.js";
import { PlayerController } from "./src/personagens/player2.js";
import { inicializaCenario } from "./src/cenario/cenario.js";
import { GameController } from "./src/controller/gamecontroller.js";
import { PainElemental } from "./src/personagens/inimigoPainElemental.js";

const scene = new THREE.Scene();
let renderer = initRenderer();
renderer.setClearColor(0x70AFDA); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.localClippingEnabled = true; 

new GameController();

const player = new PlayerController(scene, renderer);

inicializaCenario(scene, player, renderer);

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
dirLight2.shadow.mapSize.width = 2048; // aumentado para melhor qualidade
dirLight2.shadow.mapSize.height = 2048;
dirLight2.shadow.camera.near = 0.1; // mais próximo
dirLight2.shadow.camera.far = 800; // mais longe
dirLight2.shadow.camera.left = -300; // área maior para cobrir melhor
dirLight2.shadow.camera.right = 300;
dirLight2.shadow.camera.top = 300;
dirLight2.shadow.camera.bottom = -300;
dirLight2.shadow.bias = -0.005; // bias mais forte
dirLight2.shadow.radius = 3; // sombra mais suave

scene.add(ambientLight);
scene.add(dirLight);
scene.add(dirLight2);

// sistema de controle de iluminação para o hangar
class LightingController {
  constructor() {
    this.mainLight = dirLight2; // luz principal que projeta sombra
    this.hangarLight = null; // luz do hangar 
    this.isInHangar = false;
    this.originalIntensity = dirLight2.intensity;
    
    // Cria a luz específica do hangar (mais fraca)
    this.createHangarLight();
  }

  createHangarLight() {
    const hangarLightColor = new THREE.Color('rgb(200, 200, 180)'); // luz mais amarelada
    this.hangarLight = new THREE.DirectionalLight(hangarLightColor, 1.5); // mais fraca que a principal
    this.hangarLight.position.set(150, 150, -50); // posicionada para iluminar o hangar
    this.hangarLight.castShadow = false; // não projeta sombra
    this.hangarLight.visible = false; // inicialmente desligada
    scene.add(this.hangarLight);
  }

  enterHangar() {
    if (!this.isInHangar) {
      console.log("Jogador entrou no hangar - mudando iluminação");
      this.isInHangar = true;
      // diminui drasticamente a luz principal
      this.mainLight.intensity = 0.3;
      // liga a luz do hangar
      this.hangarLight.visible = true;
      // reduz a luz ambiente
      ambientLight.intensity = 0.2;
    }
  }

  exitHangar() {
    if (this.isInHangar) {
      console.log("Jogador saiu do hangar - restaurando iluminação");
      this.isInHangar = false;
      // restaura a luz principal
      this.mainLight.intensity = this.originalIntensity;
      // desliga a luz do hangar
      this.hangarLight.visible = false;
      // restaura a luz ambiente
      ambientLight.intensity = 0.5;
    }
  }
}

// cria o controlador de iluminação global
window.lightingController = new LightingController();

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

let pe = new PainElemental(scene, player, null, 10, new THREE.Vector3(0, 3, -80));