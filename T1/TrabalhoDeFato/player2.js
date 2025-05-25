import {
	Euler,
	EventDispatcher,
	Vector3
} from 'three';
import { initRenderer, onWindowResize } from "../../libs/util/util.js";
import * as THREE from "three";
import { BulletPool } from "./disparo.js";
import { getChao, getParedes } from "./cenario.js";

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const eulerMesh = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const GRAVIDADE = 9.8 * 2;

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
        let cilindro = new THREE.Mesh(cilindroGeometry, armaMaterial); 
        this.camera.add(cilindro); 
        cilindro.position.set(0, -1, -2); 
        cilindro.rotation.x = -Math.PI / 2;
        
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

        this.speed = 30;
        this.pulo = 10;
        this.velVertical = 0;
        this.rayGround = new THREE.Raycaster(); // cria um raycaster para detectar colisões com o chão
        this.rayGround.far = 0.1;
        this.rayGround.near = 0.05;

        this.velocity = new THREE.Vector2(0, 0);

        this.teclas = [false, false, false, false];

        this.clock = new THREE.Clock();
        //#endregion

        //#region Pool de balas
        this.arma = new BulletPool(this.scene); // cria a pool de balas
        this.atirar = false;
        //#endregion

        this.connect(); 
    }

    //#region Funções de movimento
    movementControls(key, isPressed) {
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
                //TODO: Colocar aqui a lógica de pulo, mas tá mto errada por agora
                if(isPressed){
                    this.velVertical = this.pulo;
                    this.cameraHolder.position.y += 0.1;
                }
                break;
            case "f": // atira
                this.atirar = isPressed;
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
    update(delta){
        const moveDistance = this.speed * delta;

        let direcao = this.velocity.clone();    
        direcao = direcao.normalize();

        this.cameraHolder.translateX(direcao.x * moveDistance);
        this.cameraHolder.translateZ(direcao.y * moveDistance);

        if(this.isOnGround()){
            this.velVertical = 0;
        } else {
            this.velVertical -= GRAVIDADE * delta;
            this.cameraHolder.translateY(this.velVertical * delta);
        }
    }
    render() {
        if (this.isLocked) {
            this.update(this.clock.getDelta());
        }
        
        //this.isOnGround();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }
    start() {
        this.render();
    }

    isOnGround(){
        this.rayGround.set(this.cameraHolder.position, new THREE.Vector3(0, -1, 0)); 
        let chao = getChao();

        const intersects = this.rayGround.intersectObjects(chao);
        console.log(intersects.length);

        return intersects.length > 0 || this.cameraHolder.position.y <= 0.1;
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
    const mesh = this.cameraHolder;
	_euler.setFromQuaternion( camera.quaternion );

    eulerMesh.setFromQuaternion( mesh.quaternion );

	eulerMesh.y -= movementX * 0.002 * this.pointerSpeed;
	_euler.x -= movementY * 0.002 * this.pointerSpeed;

	_euler.x = Math.max( _PI_2 - this.maxPolarAngle, Math.min( _PI_2 - this.minPolarAngle, _euler.x ) );

	camera.quaternion.setFromEuler( _euler );
    mesh.quaternion.setFromEuler( eulerMesh );

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