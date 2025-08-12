import * as THREE from 'three';
import { InimigoBase } from './inimigoBase.js';
import { SpriteMixer } from '../../sprites/SpriteMixer.js';
import { getParedes, getChao } from "../cenario/cenario.js";
import { GameController } from "../controller/gamecontroller.js";

const textureLoader = new THREE.TextureLoader();

export class Zombieman extends InimigoBase {
    constructor(scene, player, position, observer) {
        super(scene, 30, 10, player, observer);

        this.spritePath = './assets/zombieman.png';
        this.spriteMixer = null;
        this.actions = {};
        this.actionSprite = null;

        this.hangarBounds = new THREE.Box3(
            new THREE.Vector3(102, 0, -198),
            new THREE.Vector3(198, 25, -102)
        );
        this.initialPosition = position;
        
        this.zombieId = Math.floor(Math.random() * 1000);
        
        this.player = player;
        this.velocidade = 3;
        this.rodando = true;
        this.bulletPool = this.player.getBulletPool();

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;
        this.rayGround = new THREE.Raycaster();
        this.rayGround.far = 1.0;
        this.rayGround.near = 0.1;

        this.updateFunction = null;
        this.estado = null;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();
        this.clock = new THREE.Clock();
        this.clock.start();

        this.timeOnState = 0;
        this.maxTime = 5;

        this.sinOffset = Math.random() * 2 * Math.PI;

        this.currentAnimation = null;
        this.idleState = 'waiting'; 
        this.patrolTarget = new THREE.Vector3(); 
        this.patrolAreaSize = 15; 


        this.load();
        this.scene.add(this.object);
    }

