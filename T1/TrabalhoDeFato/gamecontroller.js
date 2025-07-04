class GameController {
    constructor(){
        if(GameController.instance) {
            return GameController.instance;
        }

        this.chave1 = false;
        this.chave2 = false;
        this.chave3 = false;

        GameController.instance = this;
    }

    pauseGame() {
        console.log("Jogo pausado");
    }

    resumeGame() {
        console.log("Jogo retomado");
    }
}

const gameController = new GameController();
export default gameController;