import * as THREE from 'three';
import { InimigoBase } from './inimigoBase.js';
import { loadGLB } from '../Mesh/extractor.js';
import { InimigoLostSoul } from './inimigoLostSoul.js';

class PainElemental extends InimigoBase {
    constructor(scene, player, observer, velocidade = 10, pos = new THREE.Vector3(0, 10, 0)) {
        super(scene, 100, 0, player, observer);
        this.velocidade = velocidade;

        this.rodando = true;

        this.rayWall = new THREE.Raycaster();
        this.rayWall.far = 0.5;
        this.rayWall.near = 0.1;
        this.rayGround = new THREE.Raycaster();
        this.rayGround.far = 1.0;
        this.rayGround.near = 0.1;

        this.clockIdle = new THREE.Clock();
        this.clockIdle.start();
        this.clock = new THREE.Clock();
        this.clock.start();

        this.timeOnState = 0;
        this.maxTime = 5;

        this.sinOffset = Math.random() * 2 * Math.PI;

        this.tamSprite = 10;
        this.alturaSprite = 0.8;

        this.municao = 5;
        this.clock = new THREE.Clock();

        this.object.position.copy(pos);

        this.loadModel();
    }

    async loadModel(){
        try {
            this.mesh = await loadGLB('../../../0_assetsT3/objects/pain/painElemental.glb', '../../../0_assetsT3/objects/pain/textures/', 'pain_elemental_toy_normal.png');
            this.mesh.rotation.y = Math.PI / 2;
            this.bb = new THREE.Box3().setFromObject(this.mesh);
            this.setup();
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

    update(){
        if (!this.rodando) return;

        this.testeColisao();

        if(this.updateFunction) {
            this.updateFunction();
        }
    }

    testeColisao() {
        this.bb = new THREE.Box3().setFromObject(this.mesh);
        const objects = this.player.getBulletPool().getBulletsInUse();
        const bullet = objects.find(obj => this.bb.intersectsBox(obj.bb));
        if (bullet && this.rodando) { // verifica se ainda está rodando
            bullet.reset(); // faz a bala desaparecer ao colidir
            this.tomarDano(10);
            console.log("Cacodemon atingido!");
        }
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
}

export { PainElemental };