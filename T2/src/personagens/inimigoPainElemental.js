import * as THREE from 'three';
import { InimigoBase } from './inimigoBase.js';
import { loadGLB } from '../Mesh/extractor.js';
import { InimigoLostSoul } from './inimigoLostSoul.js';
import { getParedes, getChao } from "../cenario/cenario.js";
import { SoundController } from "../controller/soundcontroller.js";

class PainElemental extends InimigoBase {
    constructor(scene, player, observer, velocidade = 10, pos = new THREE.Vector3(0, 10, 0)) {
        super(scene, 100, 0, player, observer);
        this.velocidade = velocidade;

        this.rodando = true;
        this.soundController = new SoundController(player.getCamera());

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;
        this.rayGround = new THREE.Raycaster();
        this.rayGround.far = 1.0;
        this.rayGround.near = 0.1;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();

        this.timeOnState = 0;
        this.maxTime = 5;

        this.sinOffset = Math.random() * 2 * Math.PI;

        this.tamSprite = 10;
        this.alturaSprite = 0.8;

        this.municao = 5;

        this.object.position.copy(pos);

        this.dirSignal = 1; // Define a direção inicial

        this.loadModel();
    }

    async loadModel(){
        try {
            this.mesh = await loadGLB('../../../0_assetsT3/objects/pain/painElemental.glb', '../../../0_assetsT3/objects/pain/textures/', 'pain_elemental_toy_normal.png');
            this.bb = new THREE.Box3().setFromObject(this.mesh);
            this.setup();
            console.log("Object pos world", this.object.getWorldPosition(new THREE.Vector3()));
            console.log("Mesh pos world", this.mesh.getWorldPosition(new THREE.Vector3()));
            console.log("Object pos local", this.object.position);
            console.log("Mesh pos local", this.mesh.position);
        }
        catch (error) {
            console.error('Error loading model:', error);
            return;
        }
    }

    setup() {
        super.setup();
        this.sprite.scale.set(10, 0.8, 1);
        this.sprite.position.set(0, 20, 0);
        this.enterIdle();
    }

    update(delta){
        if (!this.rodando) return;

        this.testeColisao();

        if(this.updateFunction) {
            this.updateFunction(delta);
        }
    }

    testeColisao() {
        this.bb = new THREE.Box3().setFromObject(this.mesh);
        const objects = this.player.getBulletPool().getBulletsInUse();
        const bullet = objects.find(obj => this.bb.intersectsBox(obj.bb));
        if (bullet && this.rodando) { // verifica se ainda está rodando
            bullet.reset(); // faz a bala desaparecer ao colidir
            this.tomarDano(10);
            this.soundController.play('painInjured');
        }
    }
    
    morrer(){
        this.rodando = false;
        
        const mesh = this.mesh;
        mesh.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.transparent = true; // ESTA LINHA ESTAVA FALTANDO
            }
        });
        
        let start = null;
        const initialOpacities = [];
        mesh.traverse(child => {
            if (child.isMesh && child.material) {
                initialOpacities.push(child.material.opacity ?? 1);
            }
        });

        const duration = 0.7; // segundos
        const scene = this.scene; // Para usar dentro da função

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
                requestAnimationFrame(animateFadeOut);
            } else {
                // CORRIGIDO: Remove da cena e libera memória ao final
                mesh.visible = false;
                scene.remove(mesh);
                console.log("Pain Elemental removido da cena!");
            }
        }

        requestAnimationFrame(animateFadeOut);

    }
    
    enterIdle() {
        this.updateFunction = this.idle.bind(this);
        this.timeOnState = 0;
        this.clockIdle.start();
    }

    idle(delta) {
        let time = this.clock.getElapsedTime();
        this.mesh.position.y = Math.sin(time * 6 + this.sinOffset) * 0.5;
    }

    triggered() {
        if (this.municao > 0) {
            console.log("Disparando Lost Soul", this.object.position);
            const globalPosition = this.mesh.getWorldPosition(new THREE.Vector3());
            globalPosition.y += 5.0; 
            const lostSoul = new InimigoLostSoul(this.scene, 20, 5, this.player, this.observer, 10);
            lostSoul.object.position.copy(globalPosition);
            lostSoul.startState = lostSoul.enterAttack.bind(lostSoul);
            this.municao--;
            this.soundController.play('painAttack');
        }
    }

    enterTriggered() {
        this.updateFunction = this.moving.bind(this);
        this.timeOnState = 0;
        this.clockIdle.start();
        this.soundController.play('painSight');
    }

    moving(delta){
        this.timeOnState += delta;
        if (this.timeOnState > this.maxTime) {
            console.log("Mudando de estado para idle");
            this.triggered();
            this.timeOnState = 0;
            this.dirSignal = Math.random() < 0.5 ? -1 : 1;
            // Tempo aleatório entre 10 e 20 segundos
            this.maxTime = 10 + Math.random() * 10;
            return;
        }

        let direcao = this.player.getCamPosition().clone().sub(this.object.position);
        direcao.y = 0;
        direcao.normalize();
        
        direcao.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        
        const angleY = Math.atan2(-direcao.x, -direcao.z);

        // Define o quaternion para rotacionar apenas no eixo Y
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleY);
        
        const dir = new THREE.Vector3(0, 0, this.dirSignal);
        this.wallCollision(dir, delta, 1.0);
        this.groundCollision();
    }

    wallCollision(dir, delta, scale = 1){
        const quaternion = this.mesh.quaternion.clone();
        let direcao = dir.clone();
        direcao.applyQuaternion(quaternion);

        this.rayWall.set(this.object.position, direcao);

        const objects = getParedes().concat(getChao());
        const intersectedObjects = this.rayWall.intersectObjects(objects, true);

        
        if (intersectedObjects.length > 0) {
            let normal = intersectedObjects[0].face.normal;
            
            normal = normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersectedObjects[0].object.matrixWorld)).normalize();
            
            let dNova = direcao.clone().projectOnPlane(normal); // Projeta a direção no plano para não atravessar paredes
            direcao = dNova.normalize();
        }
        
        this.object.position.add(direcao.multiplyScalar(this.velocidade * delta * scale));
    }

    groundCollision(){
        this.rayGround.set(this.object.position, new THREE.Vector3(0, -1, 0));
        const objects = getChao();
        const intersectedObjects = this.rayGround.intersectObjects(objects, true);

        if (intersectedObjects.length > 0) {
            const groundY = intersectedObjects[0].point.y;
            if (this.object.position.y - 2.0 < groundY) {
                this.object.position.y = groundY + 2.0;
            }
        }
    }

}

export { PainElemental };