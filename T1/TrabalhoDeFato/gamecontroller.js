import { plataformaChave1, block15} from "./cenario.js";

let chave2Obj = null;

class GameController {
    constructor(){
        if(GameController.instance) {
            return GameController.instance;
        }

        this.chave1 = false;
        this.chave2 = false;
        this.chave3 = false;
        this.inimigosArea1 = [];
        this.inimigosArea2 = [];

        GameController.instance = this;
    }

    addInimigoArea1(inimigo) {
        console.log("Inimigo adicionado na area 1");
        this.inimigosArea1.push(inimigo);
    }

    addInimigoArea2(inimigo) {
        console.log("Inimigo adicionado na area 2");
        this.inimigosArea2.push(inimigo);
    }

    inimigoMorreu(inimigo) {
        const index1 = this.inimigosArea1.indexOf(inimigo);
        if (index1 !== -1) {
            this.inimigosArea1.splice(index1, 1);
            this.verificarArea1();
        }

        const index2 = this.inimigosArea2.indexOf(inimigo);
        if (index2 !== -1) {
            this.inimigosArea2.splice(index2, 1);
            this.verificarArea2();
        }
    }

    verificarArea1() {
        if (this.inimigosArea1.length === 0 && !this.chave1) {
            // Ativar plataforma com chave vermelha
            this.ativarPlataformaChave1();
        }
    }

    verificarArea2() {
        if (this.inimigosArea2.length === 0 && !this.chave2) {
            // Revelar chave amarela
            this.revelarChave2();
        }
    }

    ativarPlataformaChave1() {
        plataformaChave1.ativar();
    }

    revelarChave2() {
        // Crie a chave amarela
        chave2Obj = new Chave(scene, player.bb, 'amarela');
        for (let i = 0; i < 20; i++){
            block15.position.y +=1;
        } // Ajusta a posição da chave
        chave2Obj.mesh.position.copy(block15.position);
        chave2Obj.mesh.position.y += 20;
        scene.add(chave2Obj.mesh);
    }

    pauseGame() {
        console.log("Jogo pausado");
    }

    resumeGame() {
        console.log("Jogo retomado");
    }
}

export { GameController };