import {
	Euler,
	EventDispatcher,
} from 'three';
import { onWindowResize } from "../../libs/util/util.js";
import * as THREE from "three";
import { BulletPool } from "./disparo.js";
import { getChao, getParedes } from "./cenario.js";

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const eulerCameraHolder = new Euler( 0, 0, 0, 'YXZ' );

const GRAVIDADE = 9.8 * 6;

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

const armaMaterial = new THREE.MeshBasicMaterial({ color: "rgb(108, 108, 108)" }); // material para a arma

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
        this.camera.position.set(0, 2, 0);
        this.camera.lookAt(new THREE.Vector3(0, 2, -1)); // começa olhando pra frente
        this.cameraHolder.add(this.camera);
        
        // Cria a arma
        let cilindroGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
        this.cilindro = new THREE.Mesh(cilindroGeometry, armaMaterial); 
        this.camera.add(this.cilindro); 
        this.cilindro.position.set(0, -1, -2); 
        this.cilindro.rotation.x = -Math.PI / 2;
        
        scene.add(this.cameraHolder);
        //#endregion

        //#region HTML e eventos
        this.blocker = document.getElementById("blocker");
        this.instructions = document.getElementById("instructions");
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
        });
        this.addEventListener("unlock", () => {
            this.blocker.style.display = "block";
            this.instructions.style.display = "";
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

        this.speed = 15;
        this.pulo = 15;
        this.velVertical = 0;
        this.alturaChao = 0.1;
        this.grounded = false;
        this.rayGround = new THREE.Raycaster(); // cria um raycaster para detectar colisões com o chão
        this.rayGround.far = 5.0;
        this.rayGround.near = 1.0;

        this.velocity = new THREE.Vector2(0, 0);
        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 1.5;

        this.teclas = [false, false, false, false];

        this.clock = new THREE.Clock();
        //#endregion

        //#region Pool de balas
        this.arma = new BulletPool(this.scene); // cria a pool de balas
        this.atirar = false;
        this.rayMira = new THREE.Raycaster(); // cria um raycaster para detectar o alvo
        this.rayMira.far = 1000.0; // distância máxima do raycaster

        //#endregion


        this.arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1), // direção inicial
            this.cameraHolder.position, // posição inicial
            5, // comprimento da seta
            0xff0000 // cor da seta (vermelho)
        );
        this.scene.add(this.arrowHelper); // adiciona a seta à cena

        this.connect(); 
    }

    //#region Funções de movimento
    // Função de captura de teclas
    movementControls(key, isPressed) {
        //console.log("key: " + key); // Em alguns momentos, essa função para de ser chamada e só volta com essa linha descomentada
        key = key.toLowerCase(); // Normaliza a tecla para minúscula
        switch (key) {
            case "w":
            case "ArrowUp":
                this.teclas[0] = isPressed;
                break;
            case "s":
            case "ArrowDown":
                this.teclas[1] = isPressed;
                break;
            case "a":
            case "ArrowLeft":
                this.teclas[2] = isPressed;
                break;
            case "d":
            case "ArrowRight":
                this.teclas[3] = isPressed;
                break;
            case " ":
                if(isPressed && this.grounded) {
                    this.velVertical = this.pulo;
                    this.cameraHolder.position.y += 0.1;
                }
                break;
        }

        // TODO: Aqui, uma direção é privilegiada, ou seja, se apertar w e a, o w tem prioridade. ARRUMAR ISSO!!!!
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
    update(delta){
        this.grounded = this.isOnGround(); // Verifica se está no chão
        if(this.grounded){
            this.velVertical = 0;
        } else {
            this.velVertical -= GRAVIDADE * delta;
            this.cameraHolder.translateY(this.velVertical * delta);
        }
    
        const moveDistance = this.speed * delta;

        let direcao = this.velocity.clone();    
        direcao = direcao.normalize();

        this.wallCollision(direcao);

        this.cameraHolder.translateX(direcao.x * moveDistance);
        this.cameraHolder.translateZ(direcao.y * moveDistance);

        if(this.atirar){
            this.funcAtirar();
        }

    }
    // Função de animação
    render() {
        if (this.isLocked) {
            this.update(this.clock.getDelta());
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }
    // Começa as animações e etc...
    start() {
        this.render();
    }
    // Verifica se o jogador está no chão, por meio de um raycast
    isOnGround(){
        const position = this.cameraHolder.position.clone();
        position.y += 2.0; 
        this.rayGround.set(position, new THREE.Vector3(0, -1, 0)); 
        
        const intersects = this.rayGround.intersectObjects(getChao());
        
        this.alturaChao = intersects.length > 0 ? intersects[0].point.y + 0.1 : 0.1;
        
        let isGround = this.cameraHolder.position.y <= this.alturaChao;

        if (isGround) {
            this.cameraHolder.position.y = this.alturaChao;
        }

        return isGround;
    }
    funcAtirar() {
        let objetos = getParedes();
        let direcao = this.camera.getWorldDirection(new THREE.Vector3());
        let camPos = this.camera.getWorldPosition(new THREE.Vector3());
        
        this.rayMira.set(camPos, direcao);
        let intersects = this.rayMira.intersectObjects(objetos);
        
        const posicao = this.cilindro.getWorldPosition(new THREE.Vector3()); 
        
        let alvo;
        
        if (intersects.length > 0) {
            alvo = intersects[0].point; // pega o ponto de interseção mais próximo
        } else {
            alvo = posicao.clone().add(direcao.multiplyScalar(500)); // se não houver interseção, define um alvo distante
        }
        this.arma.atirar(posicao, alvo);
    }
    wallCollision(direcao) {
        if(direcao.x === 0 && direcao.y === 0) {
            return; // Não faz nada se a direção for zero
        }
        const pos = this.cameraHolder.position.clone().add(new THREE.Vector3(0, 1.0, 0));
        const paredes = getParedes();

        let quaternion = this.cameraHolder.quaternion.clone();

        const dir = new THREE.Vector3(direcao.x, 0, direcao.y).normalize();
        const direcao3 = new THREE.Vector3(direcao.x, 0, direcao.y).applyQuaternion(quaternion);

        this.arrowHelper.setDirection(direcao3); // Atualiza a seta de direção
        this.arrowHelper.position.copy(pos); // Atualiza a posição da seta

        this.rayWall.set(pos, direcao3);
        const intersects = this.rayWall.intersectObjects(paredes);

        if (intersects.length > 0) {
            const dInversa = direcao.clone().multiplyScalar(-1);
            const normal = intersects[0].face.normal.clone();

            let dotProduct = dInversa.dot(normal);
            const projection = dInversa.clone().multiplyScalar(dotProduct);

            direcao3.add(projection);
            
            console.log(direcao3.x, direcao3.y);
        }
    }
    //#endregion

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