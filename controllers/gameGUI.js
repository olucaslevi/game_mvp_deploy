
import { Warrior, Archer, Player } from './../controllers/Player';
class GameGUI {
    constructor(player,gameInstance) {
        this.player = player;
        this.gameInstance = gameInstance;
        this.healthBar = document.getElementById('health-bar');
        this.timerElement = document.getElementById('timer');
        this.blueTeamKillsElement = document.getElementById('blue-team-kills');
        this.redTeamKillsElement = document.getElementById('red-team-kills');
        this.remainingTime = 3 * 60;
        this.timerInterval = null;
        this.initEvents();
        this.startTimer();
        this.blueTeamKills = 0;
        this.redTeamKills = 0;
    }
    initEvents() {
        document.getElementById('button').addEventListener('click', () => {
            this.event();
        });
    }
    event() {
        console.log("Clicou...");
    
        // Obtenha a referência ao jogador atual
        const player = this.gameInstance.getCurrentPlayer();
    
        // Verifica o estado atual do modelo do jogador e alterna entre os URLs
        let newUrl;
        if (player.currentModelState === 'AI') {
            if (player instanceof Warrior) {
                newUrl = './models/no-AI/warrior-without-AI.glb';
            } else if (player instanceof Archer) {
                newUrl = './models/no-AI/archer-without-AI.glb';
            }
            player.currentModelState = 'no-AI'; // Atualiza o estado para 'no-AI'
        } else {
            if (player instanceof Warrior) {
                newUrl = './models/AI/warrior-with-AI.glb';
            } else if (player instanceof Archer) {
                newUrl = './models/AI/archer-with-AI.glb';
            }
            player.currentModelState = 'AI'; // Atualiza o estado para 'AI'
        }
    
        // Troca o modelo do jogador e inicia a animação "Walk"
        this.gameInstance.modelController.switchModel(player.model, newUrl, (newModel) => {
            player.model = newModel; // Atualiza o modelo do jogador
        });
    
        // Alterna o modelo dos soldados e inicia a animação "Walk"
        this.gameInstance.soldiers.forEach(soldier => {
            let newSoldierUrl;
            if (soldier.currentModelState === 'AI') {
                newSoldierUrl = './models/no-AI/lagarto-without-AI.glb';
                soldier.currentModelState = 'no-AI'; // Atualiza o estado para 'no-AI'
            } else {
                newSoldierUrl = './models/AI/lagarto-with-AI.glb';
                soldier.currentModelState = 'AI'; // Atualiza o estado para 'AI'
            }
    
            this.gameInstance.modelController.switchModel(soldier.model, newSoldierUrl, (newModel) => {
                soldier.model = newModel; // Atualiza o modelo do soldado
            });
        });
    }
    
    
    update() {
        this.healthBar.style.width = `${this.player.healthPoints}%`;
    }    
    updateKillCount(team) {
        console.log(`Updating kill count for team: ${team}`);
    
        if (team === 'blue') {
            this.blueTeamKills++;
            if (this.blueTeamKillsElement) { 
                this.blueTeamKillsElement.textContent = this.blueTeamKills; 
            }
        } else if (team === 'red') {
            this.redTeamKills++;
            if (this.redTeamKillsElement) {
                this.redTeamKillsElement.textContent = this.redTeamKills;
            }
        }
    }
    
    startTimer() {
        if (this.timerInterval) {
            return;
        }
        this.timerInterval = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                this.updateTimerDisplay();
            } else {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }
    updateTimerDisplay() {
        const minutes = String(Math.floor(this.remainingTime / 60)).padStart(2, '0');
        const seconds = String(this.remainingTime % 60).padStart(2, '0');
        this.timerElement.textContent = `${minutes}:${seconds}`;
    }
    endGame() {
        this.gameInstance.showEndScreen('Tempo acabou!');
    }
    getTime() {
        return this.remainingTime;
    }
}
export default GameGUI;
