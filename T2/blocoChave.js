import * as THREE from "three";
class BlocoChave {
    constructor(scene, block, chave) {
        this.scene = scene;
        this.block = block;
        this.chave = chave;
        this.alturaOriginal = block.position.y;
        this.alturaAlvo = this.alturaOriginal + 7;
        this.velocidade = 0.8;
        this.ativo = true;
        
        // Posiciona a chave embaixo do bloco
        this.chave.mesh.position.set(this.block.position.x, this.block.position.y - 15, this.block.position.z);
        //this.chave.mesh.visible = false;
        this.scene.add(this.chave.mesh);
        
        this.chave.bb.setFromObject(this.chave.mesh);
        
        this.render();
    }

    ativar() {
        console.log("Bloco ativado para revelar chave");
        this.ativo = true;
        this.chave.mesh.visible = true;
        this.chave.ativa = true;
    }

    update() {
        if (!this.ativo) return;
        
        if (this.block.position.y < this.alturaAlvo) {
            this.block.position.y += this.velocidade * 0.016;
            this.chave.mesh.position.y = this.block.position.y - 15;
            this.chave.bb.setFromObject(this.chave.mesh);
        }
    }

    render() {
        requestAnimationFrame(() => this.render());
        this.update();
    }
}

export { BlocoChave };