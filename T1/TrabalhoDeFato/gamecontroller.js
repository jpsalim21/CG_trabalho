import { plataformaChave1, plataformaChave2} from "./cenario.js";

class GameController {
    constructor(){
        if(GameController.instance) {
            return GameController.instance;
        }

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
        if (this.inimigosArea1.length === 0) {
            // Ativar plataforma com chave vermelha
            console.log("Todos os inimigos da área 1 foram derrotados");
            showTemporaryMessage("Inimigos da área 1 eliminados, pegue a chave vermelha para desbloquear a área 2.", 5000);
            plataformaChave1.ativar();
        }
    }

    verificarArea2() {
        if (this.inimigosArea2.length === 0) {
            console.log("Todos os inimigos da área 2 foram derrotados");
            showTemporaryMessage("Inimigos da área 2 eliminados, pegue a chave amarela.", 5000);
            plataformaChave2.ativar();
        }
    }

    pauseGame() {
        console.log("Jogo pausado");
    }

    resumeGame() {
        console.log("Jogo retomado");
    }

}

export { GameController };