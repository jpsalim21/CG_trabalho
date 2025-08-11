import {Euler, EventDispatcher, TextureLoader} from 'three';
import { onWindowResize } from "../../../libs/util/util.js";
import * as THREE from "three";
import { BulletPool } from "./disparo.js";
import { getChao, getParedes } from "../cenario/cenario.js";
import { GameController } from '../controller/gamecontroller.js';
import { testaColisao } from './inimigocontroller.js';
import { SpriteMixer } from '../../sprites/SpriteMixer.js';
import { loadOBJ } from "../Mesh/extractor.js";

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const eulerCameraHolder = new Euler( 0, 0, 0, 'YXZ' );

const GRAVIDADE = 9.8 * 14;

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

const armaMaterial = new THREE.MeshLambertMaterial({color: 'rgb(108, 108, 108)', shininess: 1000, reflectivity: 1});

const playerGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);

class PlayerController extends EventDispatcher {
    constructor(scene, renderer) {
        super();

        //#region Camera e objetos THREE.js 
        this.renderer = renderer;
        this.scene = scene;
        
        //Cria o câmeraHolder
        this.cameraHolder = new THREE.Object3D();
        this.cameraHolder.position.set(0, 0, 0);
        
        //Configura a câmera
        this.camera = new THREE.PerspectiveCamera(
            45, // 45° de abertura para simular a visão humana
            window.innerWidth / window.innerHeight, // proporção da tela: divide largura da tela pela altura da tela para não esticar a imagem
            0.1, 
            1000 
        );
        this.camera.position.set(0, 2, 0); //altura do jogador
        this.camera.lookAt(new THREE.Vector3(0, 2, -1)); // começa olhando pra frente
        this.cameraHolder.add(this.camera);

        // setup das duas armas
        this.weapons = {};
        this.activeWeapon = 1;
        this.clock = new THREE.Clock();
     
        // cria a arma "lançador"
        this.getLauncher();

        //cria chaingun
        this.spriteMixer = SpriteMixer();
        const loader = new TextureLoader();
        loader.load('./assets/textures/chaingun.png', (texture) => {
            const chaingunSprite = this.spriteMixer.ActionSprite(texture, 3, 1);
            chaingunSprite.position.set(0, -0.5 , -2.0);
            chaingunSprite.scale.set(0.8, 0.8, 0.8);
            
            this.weapons[1] = {
                object: chaingunSprite,
                actions: {
                    idle: this.spriteMixer.Action(chaingunSprite, 0, 0, 100),
                    shoot: this.spriteMixer.Action(chaingunSprite, 1, 4, 80) // movimento de tiro, começando no frame 1 e terminando no frame 4, com 80ms por frame
                },
                isShooting: false
            };
            this.camera.add(chaingunSprite); 
            chaingunSprite.visible = (this.activeWeapon === 1); 
        });
        
        scene.add(this.cameraHolder);
        //#endregion

        //#region HTML e eventos
        this.blocker = document.getElementById("blocker");
        this.instructions = document.getElementById("instructions");
        this.mira = document.getElementById("mira");
        this.domElement = renderer.domElement;

        this.instructions.addEventListener(
            "click",
            () => {
                this.lock();
            },
            false
        );
        this.addEventListener("lock", () => {
            this.instructions.style.display = "none";
            this.blocker.style.display = "none";
            this.mira.style.display = "block"; 
        });
        this.addEventListener("unlock", () => {
            this.blocker.style.display = "";
            this.instructions.style.display = "";
            this.mira.style.display = "none"; 
        });
        window.addEventListener(
            "resize",
            () => {
                onWindowResize(this.camera, this.renderer);
            },
            false
        );
        this.domElement.addEventListener('mousedown', (event) => {
            if (event.button === 0 || event.button === 2) { // Botão esquerdo do mouse
                this.atirar = true; // Ativa o disparo
            }
        });
        this.domElement.addEventListener('mouseup', (event) => {
            if (event.button === 0 || event.button === 2) { // Botão esquerdo do mouse
                this.atirar = false; // Desativa o disparo
            }
        });

        window.addEventListener("keydown", (event) => this.handleWeaponSwitchKey(event.key));
        window.addEventListener('wheel', (event) => this.handleWeaponSwitchScroll(event));

        window.addEventListener("keydown", (event) => this.movementControls(event.key, true));
        window.addEventListener("keyup", (event) => this.movementControls(event.key, false));
        this._onMouseMove = onMouseMove.bind( this );
		this._onPointerlockChange = onPointerlockChange.bind( this );
		this._onPointerlockError = onPointerlockError.bind( this );
        this.isLocked = false;

        this.connect();
        //#endregion

        //#region Variáveis de movimento
        this.pointerSpeed = 1.0;
        this.minPolarAngle = 0;
		this.maxPolarAngle = Math.PI; 

        this.speed = 40;
        this.pulo = 30;
        this.velVertical = 0;
        this.alturaChao = 0.1;
        this.grounded = false;
        this.rayGround = new THREE.Raycaster(); // cria um raycaster para detectar colisões com o chão
        this.rayGround.far = 10.0;
        this.rayGround.near = 0.1;

        this.velocity = new THREE.Vector2(0, 0);
        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 1.5;
        this.arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1), // direção inicial
            new THREE.Vector3(0, 0, 0), // posição inicial
            1, // comprimento da seta
            0xff0000 // cor da seta
        );

        this.teclas = [false, false, false, false];

        this.clock = new THREE.Clock();
        //#endregion

        //#region Pool de balas
        this.arma = new BulletPool(this.scene); // cria a pool de balas
        this.atirar = false;
        this.rayMira = new THREE.Raycaster(); // cria um raycaster para detectar o alvo
        this.rayMira.camera = this.camera; // associa o raycaster à câmera
        this.rayMira.far = 1000.0; // distância máxima do raycaster

        //#endregion

        //#region Colisao
        this.playerMesh = new THREE.Mesh(playerGeo, armaMaterial);
        this.playerMesh.position.set(0, 1.25, 0);
        this.cameraHolder.add(this.playerMesh);
        this.playerMesh.visible = false;


        this.bb = new THREE.Box3().setFromObject(this.playerMesh);
        //#endregion

        this.hpMax = 200;
        this.hp = this.hpMax;
        this.godMode = false;

        this.connect(); 
    }

    async getLauncher(){
        try {
            let launcher = await loadOBJ('./assets/rocketlauncher/wephomura6.obj', "./assets/rocketlauncher/", "texhomu_11.png");
            launcher.scale.set(0.5, 0.5, 0.5);
            launcher.position.set(0, -1.3, 0);
            this.camera.add(launcher);
            this.weapons[2] = {
                object: launcher,
                cooldown: 0.5,
                lastShotTime: 0,
            }
            launcher.visible = (this.activeWeapon === 2);
        } catch (error) {
            console.error('Error loading model:', error);
            return;
        }
    }

    //#region Funções de movimento
    // Função de captura de teclas
    movementControls(key, isPressed) {
        key = key.toLowerCase(); // Normaliza a tecla para minúscula
        switch (key) {
            case "w":
            case "arrowup":
                this.teclas[0] = isPressed;
                break;
            case "s":
            case "arrowdown":
                this.teclas[1] = isPressed;
                break;
            case "a":
            case "arrowleft":
                this.teclas[2] = isPressed;
                break;
            case "d":
            case "arrowright":
                this.teclas[3] = isPressed;
                break;
            case " ":
                if(isPressed && this.grounded) {
                    this.velVertical = this.pulo;
                    this.cameraHolder.position.y += 0.1;
                }
                break;
            case "shift":
                if (isPressed) {
                    this.speed = 80; // Aumenta a velocidade ao pressionar Shift
                }
                else {
                    this.speed = 40; // Restaura a velocidade normal ao soltar Shift
                }
                break;
            case "c":
                GameController.instance.pegarTodasChaves();
                break;
            case "g":
                if(this.godMode) {
                    this.godMode = false;
                    showTemporaryMessage("Modo Deus desativado. Você pode ser atingido por inimigos.", 5000);
                }
                else {
                    this.godMode = true;
                    showTemporaryMessage("Modo Deus ativado. Você não sofrerá dano.", 5000);
                }
                break;
        }

        if (this.teclas[0]) {
            this.velocity.y = -1;
        } else if (this.teclas[1]) {
            this.velocity.y = 1;
        } else {
            this.velocity.y = 0;
        }
        if( this.teclas[2]) {
            this.velocity.x = -1;
        } else if (this.teclas[3]) {
            this.velocity.x = 1;
        } else {
            this.velocity.x = 0;
        }
    }
    // Função de atualização, com movimentação e gravidade
    update(delta) {
        // atualiza o mixer de sprites para que a animação seja atualizada conforme o delta de tempo
        if (this.spriteMixer) {
            this.spriteMixer.update(delta);
        }
    
        this.bb.setFromObject(this.playerMesh);
        this.grounded = this.isOnGround(delta);
    
        const moveDistance = this.speed * delta;
        let direcao = this.velocity.clone();
        direcao = direcao.normalize();
        direcao.multiplyScalar(moveDistance);
        this.wallCollision(direcao);
        this.cameraHolder.translateX(direcao.x);
        this.cameraHolder.translateZ(direcao.y);
        
        this.hurtbox();

        // tratando duas armas
        if (this.atirar) {
            // se for a chaingun
            if (this.activeWeapon === 1 && this.weapons[1]) {
                const weapon = this.weapons[1];
                // inicia a animação de tiro se não estiver atirando
                if (!weapon.isShooting) {
                    weapon.actions.shoot.playLoop();
                    weapon.isShooting = true;
                }
                // chama a função de tiro da metralhadora (raycast)
                this.fireChaingun(delta);
            }
            // se for o lancador
            else if (this.activeWeapon === 2 && this.weapons[2]) {
                const weapon = this.weapons[2];
                const now = this.clock.getElapsedTime();
    
                // verifica o cooldown de 0.5 segundos
                if (now - weapon.lastShotTime > weapon.cooldown) {
                    this.fireLauncher(); // dispara o projétil
                    weapon.lastShotTime = now; // atualiza o tempo do último disparo
                }
            }
        } else {
            // se o jogador SOLTOU o botão de atirar, para a animação da metralhadora
            if (this.activeWeapon === 1 && this.weapons[1] && this.weapons[1].isShooting && this.weapons[1].actions) {
                const weapon = this.weapons[1];
                weapon.actions.idle.playLoop();
                weapon.object.setFrame(0); // voltamos ao frame inicial
                weapon.isShooting = false;
            }
        }
    }
    // Função de animação
    render() {
        if (this.isLocked) {
            this.update(this.clock.getDelta());
        }

        // Executa os callbacks de atualização do jogo (triggers, etc.)
        if (window.gameUpdateCallbacks) {
            window.gameUpdateCallbacks.forEach(callback => {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }

    start() {
        this.render();
    }
    // Verifica se o jogador está no chão, por meio de um raycast
    isOnGround(delta){
        const position = this.cameraHolder.position.clone();
        position.y += 2.0; 
        this.rayGround.set(position, new THREE.Vector3(0, -1, 0)); 
        
        const intersects = this.rayGround.intersectObjects(getChao(), false);
        
        this.alturaChao = intersects.length > 0 ? intersects[0].point.y + 0.1 : 0.1;
        
        let isGround = this.cameraHolder.position.y <= this.alturaChao + 0.05;

        if (this.cameraHolder.position.y < this.alturaChao - 0.1 || isGround) {
            this.cameraHolder.position.y = this.alturaChao;
        }

        if (isGround) {
            this.velVertical = 0;
        } else {
            this.velVertical -= GRAVIDADE * delta;
            this.cameraHolder.translateY(this.velVertical * delta);
        }
        return isGround;
    }
    fireLauncher() {
        let objetos = getParedes();
        let direcao = this.camera.getWorldDirection(new THREE.Vector3());
        let camPos = this.camera.getWorldPosition(new THREE.Vector3());
        
        this.rayMira.set(camPos, direcao);
        let intersects = this.rayMira.intersectObjects(objetos);
        
        const posicao = this.weapons[2].object.getWorldPosition(new THREE.Vector3()); 
        
        let alvo;
        
        if (intersects.length > 0) {
            alvo = intersects[0].point; // pega o ponto de interseção mais próximo
        } else {
            alvo = posicao.clone().add(direcao.multiplyScalar(500)); // se não houver interseção, define um alvo distante
        }
        this.arma.atirar(posicao, alvo);
    }

    fireChaingun(delta) {
        let objetos = getParedes();
        let direcao = this.camera.getWorldDirection(new THREE.Vector3());
        let camPos = this.camera.getWorldPosition(new THREE.Vector3());
    
        this.rayMira.set(camPos, direcao);
        let sceneObjects = this.scene.children.filter(obj => 
            obj !== this.weapons[1]?.object && 
            (objetos.includes(obj) || obj.userData?.isEnemy)
        );
        let intersects = this.rayMira.intersectObjects(sceneObjects, true);
    
        if (intersects.length > 0) {
            const targetObject = intersects[0].object;
    
            let targetInimigo = targetObject;
            while (targetInimigo && !targetInimigo.userData?.isEnemy) {
                targetInimigo = targetInimigo.parent;
                if (!targetInimigo) break;
            }
    
            if (targetInimigo && targetInimigo.userData?.isEnemy) {
                if (this.currentTarget !== targetInimigo) {
                    this.currentTarget = targetInimigo;
                    this.chaingunDamageTime = 0;
                }
    
                this.chaingunDamageTime += delta;
                if (this.chaingunDamageTime >= 0.1) {
                    const inimigo = targetInimigo.userData.inimigoInstance;
                    if (inimigo) {
                        // verifica se o raycast intersecta a bounding box do inimigo
                        const bb = inimigo.bb; // a bounding box deve estar atualizada em inimigo
                        if (bb) {
                            const ray = new THREE.Ray(camPos, direcao);
                            if (ray.intersectsBox(bb)) {
                                inimigo.tomarDano(1);
                            }
                        } 
                    } 
                    this.chaingunDamageTime -= 0.1;
                }
            } else {
                this.currentTarget = null;
            }
        } else {
            this.currentTarget = null;
        }
    }

    wallCollision(direcao) {
        if(direcao.x === 0 && direcao.y === 0) {
            return; // Não faz nada se a direção for zero
        }
        
        const pos = this.cameraHolder.position.clone().add(new THREE.Vector3(0, 0.5, 0));
        const paredes = getParedes();
        let quaternion = this.cameraHolder.quaternion.clone();
        const direcao3 = new THREE.Vector3(direcao.x, 0, direcao.y).applyQuaternion(quaternion);
        this.rayWall.set(pos, direcao3);
        const intersects = this.rayWall.intersectObjects(paredes, false);

        this.arrowHelper.setDirection(direcao3.clone().normalize());
        this.arrowHelper.setLength(1.5, 0.1, 0.1);
        this.arrowHelper.setColor(new THREE.Color(0xff0000));

        if (intersects.length > 0) {
            let normal = intersects[0].face.normal.clone();

            normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersects[0].object.matrixWorld)).normalize(); // Aplica a matriz normal para obter a direção correta

            let dNova = direcao3.clone().projectOnPlane(normal); // Projeta a direção no plano para não atravessar paredes

            dNova = dNova.applyQuaternion(quaternion.clone().invert()); // Inverte para retornar à direção original

            direcao.x = dNova.x;
            direcao.y = dNova.z;
        }

        if (direcao.x === 0 && direcao.y === 0)
            return;
        
        direcao3.set(direcao.x, 0, direcao.y).applyQuaternion(quaternion);
        this.rayWall.set(pos, direcao3);
        const wallIntersects = this.rayWall.intersectObjects(paredes, false);

        
        if (wallIntersects.length > 0) {
            let normal = wallIntersects[0].face.normal.clone();
            normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(wallIntersects[0].object.matrixWorld)).normalize(); // Aplica a matriz normal para obter a direção correta

            let dNova = direcao3.clone().projectOnPlane(normal); // Projeta a direção no plano para não atravessar paredes

            dNova = dNova.applyQuaternion(quaternion.clone().invert()); // Inverte para retornar à direção original

            direcao.x = dNova.x;
            direcao.y = dNova.z;
        }
    }
    //#endregion
    hurtbox(){
        if (this.godMode) return; // Se estiver no modo Deus, não faz nada

        let dano = testaColisao(this);
        console.log("Dano recebido:", dano);
        if (dano > 0) {
        }
    }

    getBulletPool() {
        return this.arma; // Retorna a pool de balas
    }


    //#region Funções de eventos
    connect() {
		this.domElement.ownerDocument.addEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.addEventListener( 'pointerlockerror', this._onPointerlockError );
	}
	disconnect() {
		this.domElement.ownerDocument.removeEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', this._onPointerlockError );
	}
    lock() {
		this.domElement.requestPointerLock();
	}
    unlock() {
		this.domElement.ownerDocument.exitPointerLock();
	}
    //#endregion

    getCamPosition() {
        return this.camera.getWorldPosition(new THREE.Vector3());
    }

    // trocando as arma
    switchWeapon(newWeaponIndex) {
        if (this.activeWeapon === newWeaponIndex || !this.weapons[newWeaponIndex]) {
            return;
        }
        // esconde a arma antiga
        if (this.weapons[this.activeWeapon]) {
            this.weapons[this.activeWeapon].object.visible = false;
        }
        // pra animação da chaingun, se for o caso
        if (this.activeWeapon === 1 && this.weapons[1] && this.weapons[1].actions) {
            this.weapons[1].isShooting = false;
            this.weapons[1].actions.idle.playLoop();
            this.weapons[1].object.setFrame(0);
            this.weapons[1].object.visible = false; // força a invisibilidade
        }
        // mostra a nova arma
        this.activeWeapon = newWeaponIndex;
        this.weapons[this.activeWeapon].object.visible = true;
    }

    // novo método para lidar com as teclas '1' e '2'
    handleWeaponSwitchKey(key) {
        if (key === '1') {
            this.switchWeapon(1); // chaingun
        } else if (key === '2') {
            this.switchWeapon(2); // lançador
        }
    }

    // método para lidar com o scroll do mouse
    handleWeaponSwitchScroll(event) {
        // event.deltaY > 0 significa scroll para baixo
        // event.deltaY < 0 significa scroll para cima
        if (this.activeWeapon === 1) {
            this.switchWeapon(2);
        } else {
            this.switchWeapon(1);
        }
    }

}

//Funções copiadas do PointerLockControls.js
function onMouseMove( event ) {
	if ( this.isLocked === false ) return;

	const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

	const camera = this.camera;
    const cameraHolder = this.cameraHolder; // Aqui foi modificado, para rotacionar o cameraHolder no eixo Y
	_euler.setFromQuaternion( camera.quaternion );

    eulerCameraHolder.setFromQuaternion( cameraHolder.quaternion );

	eulerCameraHolder.y -= movementX * 0.002 * this.pointerSpeed;
	_euler.x -= movementY * 0.002 * this.pointerSpeed;

	_euler.x = Math.max( _PI_2 - this.maxPolarAngle, Math.min( _PI_2 - this.minPolarAngle, _euler.x ) );

	camera.quaternion.setFromEuler( _euler );
    cameraHolder.quaternion.setFromEuler( eulerCameraHolder );

	this.dispatchEvent( _changeEvent );
}

function onPointerlockChange() {
	if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) {
		this.dispatchEvent( _lockEvent );
		this.isLocked = true;
	} else {
		this.dispatchEvent( _unlockEvent );
		this.isLocked = false;
	}
}

function onPointerlockError() {
	console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
}

export { PlayerController };