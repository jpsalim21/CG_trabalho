import { initRenderer, onWindowResize } from "../../libs/util/util.js";
import { PointerLockControls } from "../../build/jsm/controls/PointerLockControls.js";
import { setDefaultMaterial } from "../../libs/util/util.js";
import * as THREE from "three";
import { BulletPool } from "./disparo.js";
import { getChao, getParedes } from "./cenario.js";

const armaMaterial = new THREE.MeshBasicMaterial({ color: "rgb(108, 108, 108)" }); // material para a arma

class PlayerController {
    constructor(scene, groundTexturePath = "../../assets/textures/wood.png") {
        // inicializa o renderizador com um rosa muito massa
        this.renderer = initRenderer("rgb(235, 130, 216)");

        // pra criar a cena
        this.scene = scene;

        // cria a camera
        this.camera = new THREE.PerspectiveCamera(
            45, // 45° de abertura para simular a visão humana
            window.innerWidth / window.innerHeight, // proporção da tela: divide largura da tela pela altura da tela para não esticar a imagem
            0.1, // define a distância mínima da câmera em que objetos começam a ser renderizados
            1000 // define a distância máxima da câmera em que objetos são renderizados
        );
        this.camera.position.set(0, 2, 5); // posiciona a camera na altura (estimada) de um ser humano
        this.camera.lookAt(new THREE.Vector3(4, 1, 2)); // começa olhando pra frente

        let cilindroGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
        let cilindro = new THREE.Mesh(cilindroGeometry, armaMaterial); 
        this.camera.add(cilindro); 
        cilindro.position.set(0, -1, -2); 
        cilindro.rotation.x = -Math.PI / 2;

        // cria os controles de ponteiro
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.controls.getObject());

        // elementos do DOM para o blocker e instruções
        this.blocker = document.getElementById("blocker");
        this.instructions = document.getElementById("instructions");

        // evento para travar o ponteiro ao clicar nas instruções
        this.instructions.addEventListener(
            "click",
            () => {
                this.controls.lock();
            },
            false
        );

        // eventos para mostrar/esconder instruções
        this.controls.addEventListener("lock", () => {
            this.instructions.style.display = "none";
            this.blocker.style.display = "none";
        });
        this.controls.addEventListener("unlock", () => {
            this.blocker.style.display = "block";
            this.instructions.style.display = "";
        });

        // Variáveis de movimento
        this.speed = 15;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        this.arma = new BulletPool(this.scene); // cria a pool de balas
        this.atirar = false;

        this.raycastChao = new THREE.Raycaster(); // cria um raycastChaoer para detectar colisões
        this.raycastChao.far = 3;
        this.raycastChao.near = 0.1;
        this.raycastChao.set(this.camera.position, new THREE.Vector3(0, -1, 0)); 

        // relógio para calcular delta time
        this.clock = new THREE.Clock();

        // captura de teclas (o keyCode foi preterido por key, que é mais moderno)
        window.addEventListener("keydown", (event) => this.movementControls(event.key, true));
        window.addEventListener("keyup", (event) => this.movementControls(event.key, false));

