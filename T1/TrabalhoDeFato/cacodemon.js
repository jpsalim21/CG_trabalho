import * as THREE from 'three';
import { GLTFLoader } from '../../build/jsm/loaders/GLTFLoader.js';
import { InimigoBase } from './inimigoBase.js';
import { BulletPool } from './disparo.js';
import { getParedes, getChao } from './cenario.js'; 
import { GameController } from './gamecontroller.js';

const path = '../assets/cacodemon.glb';

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
        this.bulletPool = new BulletPool(scene, 0xffff00); 
        this.shootInterval = 5; // atira a cada 5 segundos
        this.lastShotTime = 0;

        // raycaster para colisão com paredes e posicionamento
        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 5; // aumentado para detectar o chão
        this.rayWall.near = 0.1;

        this.updateFunction = null;
        this.estado = null;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();
        this.clock = new THREE.Clock();
        this.clock.start();

        this.timeOnState = 0;

        // define a posição inicial mais próxima do chão 
        this.object.position.copy(initialPosition);
        this.distanceFromPlayer = 35; // distância fixa do jogador 
        this.angle = 0; // angulo inicial para o movimento
        this.maxAngle = Math.PI / 2; // limite do arco (90° ou π/2 radianos em cada direção)

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                this.mesh = gltf.scene;

                this.mesh.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.transparent = true; // habilita transparência
                    }
                });

                // escala do modelo
                this.mesh.scale.set(0.009, 0.009, 0.009); 

                // atualmente sem rotacao
                this.mesh.rotation.set(0, 0, 0); 

                this.setup();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Erro ao carregar o modelo:', error);
            }
        );
    }

    setup() {
        super.setup();

        // ajusta a posição acima do chão usando raycast
        this.adjustPositionAboveGround();

        // ajuste da posição do sprite de vida acima do modelo
        this.sprite.position.set(0, this.mesh.scale.y * 1000, 0); // ajuste proporcional à escala
        this.sprite.scale.set(2, 0.4, 1); // tamanho ajustado da barra de vida

        this.bb = new THREE.Box3().setFromObject(this.mesh);
        //this.bbHelper = new THREE.Box3Helper(this.bb, 0xffff00);
        //this.scene.add(this.bbHelper);

        this.enterIdle();
        this.rodando = true;

        // adiciona o mesh ao object (se ainda não estiver)
        if (!this.object.children.includes(this.mesh)) {
            this.object.add(this.mesh);
        }
    }

    // ajusta a posição do Cacodemon para ficar acima do chão
    adjustPositionAboveGround() {
        this.rayWall.set(this.object.position, new THREE.Vector3(0, -1, 0)); // raycast para baixo
        const intersects = this.rayWall.intersectObjects(getChao(), true);
        if (intersects.length > 0) {
            const groundY = intersects[0].point.y;
            this.object.position.y = groundY + 2.5; // subir 2.5 unidades acima do chão
        }
    }

    update() {
        if (!this.rodando) return;

        this.testeColisao();

        if (this.updateFunction) {
            const delta = this.clock.getDelta();
            this.updateFunction(delta);
            this.bb.setFromObject(this.mesh);
        }
    }

    testeColisao() {
        const objects = this.player.getBulletPool().getBulletsInUse();
        const bullet = objects.find(obj => this.bb.intersectsBox(obj.bb));
        if (bullet && this.rodando) { // verifica se ainda está rodando
            bullet.reset(); // faz a bala desaparecer ao colidir
            this.tomarDano(20);
            console.log("Cacodemon atingido!");
        }
    }

    wallCollision(dir, delta, scale = 1) {
        const quaternion = this.object.quaternion.clone();
        let direcao = dir.clone();
        direcao.applyQuaternion(quaternion);

        this.rayWall.set(this.object.position, direcao);

        const objects = getParedes().concat(getChao());
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);

        if (intersectedObjects.length > 0) {
            let normal = intersectedObjects[0].face.normal;
            normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersectedObjects[0].object.matrixWorld)).normalize();
            let dNova = direcao.clone().projectOnPlane(normal);
            direcao = dNova.normalize();
        }

        this.object.position.add(direcao.multiplyScalar(this.velocidade * delta * scale));
    }

    // máquina de estados
    enterIdle() {
        if (this.estado === 'idle') return;

        this.clockIdle.start();
        this.altura = this.object.position.y;
        this.updateFunction = this.idle.bind(this);
        this.estado = 'idle';
    }
    
    idle(delta) {
        let seno = Math.sin(this.clockIdle.getElapsedTime() * 2);
        this.object.position.y = this.altura + seno * 0.5; // movimento vertical suave
        this.bb.setFromObject(this.mesh);
    } 

    enterTriggered() {
        if (this.estado === 'triggered') return;

        this.timeOnState = 0;
        this.dirSignal = Math.random() < 0.5 ? -1 : 1; // direção inicial (esquerda ou direita)
        this.angle = this.initialAngle; // ângulo inicial aleatório
        this.updateFunction = this.triggered.bind(this);
        this.estado = 'triggered';

        // ajusta a posição inicial para a distância fixa ao entrar no estado triggered
        this.adjustToFixedDistance();
    }

    // ajusta a posição para manter a distância fixa do player
    adjustToFixedDistance() {
        let direcao = this.player.getCamPosition().clone().sub(this.object.position);
        let distance = direcao.length();
        direcao.y = 0;
        direcao.normalize();

        if (distance < this.distanceFromPlayer) {
            let correction = direcao.multiplyScalar(this.distanceFromPlayer - distance);
            this.object.position.add(correction);
        } else if (distance > this.distanceFromPlayer) {
            let correction = direcao.multiplyScalar(distance - this.distanceFromPlayer);
            this.object.position.sub(correction);
        }
    }

    triggered(delta) {
        if (!this.rodando) return; // evita processamento se já morreu

        this.timeOnState += delta;

        // calcula a posição circular ao redor do player
        let playerPos = this.player.getCamPosition().clone();
        let direcao = playerPos.clone().sub(this.object.position);
        direcao.y = 0;
        direcao.normalize();

        // atualiza o ângulo com limite para criar um arco
        const angleSpeed = this.angularSpeed * delta // velocidade angular
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
        let x = playerPos.x + radius * Math.cos(this.angle);
        let z = playerPos.z + radius * Math.sin(this.angle);
        let newPosition = new THREE.Vector3(x, this.object.position.y, z);

        // suaviza a transição para a nova posição
        this.object.position.lerp(newPosition, 0.05); // interpolação suave
        this.object.lookAt(playerPos);

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
        const duration = 0.7; // ajustado para 0.7 segundos, igual ao Lost Soul
        function animateFadeOut(timestamp) {
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
                console.log("Tomei dano ", this);
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