import * as THREE from 'three';
import { GLTFLoader } from '../../../build/jsm/loaders/GLTFLoader.js';
import { InimigoBase } from './inimigoBase.js';
import { BulletPool } from './disparo.js';
import { getParedes, getChao } from '../cenario/cenario.js';
import { GameController } from '../controller/gamecontroller.js';
import { loadGLTF } from '../Mesh/extractor.js';

const path = './assets/cacodemon.glb';
const GRAVIDADE = 25;

class Cacodemon extends InimigoBase {
    constructor(scene, player, observer, velocidade = 10, initialPosition = new THREE.Vector3(0, 5, 0)) {
        super(scene, 50, 10, player, observer); // 50 HP, 10 de ataque
        this.velocidade = velocidade;
        this.rodando = true;
        this.player = player;

        //variacoes de movimento para nao ficarem se juntando
        this.angularSpeed = 0.08 + Math.random() * 0.04; // velocidade angular entre 0.08 e 0.12
        this.initialAngle = Math.random() * Math.PI * 2; // angulo inicial aleatório (0 a 360°)
        this.maxAngle = (Math.PI / 2) + (Math.random() * Math.PI / 2); // limite de ângulo entre 90° e 180°

        // pool de projéteis amarelos para o Cacodemon
        this.bulletPool = new BulletPool(scene, false);
        this.shootInterval = 5; // atira a cada 5 segundos
        this.lastShotTime = 0;

        // raycaster para colisão com paredes e posicionamento
        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 5;
        this.rayWall.near = 0.1;

        this.updateFunction = null;
        this.estado = null;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();
        this.clock = new THREE.Clock();
        this.clock.start();

        this.timeOnState = 0;

        // Controle de inicialização para evitar queda imediata
        this.initializationTime = 0;
        this.initializationDelay = 0.5; // 500ms de delay antes de aplicar gravidade
        this.initialized = false;

        // define a posição inicial
        this.object.position.copy(initialPosition);
        this.distanceFromPlayer = 35; // distância fixa do jogador
        this.angle = 0; // angulo inicial para o movimento
        this.maxAngle = Math.PI / 2; // limite do arco (90° ou π/2 radianos em cada direção)

        this.velVertical = 0;
        this.hoverHeight = 5.0;

        this.loadModel();
    }