        // Listener para redimensionamento da janela
        window.addEventListener(
            "resize",
            () => {
                onWindowResize(this.camera, this.renderer);
            },
            false
        );
    }

    // função para captura de teclas
    movementControls(key, value) {
        switch (key) {
            case "w":
            case "ArrowUp":
                this.moveForward = value;
                console.log("moveForward: " + value);
                break;
            case "s":
            case "ArrowDown":
                this.moveBackward = value;
                break;
            case "a":
            case "ArrowLeft":
                this.moveLeft = value;
                break;
            case "d":
            case "ArrowRight":
                this.moveRight = value;
                break;
            case " ":
                this.moveUp = value;
                break;
            case "Shift":
                this.moveDown = value;
                break;
            case "f":
                this.atirar = value;
                break;
        }
    }

    // função de animação de movimento usando matrizes
    moveAnimate(delta) {
        // delta = é o tempo decorrido desde o último frame
        const moveDistance = this.speed * delta; // distância de movimento proporcional ao tempo para manter a velocidade constante e suave

        const quaternion = this.camera.quaternion.clone(); // extrai uma cópia de rotação da câmera (quaternion)
        const euler = new THREE.Euler().setFromQuaternion(quaternion, "YXZ"); // a ordem tá YXZ para priorizar yaw (rotação horizontal)

        //mantém apenas a rotação horizontal (yaw)
        euler.x = 0; // remove a inclinação (pitch)
        euler.z = 0; // remove a rotação lateral (roll)

        // cria um novo quaternion apenas com a rotação em Y (yaw)
        const yawQuaternion = new THREE.Quaternion().setFromEuler(euler);

        // da matriz que representa a transformacao global (rotacao, translacao e escala) da camera, vamos extrair o componente de rotação
        const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(yawQuaternion);

        // vetores base transformados pela rotação da câmera
        const forwardVector = new THREE.Vector3(0, 0, -1).applyMatrix4(rotationMatrix);
        // o vetor para frente é o vetor -Z
        // multiplicamos pela matriz de rotação para obter o vetor na direção da câmera
        // como resultado, temos a direção para onde a câmera está olhando no espaço
        const rightVector = new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix);
        // o vetor para a direita é o vetor +X
        // direcao perpendicular ao vetor para frente no plano horizontal
        const upVector = new THREE.Vector3(0, 1, 0); // apertar espaço/shift (movimento vertical) não será afetado pela rotação da câmera
        // o vetor para cima é o vetor +Y
        // mantemos o vetor para cima na direção Y, pois não queremos que a câmera gire para cima ou para baixo

        // calcula o vetor de movimento com base nas teclas pressionadas
        const movementVector = new THREE.Vector3(); // vetor de movimento inicializado em (0, 0, 0)
        // multiplicamos o vetor de movimento pela distância de movimento e somamos ao vetor de movimento total
        // dessa forma, o vetor de movimento (ou seja, sua posição) é atualizado frequentemente
        if (this.moveForward) movementVector.add(forwardVector.multiplyScalar(moveDistance));
        if (this.moveBackward) movementVector.add(forwardVector.multiplyScalar(-moveDistance));
        if (this.moveRight) movementVector.add(rightVector.multiplyScalar(moveDistance));
        if (this.moveLeft) movementVector.add(rightVector.multiplyScalar(-moveDistance));
        if (this.moveUp) movementVector.add(upVector.multiplyScalar(moveDistance));
        if (this.moveDown) movementVector.add(upVector.multiplyScalar(-moveDistance));

        // aqui somamos o vetor de movimento à posição atual da câmera
        this.camera.position.add(movementVector);

        if(this.atirar){
            let direcao = new THREE.Vector3();
            this.camera.getWorldDirection(direcao);
            direcao = direcao.normalize(); // normaliza o vetor de direção para que tenha comprimento 1

            let alvo = this.camera.position.clone().add(direcao.multiplyScalar(10));

            let origem = this.camera.position.clone();
            origem.y -= 1;
            origem = origem.clone().add(direcao.multiplyScalar(0.25));

            this.arma.atirar(origem, alvo);
        }

        // aqui atualizamos a matriz de transformação da câmera para efetuar as mudanças na posição
        this.camera.updateMatrixWorld();

    }

    // Função para atualizar a renderização
    render() {
        if (this.controls.isLocked) {
            this.moveAnimate(this.clock.getDelta());
        }
        
        this.isOnGround();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }

    // método para iniciar a renderização
    start() {
        this.render();
    }

    getCamera() {
        return this.camera;
    }

    getGround() {
        return this.ground;
    }

    isOnGround(){
        this.raycastChao.set(this.camera.position, new THREE.Vector3(0, -1, 0)); 
        let chao = getChao();

        let intersects = this.raycastChao.intersectObjects(chao);

        if (intersects.length > 0){
            //console.log("Colidiu com o chão");
        }

    }
}

export { PlayerController };