    load() {
        textureLoader.load(this.spritePath, (texture) => {
            this.spriteMixer = SpriteMixer();
            this.actionSprite = this.spriteMixer.ActionSprite(texture, 8, 8);
            
            this.actionSprite.material.depthWrite = true;
            this.actionSprite.material.depthTest = true;
            this.actionSprite.material.alphaTest = 0.5;
            
            this.actionSprite.position.y = -0.3;
            this.actionSprite.setFrame(0, 0);
            this.actionSprite.scale.set(3, 3, 1);
            
            this.actions.runDown = this.spriteMixer.Action(this.actionSprite, 100, 0, 0, 3, 0);
            this.actions.runLD = this.spriteMixer.Action(this.actionSprite, 100, 0, 1, 3, 1);
            this.actions.runLeft = this.spriteMixer.Action(this.actionSprite, 100, 0, 2, 3, 2);
            this.actions.runLU = this.spriteMixer.Action(this.actionSprite, 100, 0, 3, 3, 3);
            this.actions.runUp = this.spriteMixer.Action(this.actionSprite, 100, 0, 4, 3, 4);
            this.actions.runRU = this.spriteMixer.Action(this.actionSprite, 100, 0, 5, 3, 5);
            this.actions.runRight = this.spriteMixer.Action(this.actionSprite, 100, 0, 6, 3, 6);
            this.actions.runRD = this.spriteMixer.Action(this.actionSprite, 100, 0, 7, 3, 7);

            this.actions.Die = this.spriteMixer.Action(this.actionSprite, 150, 7, 0, 7, 5);
            
            this.actions.Die.hideWhenFinished = false;
            this.actions.Die.clampWhenFinished = true;

            const shootSpeed = 120;
            this.actions.shootDown = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 0, 5, 0);
            this.actions.shootLD = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 1, 5, 1);
            this.actions.shootLeft = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 2, 5, 2);
            this.actions.shootLU = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 3, 5, 3);
            this.actions.shootUp = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 4, 5, 4);
            this.actions.shootRU = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 5, 5, 5);
            this.actions.shootRight = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 6, 5, 6);
            this.actions.shootRD = this.spriteMixer.Action(this.actionSprite, shootSpeed, 4, 7, 5, 7);

            this.mesh = this.actionSprite;

            this.actionSprite.userData.isEnemy = true;
            this.actionSprite.userData.inimigoInstance = this;

            this.object.position.copy(this.initialPosition);
            this.object.position.y = 2.2;
            
            this.testeMapaDirecoes();
            
            this.verificarAcoesTiro();
            
            this.setup();
        });
    }

    testeMapaDirecoes() {
        const testVectors = [
            { vec: new THREE.Vector3(1, 0, 0), expected: 'right', desc: 'X+' },
            { vec: new THREE.Vector3(-1, 0, 0), expected: 'left', desc: 'X-' },
            { vec: new THREE.Vector3(0, 0, 1), expected: 'down', desc: 'Z+' },
            { vec: new THREE.Vector3(0, 0, -1), expected: 'up', desc: 'Z-' },
            { vec: new THREE.Vector3(1, 0, 1), expected: 'rd', desc: 'X+Z+' },
            { vec: new THREE.Vector3(-1, 0, 1), expected: 'ld', desc: 'X-Z+' },
            { vec: new THREE.Vector3(1, 0, -1), expected: 'ru', desc: 'X+Z-' },
            { vec: new THREE.Vector3(-1, 0, -1), expected: 'lu', desc: 'X-Z-' }
        ];
    }

    verificarAcoesTiro() {
        const tirosEsperados = ['shootDown', 'shootLD', 'shootLeft', 'shootLU', 'shootUp', 'shootRU', 'shootRight', 'shootRD'];
        const tirosEncontrados = [];
        const tirosFaltando = [];
        
        tirosEsperados.forEach(tiro => {
            if (this.actions[tiro]) {
                tirosEncontrados.push(tiro);
            } else {
                tirosFaltando.push(tiro);
            }
        });
    }

    setup() {
        super.setup();
        this.bb = new THREE.Box3().setFromObject(this.mesh);
        
        // ajusta a barra de vida para o tamanho menor do zombieman
        if (this.sprite) {
            this.sprite.scale.set(1.5, 0.2, 1); 
            this.sprite.position.set(0, 2.5, 0); 
        }
        
        if (this.actionSprite && this.scene) {
            this.actionSprite.userData.isEnemy = true;
            this.actionSprite.userData.inimigoInstance = this;
            this.scene.add(this.actionSprite);
        }
        
        this.enterIdle();
        this.rodando = true;
    }

    update() {
       
        const delta = this.clock.getDelta();
        if (this.spriteMixer) {
            this.spriteMixer.update(delta);
        }
        
        if (this.actionSprite && !this.rodando) {
            if (!this.actionSprite.visible) {
                this.actionSprite.visible = true;
            }
            
            if (!this.actionSprite.parent) {
                if (this.scene) {
                    this.scene.add(this.actionSprite);
                }
            }
            
            if (this.object) {
                this.actionSprite.position.copy(this.object.position);
                this.actionSprite.position.y += -0.3; 
            }
        }

        if (!this.rodando) return;
        
        this.testeColisao();
        
        if (this.updateFunction) {
            if (this.actionSprite && this.player.camera) {
                const euler = new THREE.Euler();
                euler.setFromQuaternion(this.player.camera.quaternion, 'YXZ');
                this.actionSprite.rotation.y = euler.y;
                
                this.actionSprite.position.copy(this.object.position);
                this.actionSprite.position.y += -0.3;
            }
            
            this.updateFunction(delta);
            this.bb.setFromObject(this.mesh);
        }
    }

    testeColisao() {
        const objects = this.bulletPool.getBulletsInUse();
        const bullet = objects.find(obj => this.bb.intersectsBox(obj.bb));
        if (bullet) {
            bullet.reset();
            this.tomarDano(10);
        }
    }

    wallCollision(dir, delta, scale = 1) {
        const quaternion = this.object.quaternion.clone();
        let direcao = dir.clone();
        direcao.applyQuaternion(quaternion);

        const newPosition = this.object.position.clone().add(direcao.clone().multiplyScalar(this.velocidade * delta * scale));
        
        const tempBB = this.bb.clone();
        const offset = newPosition.clone().sub(this.object.position);
        tempBB.translate(offset);
        
        const objects = getParedes();
        let hasCollision = false;
        
        for (let obj of objects) {
            if (obj.geometry) {
                const objBB = new THREE.Box3().setFromObject(obj);
                if (tempBB.intersectsBox(objBB)) {
                    hasCollision = true;
                    break;
                }
            }
        }
        
        // se não há colisão por bounding box, usa raycasting para refinamento
        if (!hasCollision) {
            this.rayWall.set(this.object.position, direcao);
            const intersectedObjects = this.rayWall.intersectObjects(objects, true);

            if (intersectedObjects.length > 0) {
                let normal = intersectedObjects[0].face.normal;
                normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersectedObjects[0].object.matrixWorld)).normalize();
                let dNova = direcao.clone().projectOnPlane(normal);
                direcao = dNova.normalize();
            }
            
            this.object.position.add(direcao.multiplyScalar(this.velocidade * delta * scale));
        }
        // se há colisão, não move
        
        this.object.position.clamp(this.hangarBounds.min, this.hangarBounds.max);
    }

    groundCollision() {
        this.rayGround.set(this.object.position, new THREE.Vector3(0, -1, 0));
        const objects = getChao();
        const intersectedObjects = this.rayGround.intersectObjects(objects, true);

        if (intersectedObjects.length > 0) {
            const groundY = intersectedObjects[0].point.y;
            this.object.position.y = groundY + 2.2; 
        }
    }

    applyGravity(delta) {
        this.groundCollision(); 
    }

    enterIdle() {
        if (this.estado === "idle") return;

        if (this.currentAnimation && this.actions[this.currentAnimation]) {
            this.actions[this.currentAnimation].stop();
            this.currentAnimation = null;
        }

        this.estado = "idle";
        this.updateFunction = this.idle.bind(this);
        this.idleState = 'waiting'; // sempre começa 'esperando'
        this.timeOnState = 0;
        this.maxTime = 1 + Math.random() * 3; // tempo que ficará esperando
        
        if (this.actionSprite) {
            this.actionSprite.setFrame(0, 0); // frame de 'parado de frente'
        }
    }

    idle(delta) {
        this.applyGravity(delta);
        this.bb.setFromObject(this.mesh);

        const playerPos = this.player.getCamPosition();
        const distance = this.object.position.distanceTo(playerPos);
        if (distance < 45) { 
            this.enterChasing();
            return;
        }

        this.timeOnState += delta;

        if (this.idleState === 'waiting') {
            // fica parado por um tempo
            if (this.timeOnState > this.maxTime) {
                // tempo de espera acabou, começa a patrulhar
                this.idleState = 'patrolling';
                
                // define um novo alvo aleatório dentro da área de patrulha
                const randomX = this.initialPosition.x + (Math.random() - 0.5) * this.patrolAreaSize;
                const randomZ = this.initialPosition.z + (Math.random() - 0.5) * this.patrolAreaSize;
                this.patrolTarget.set(randomX, this.object.position.y, randomZ);
            }
        } 
        else if (this.idleState === 'patrolling') {
            // move-se em direção ao alvo
            const distanceToTarget = this.object.position.distanceTo(this.patrolTarget);

            // se chegou perto o suficiente do alvo, para e começa a esperar
            if (distanceToTarget < 1.0) {
                this.idleState = 'waiting';
                this.timeOnState = 0;
                this.maxTime = 2 + Math.random() * 4; 
                
                if (this.currentAnimation && this.actions[this.currentAnimation]) {
                    this.actions[this.currentAnimation].stop();
                    this.currentAnimation = null;
                }
                this.actionSprite.setFrame(0, 0); 
                return;
            }

            let direcao = this.patrolTarget.clone().sub(this.object.position).normalize();
            
            const patrolSpeed = this.velocidade * 0.5; 
            this.wallCollision(direcao, delta, 0.5);
            
            const animDirection = this.getDirectionRelativeToCamera(direcao);
            this.playAnimation(animDirection);
        }
    }

    enterTriggered() {
        this.enterChasing(); 
    }

    getDirectionFromVector(vector) {
        const angle = Math.atan2(vector.x, vector.z);
        let directionIndex = Math.round((angle + Math.PI) / (Math.PI / 4)) % 8;
        if (directionIndex < 0) directionIndex += 8;
        const directions = ['down', 'rd', 'right', 'ru', 'up', 'lu', 'left', 'ld'];
        return directions[directionIndex];
    }

    getDirectionRelativeToCamera(movementVector) {
        const moveDir = movementVector.clone().normalize();

        const camera = this.player.camera;
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0; 
        camDir.normalize();

        const camRight = new THREE.Vector3();
        camRight.crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

        const forwardDot = moveDir.dot(camDir);
        const rightDot = moveDir.dot(camRight);

        
        if (forwardDot > 0.707) {
            // Movendo-se principalmente para longe da câmera
            return 'up';
        }
        if (forwardDot < -0.707) {
            // Movendo-se principalmente em direção à câmera
            return 'down';
        }
        if (rightDot > 0.707) {
            // Movendo-se principalmente para a direita da câmera
            return 'right';
        }
        if (rightDot < -0.707) {
            // Movendo-se principalmente para a esquerda da câmera
            return 'left';
        }

        // Se não for nenhuma das anteriores, é uma diagonal
        if (forwardDot > 0 && rightDot > 0) {
            return 'ru'; // Longe e para a direita
        }
        if (forwardDot > 0 && rightDot < 0) {
            return 'lu'; // Longe e para a esquerda
        }
        if (forwardDot < 0 && rightDot > 0) {
            return 'rd'; // Perto e para a direita
        }
        if (forwardDot < 0 && rightDot < 0) {
            return 'ld'; // Perto e para a esquerda
        }

        // Fallback caso algo dê errado
        return 'down';
    }

    getDirectionToPlayer() {
        const playerPos = this.player.getCamPosition();
        const myPos = this.object.position;
        
        const dx = playerPos.x - myPos.x;
        const dz = playerPos.z - myPos.z;

        if (Math.abs(dx) > Math.abs(dz)) {
            if (dx > 0) {
                return dz > 0 ? 'rd' : (dz < 0 ? 'ru' : 'right');
            } else {
                return dz > 0 ? 'ld' : (dz < 0 ? 'lu' : 'left');
            }
        } else {
            if (dz > 0) {
                return dx > 0 ? 'rd' : (dx < 0 ? 'ld' : 'down');
            } else {
                return dx > 0 ? 'ru' : (dx < 0 ? 'lu' : 'up');
            }
        }
    }

    playAnimation(direction) {
        let actionName;
        switch(direction) {
            case 'down':  actionName = 'runDown'; break;
            case 'ld':    actionName = 'runLD'; break;
            case 'left':  actionName = 'runLeft'; break;
            case 'lu':    actionName = 'runLU'; break;
            case 'up':    actionName = 'runUp'; break;
            case 'ru':    actionName = 'runRU'; break;
            case 'right': actionName = 'runRight'; break;
            case 'rd':    actionName = 'runRD'; break;
            default:      actionName = 'runDown'; 
        }

        if (this.currentAnimation === actionName) return;

        if (this.currentAnimation && this.actions[this.currentAnimation]) {
            this.actions[this.currentAnimation].stop(); 
        }
        
        if (this.actions[actionName]) {
            this.actions[actionName].playLoop();
            this.currentAnimation = actionName; 
        } else {
            console.error(`ERRO: Animação ${actionName} não encontrada para direção ${direction}`);
        }
    }

    playAnimationFixed(direction) {
        let actionName;
        switch(direction) {
            case 'down': actionName = 'runDown'; break;
            case 'left': actionName = 'runLeft'; break;
            case 'up': actionName = 'runUp'; break;
            case 'right': actionName = 'runRight'; break;
            default: actionName = 'runDown';
        }
        
        if (this.actions[actionName]) {
            Object.values(this.actions).forEach(action => {
                if (action && action.isInLoop !== undefined) {
                    action.isInLoop = false;
                }
            });
            this.actions[actionName].playLoop();
        }
    }

    enterChasing() {
        if (this.estado === "chasing") return;
        this.estado = "chasing";
        this.timeOnState = 0;
        this.maxTime = 0.8 + Math.random() * 1.2; 
        this.updateFunction = this.chasing.bind(this);
    }

    chasing(delta) {
        const playerPos = this.player.getCamPosition();
        const distance = this.object.position.distanceTo(playerPos);
        
        if (distance > 40) {
            this.enterIdle();
            return;
        }
        
        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            const shootChance = distance < 15 ? 0.85 : 0.4;
            if (Math.random() < shootChance) {
                this.enterAiming();
            } else {
                this.enterRepositioning();
            }
            return;
        }

        let direcao = playerPos.clone().sub(this.object.position);
        direcao.y = 0;
        direcao.normalize();

        const animDirection = this.getDirectionRelativeToCamera(direcao);
        this.playAnimation(animDirection);

        this.wallCollision(direcao, delta, 1.5);
        this.applyGravity(delta);
    }

    enterAiming() {
        if (this.estado === "aiming") return;
        this.estado = "aiming";
        this.timeOnState = 0;
        this.maxTime = 1.5 + Math.random() * 1.0;
        this.updateFunction = this.aiming.bind(this);
        this.aimingStarted = false; 

        if (this.currentAnimation && this.actions[this.currentAnimation]) {
            this.actions[this.currentAnimation].stop();
            this.currentAnimation = null;
        }
    }

    aiming(delta) {
        this.applyGravity(delta);

        if (!this.aimingStarted) {
            const playerPos = this.player.getCamPosition();
            const targetVector = playerPos.clone().sub(this.object.position);

            const aimDirection = this.getDirectionRelativeToCamera(targetVector);

            const frameMap = { 'down': 0, 'ld': 1, 'left': 2, 'lu': 3, 'up': 4, 'ru': 5, 'right': 6, 'rd': 7 };
            const column = frameMap[aimDirection] || 0;
            
            this.actionSprite.setFrame(4, column); 
            this.currentAnimation = null;

            this.aimingStarted = true;
        }

        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            this.enterShooting();
        }
    }

    enterShooting() {
        if (this.estado === "shooting") return;
        this.estado = "shooting";
        this.timeOnState = 0;
        this.maxTime = 1.0 + Math.random() * 0.5;
        this.updateFunction = this.shooting.bind(this);

        const playerPos = this.player.getCamPosition();
        const targetVector = playerPos.clone().sub(this.object.position); 

        const shootDirection = this.getDirectionRelativeToCamera(targetVector); 
        
        this.playShootAnimation(shootDirection, false);
    }

    shooting(delta) {
        this.applyGravity(delta);

        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            if (Math.random() < 0.6) {
                this.enterRepositioning();
            } else {
                this.enterChasing();
            }
        }
    }

    enterRepositioning() {
        if (this.estado === "repositioning") return;
        this.estado = "repositioning";
        this.timeOnState = 0;
        this.maxTime = 1.5 + Math.random() * 1.5; 
        this.dirSignal = Math.random() < 0.5 ? -1 : 1; 
        this.updateFunction = this.repositioning.bind(this);
    }

    repositioning(delta) {
        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            this.enterChasing(); 
            return;
        }

        let direcao = this.player.getCamPosition().clone().sub(this.object.position);
        direcao.y = 0;
        direcao.normalize();

        direcao.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.dirSignal * Math.PI / 2);

        const animDirection = this.getDirectionRelativeToCamera(direcao);
        this.playAnimation(animDirection);

        this.wallCollision(direcao, delta, 0.8);
        this.applyGravity(delta);
    }

    playShootAnimation(direction, isContinuousAiming = false) {
        let actionName;
        switch(direction) {
            case 'down':  actionName = 'shootDown'; break;
            case 'ld':    actionName = 'shootLD'; break;
            case 'left':  actionName = 'shootLeft'; break;
            case 'lu':    actionName = 'shootLU'; break;
            case 'up':    actionName = 'shootUp'; break;
            case 'ru':    actionName = 'shootRU'; break;
            case 'right': actionName = 'shootRight'; break;
            case 'rd':    actionName = 'shootRD'; break;
            default:      actionName = 'shootDown'; 
        }

        if (this.currentAnimation && this.actions[this.currentAnimation]) {
            this.actions[this.currentAnimation].stop();
        }
        
        if (this.actions[actionName]) {
            if (isContinuousAiming) {
                this.actions[actionName].playLoop();
            } else {
                this.actions[actionName].playOnce(false);
            }
            this.currentAnimation = actionName; 
        } else {
            console.error(`ERRO: Ação de tiro ${actionName} não encontrada!`);
            this.actionSprite.setFrame(4, 0);
        }
    }

    morrer() {
        if (!this.rodando) return; 

        this.rodando = false;
        this.updateFunction = null; 

        if (this.currentAnimation && this.actions[this.currentAnimation]) {
            this.actions[this.currentAnimation].stop();
            this.currentAnimation = null;
        }
        
        if (this.actions.Die) {
            this.actions.Die.playOnce(true);
            
            setTimeout(() => {
                if (this.actionSprite) {
                    this.actionSprite.visible = true;
                }
            }, 100);
            
            setTimeout(() => {
                if (this.actionSprite) {
                    this.actionSprite.visible = true;
                }
            }, 2000);
        }

        if (typeof GameController !== 'undefined' && GameController.instance) {
            GameController.instance.inimigoMorreu(this);
        }
    }

    // sobrescreve a função da classe base para usar dimensões adequadas ao zombieman
    atualizarBarraVida() {
        let porcentagemVida = this.vida / this.maxVida;
        this.sprite.scale.set(1.5 * porcentagemVida, 0.2, 1);
    }

    fadeAndDestroy() {
        if (this.actionSprite) {
            this.actionSprite.visible = true;
        }
    }

    destructor() {
        if (this.observer) {
            this.observer.removeListener(this);
        }
        
        this.bulletPool = null;
        this.clock = null;
        this.player = null;
        
        if (this.actionSprite) {
            this.actionSprite.visible = true;
            
            if (!this.actionSprite.parent) {
                this.scene.add(this.actionSprite);
            }
        }
    }

}