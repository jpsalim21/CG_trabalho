import { plataformaChave1, plataformaChave2, plataformaChave3} from "../cenario/cenario.js";
import { SoundController } from "./soundcontroller.js";

class GameController {
    constructor(){
        if(GameController.instance) {
            return GameController.instance;
        }

        this.inimigosArea1 = [];
        this.inimigosArea2 = [];
        this.inimigosArea3 = []; // Hangar - Zombieman

        this.chave1 = false;
        this.chave2 = false;
        this.chave3 = false;

        this.iChave1 = null;
        this.iChave2 = null;
        this.iChave3 = null;

        // Mapeia a tecla Q para ligar/desligar música
        window.addEventListener("keydown", (event) => {
            if (event.code === "KeyQ") {
                this.soundController.soundBackground();
                showTemporaryMessage("Música pausada.");
            }
        })

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

    addInimigoArea3(inimigo) {
        console.log("Inimigo adicionado na area 3 (hangar)");
        this.inimigosArea3.push(inimigo);
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

        const index3 = this.inimigosArea3.indexOf(inimigo);
        if (index3 !== -1) {
            this.inimigosArea3.splice(index3, 1);
            this.verificarArea3();
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

    verificarArea3() {
        if (this.inimigosArea3.length === 0) {
            console.log("Todos os zombieman do hangar foram derrotados");
            showTemporaryMessage("Zombieman eliminados! A chave azul está disponível no hangar.", 5000);
            if (window.plataformaChave3) {
                window.plataformaChave3.ativar();
            }
        }
    }

    pauseGame() {
        console.log("Jogo pausado");
    }

    resumeGame() {
        console.log("Jogo retomado");
    }

    pegarTodasChaves() {
        console.log("Todas as chaves foram pegas");
        this.chave1 = true;
        this.iChave1.pegaPorController();
        this.chave2 = true;
        this.iChave2.pegaPorController();
        this.chave3 = true;
        this.iChave3.pegaPorController();
    }

}

export { GameController };