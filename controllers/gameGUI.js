
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
