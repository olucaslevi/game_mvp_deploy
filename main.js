import Game from './game';
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    let selectedClass = null;
    let selectedModelType = null;
    document.getElementById('warrior-button').addEventListener('click', () => {
        selectedClass = 'Warrior';
        document.getElementById('error-message').style.display = 'none';
    });
    document.getElementById('archer-button').addEventListener('click', () => {
        selectedClass = 'Archer';
        document.getElementById('error-message').style.display = 'none';
    });
    document.getElementById('ai-model-button').addEventListener('click', () => {
        selectedModelType = 'AI';
        document.getElementById('error-message').style.display = 'none';
    });
    document.getElementById('manual-model-button').addEventListener('click', () => {
        selectedModelType = 'Manual';
        document.getElementById('error-message').style.display = 'none';
    });
    document.getElementById('start-button').addEventListener('click', () => {
        if (selectedClass && selectedModelType) {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('gui-container').style.display = 'flex';
            game.start(selectedClass, selectedModelType);
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
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button'); // Seleciona todos os botões

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'selected' de todos os botões
            buttons.forEach(btn => btn.classList.remove('selected'));
            
            // Adiciona a classe 'selected' ao botão clicado
            button.classList.add('selected');
        });
    });
});
