
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
        const debounceEvent = (func, delay) => {
            let timeout;
            return function (...args) {
                if (timeout) {
                    return;
                }
                timeout = setTimeout(() => {
                    func.apply(this, args);
                    timeout = null;
                }, delay);
            };
        };
        document.getElementById('button').addEventListener('click', debounceEvent(() => {
            this.event();
        }, 5000));
    }
    event() {
        const player = this.gameInstance.getCurrentPlayer();
        let newUrl;
        if (player.currentModelState === 'AI') {
            if (player instanceof Warrior) {
                newUrl = './models/warrior.glb';
            } else if (player instanceof Archer) {
                newUrl = './models/archer.glb';
            }
            player.currentModelState = 'no-AI';
        } else {
            if (player instanceof Warrior) {
                newUrl = './models/warriorManual.glb';
            } else if (player instanceof Archer) {
                newUrl = './models/archerManual.glb';
            }
            player.currentModelState = 'AI';
        }
        this.gameInstance.modelController.switchModel(player.model, newUrl, (newModel) => {
            player.model = newModel;
        });
        this.gameInstance.soldiers.forEach(soldier => {
            if (!soldier.isAlive() || soldier.isDead) return;
    
            let newSoldierUrl;
            if (soldier.currentModelState === 'AI') {
                newSoldierUrl = './models/lagarto.glb';
                soldier.currentModelState = 'no-AI';
            } else {
                newSoldierUrl = './models/lagartoManual.glb';
                soldier.currentModelState = 'AI';
            }
    
            this.gameInstance.modelController.switchModel(soldier.model, newSoldierUrl, (newModel) => {
                soldier.model = newModel;
            });
        });
    }
    update() {
        this.healthBar.style.width = `${this.player.healthPoints}%`;
    }    
    updateKillCount(team) {
    
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
