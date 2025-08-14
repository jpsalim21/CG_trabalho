export class HealthBarUI {
    constructor() {
        this.fillElement = document.getElementById('health-bar-fill');
        this.textElement = document.getElementById('health-bar-text');

        if (!this.fillElement || !this.textElement) {
            console.error("Elementos da barra de vida não encontrados no HTML!");
        }
    }

    /**
     * Atualiza a largura e a cor da barra de vida com base na vida atual.
     * @param {number} currentHealth Vida atual do jogador.
     * @param {number} maxHealth Vida máxima do jogador.
     */
    update(currentHealth, maxHealth) {
        if (!this.fillElement || !this.textElement) return;

        const healthPercentage = (Math.max(0, currentHealth) / maxHealth) * 100;

        this.fillElement.style.width = `${healthPercentage}%`;

        this.textElement.textContent = `${currentHealth} / ${maxHealth}`;

        this.fillElement.className = 'health-bar-fill'; 
        if (healthPercentage > 75) {
            this.fillElement.classList.add('high'); 
        } else if (healthPercentage > 50) {
            this.fillElement.classList.add('medium'); 
        } else if (healthPercentage > 25) {
            this.fillElement.classList.add('low'); 
        } else {
            this.fillElement.classList.add('critical'); 
        }
    }

}