    async loadModel() {
        try {
            this.mesh = await loadGLTF(path);
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true; // habilita transparência
                }
            });
            this.mesh.scale.set(0.009, 0.009, 0.009); // escala do modelo
            this.mesh.rotation.set(0, 0, 0); // atualmente sem rotação
            this.setup();
        } catch (error) {
            console.error('Error loading model:', error);
            return;
        }
    }

    setup() {
        super.setup();
        // ajuste da posição do sprite de vida acima do modelo
        this.sprite.position.set(0, this.mesh.scale.y * 1000, 0); // ajuste proporcional à escala
        this.sprite.scale.set(2, 0.4, 1); // tamanho ajustado da barra de vida

        this.bb = new THREE.Box3().setFromObject(this.mesh);

        this.enterIdle();
        this.rodando = true;
        // adiciona o mesh ao object (se ainda não estiver)
        if (!this.object.children.includes(this.mesh)) {
            this.object.add(this.mesh);
        }
    }

    applyGravity(delta) {
        this.rayWall.set(this.object.position, new THREE.Vector3(0, -1, 0));
        const intersects = this.rayWall.intersectObjects(getChao(), true);

        let groundY = -Infinity;
        if (intersects.length > 0) {
            groundY = intersects[0].point.y;
        }

        const targetY = groundY + this.hoverHeight;

        if (this.object.position.y <= targetY && this.velVertical < 0) {
            this.velVertical = 0;
            this.object.position.y = targetY;
        } else {
            this.velVertical -= GRAVIDADE * delta;
            this.object.position.y += this.velVertical * delta;
        }
    }

    update() {
        if (!this.rodando) return;

        const delta = this.clock.getDelta();

        // Controle de inicialização
        this.initializationTime += delta;
        if (this.initializationTime >= this.initializationDelay) {
            this.initialized = true;
        }

        // Só aplica gravidade após o período de inicialização
        if (this.initialized) {
            this.applyGravity(delta);
        } else {
            // Durante a inicialização, mantém a posição Y estável
            this.bb.setFromObject(this.mesh);
        }
        
        this.testeColisao();

        if (this.updateFunction) {
            this.updateFunction(delta);
            this.bb.setFromObject(this.mesh);
        }
    }

    testeColisao() {
        const objects = this.player.getBulletPool().getBulletsInUse();
        const bullet = objects.find(obj => this.bb.intersectsBox(obj.bb));
        if (bullet && this.rodando) { // verifica se ainda está rodando
            bullet.reset(); // faz a bala desaparecer ao colidir
            this.tomarDano(10);
            console.log("Cacodemon atingido!");
        }
    }

    // máquina de estados
    enterIdle() {
        if (this.estado === 'idle') return;
        this.clockIdle.start();
        this.updateFunction = this.idle.bind(this);
        this.estado = 'idle';
    }

    idle(delta) {
        let seno = Math.sin(this.clockIdle.getElapsedTime() * 2);
        this.object.position.y += seno * 0.005; // movimento vertical suave
        this.bb.setFromObject(this.mesh);
    }

    enterTriggered() {
        if (this.estado === 'approaching' || this.estado === 'circling') return;
        this.timeOnState = 0;
        this.updateFunction = this.approaching.bind(this);
        this.estado = 'approaching';
    }

    approaching(delta) {
        if (!this.rodando) return;

        const playerPos = this.player.getCamPosition();
        let direcao = playerPos.clone().sub(this.object.position);

        const distanceXZ = new THREE.Vector2(direcao.x, direcao.z).length();

        if (distanceXZ <= this.distanceFromPlayer) {
            this.enterCircling();
            return;
        }

        direcao.y = 0;
        direcao.normalize();

        // wallslide
        this.rayWall.set(this.object.position, direcao);
        const objects = getParedes();
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);

        // se o raio atingir um obstáculo próximo
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < 2.5) {
            // pega a normal da face do obstáculo (a direção "para fora" da parede)
            const normal = intersectedObjects[0].face.normal.clone();
            
            // projeta o vetor de direção no plano da parede, criando o efeito de "deslizar"
            direcao.projectOnPlane(normal);
        }
        
        // move o Cacodemon na direção final (original ou de deslizamento)
        this.object.position.add(direcao.multiplyScalar(this.velocidade * delta));
        this.object.lookAt(playerPos);
    }


    enterCircling() {
        if (this.estado === 'circling') return;
        this.timeOnState = 0;
        this.dirSignal = Math.random() < 0.5 ? -1 : 1; // direção inicial (esquerda ou direita)

        this.playerPos = this.player.getCamPosition();
        const vectorToEnemy = this.object.position.clone().sub(this.playerPos);
    
        this.angle = Math.atan2(vectorToEnemy.z, vectorToEnemy.x);
        
        this.updateFunction = this.circling.bind(this);
        this.estado = 'circling';;
    }

    circling(delta) {
        if (!this.rodando) return; // evita processamento se já morreu

        this.timeOnState += delta;
        this.playerPos.y = this.object.position.y;

        // atualiza o ângulo com limite para criar um arco
        const angleSpeed = this.angularSpeed * delta; // velocidade angular
        this.angle += this.dirSignal * angleSpeed;

        // limita o ângulo entre -maxAngle e +maxAngle (ex.: ±90°)
        if (this.angle > this.maxAngle) {
            this.angle = this.maxAngle;
            this.dirSignal = -1; // inverte a direção para voltar
        } else if (this.angle < -this.maxAngle) {
            this.angle = -this.maxAngle;
            this.dirSignal = 1; // inverte a direção para avançar
        }

        let radius = this.distanceFromPlayer;
        let x = this.playerPos.x + radius * Math.cos(this.angle);
        let z = this.playerPos.z + radius * Math.sin(this.angle);
        
        let targetPosition = new THREE.Vector3(x, this.object.position.y, z);
        
        let directionToTarget = targetPosition.clone().sub(this.object.position);
        
        // evita que o "normalize" dê erro se o vetor for zero
        if (directionToTarget.length() === 0) return;
        
        let distanceToTarget = directionToTarget.length();
        directionToTarget.normalize();

        // checagem de colisão
        this.rayWall.set(this.object.position, directionToTarget);
        const objects = getParedes();
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);
        
        // truque para o modo circular: se encontrar um obstáculo, apenas inverte a direção
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < distanceToTarget) {
            this.dirSignal *= -1; // inverte a direção do círculo para desviar
        } else {
            // suaviza a transição para a nova posição
            this.object.position.lerp(targetPosition, 0.05); // interpolação suave
        }

        this.object.lookAt(this.player.getCamPosition());

        // atira periodicamente
        const currentTime = this.clock.getElapsedTime();
        if (currentTime - this.lastShotTime >= this.shootInterval) {
            this.shoot();
            this.lastShotTime = currentTime;
        }
    }

    shoot() {
        const posicao = this.object.position.clone();
        const alvo = this.player.getCamPosition().clone();
        this.bulletPool.atirar(posicao, alvo);
    }

    tomarDano(dano) {
        super.tomarDano(dano);
        if (this.vida <= 0 && this.rodando) {
            this.morrer();
        }
    }

    morrer() {
        if (!this.rodando) return;
        this.rodando = false;
        const mesh = this.mesh;
        if (!mesh) {
            this.destructor();
            return;
        }
        let start = null;
        const initialOpacities = [];
        mesh.traverse(child => {
            if (child.isMesh && child.material) {
                initialOpacities.push(child.material.opacity ?? 1);
            }
        });
        const metodoDestructor = this.destructor.bind(this);
        const duration = 0.7; // ajustei para 0.7 segundos, igual ao lostsoul
        const animateFadeOut = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = (timestamp - start) / 1000;
            const t = Math.min(elapsed / duration, 1);
            let i = 0;
            mesh.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.opacity = initialOpacities[i] * (1 - t);
                    i++;
                }
            });
            if (t < 1) {
                requestAnimationFrame(animateFadeOut);
            } else {
                metodoDestructor();
            }
        }
        requestAnimationFrame(animateFadeOut);
    }

    destructor() {
        GameController.instance.inimigoMorreu(this);
        this.observer.removeListener(this);
        if (this.bbHelper && this.scene) this.scene.remove(this.bbHelper);
        if (this.mesh && this.scene) this.scene.remove(this.mesh);
        if (this.object && this.scene) this.scene.remove(this.object);
        this.mesh = null;
        this.bbHelper = null;
        if (this.bulletPool) this.bulletPool = null;
        if (this.clock) this.clock.stop();
        this.clock = null;
    }
}

export { Cacodemon };