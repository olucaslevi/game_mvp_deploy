import Game from './game';
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    let selectedClass = null;
    document.getElementById('warrior-button').addEventListener('click', () => {
        selectedClass = 'Warrior';
        document.getElementById('error-message').style.display = 'none';
    });
    document.getElementById('archer-button').addEventListener('click', () => {
        selectedClass = 'Archer';
        document.getElementById('error-message').style.display = 'none';
    });
    document.getElementById('button').addEventListener('click', () => {
        // pass
    });
    document.getElementById('start-button').addEventListener('click', () => {
        if (selectedClass) {
            document.getElementById('start-screen').style.display = 'none';
            game.start(selectedClass);
        } else {
            document.getElementById('error-message').style.display = 'block';
        }
    });
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('end-screen').style.display = 'none';
        window.location.reload();
    });
    game.showEndScreen = (message) => {
        document.getElementById('end-message').textContent = message;
        document.getElementById('end-screen').style.display = 'flex';
    };
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('end-screen').style.display = 'none';
});
