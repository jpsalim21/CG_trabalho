import * as THREE from "three";

class PlataformaChave {
    constructor(scene, position, chave) {
        this.scene = scene;
        this.position = position;
        this.chave = chave;
        this.alturaAlvo = 5;
        this.velocidade = 0.5;
        this.ativo = false;
        
        this.plataforma = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshPhongMaterial({ color: 0x888888 }));
        this.plataforma.position.copy(position);
        this.plataforma.add(chave.mesh);
        chave.mesh.position.set(0, 3, 0); // Ajusta a posição da chave na plataforma
        scene.add(this.plataforma);
        
        this.render();
    }

    ativar() {
        this.ativo = true;
        this.chave.mesh.visible = true;
    }

    update() {
        if (!this.ativo) return;
        
        if (this.plataforma.position.y < this.alturaAlvo) {
            this.plataforma.position.y += this.velocidade * 0.016; // 0.016 aproxima 60fps
            this.chave.bb.setFromObject(this.chave.mesh);
        }
    }

    render() {
        this.update();
        requestAnimationFrame(() => this.render());
    }
}

export { PlataformaChave };