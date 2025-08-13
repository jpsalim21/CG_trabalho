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

        this.timeOnState = 0;
        this.maxTime = 5;

        this.sinOffset = Math.random() * 2 * Math.PI;

        this.tamSprite = 10;
        this.alturaSprite = 0.8;

        this.municao = 5;

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

}

export { PainElemental };