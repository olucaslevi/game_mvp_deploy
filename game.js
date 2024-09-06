import * as THREE from 'three';
import { Player, Warrior, Archer } from './controllers/Player';
import TerrainManager from './controllers/terrainManager';
import { Tower } from './controllers/towerController';
import Soldier from './controllers/Soldier';
import InputManager from './input';
import CameraController from './controllers/cameraManager';
import ModelController from './controllers/modelController';
import GameGUI from './controllers/gameGUI';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.players = [];
        this.towers = [];
        this.soldiers = [];
        this.currentPlayerIndex = 0;
        this.raycaster = new THREE.Raycaster();
        this.terrain = null;
        this.cameraController = null;
        this.modelController = new ModelController(this.scene);
        this.clock = new THREE.Clock();
        this.gameGUI = null;
        this.spawnInterval = null;
        this.isIA = false;
    }
    start(selectedClass) {
        this.createTerrain();
        this.createCamera();
        this.createPlayers(selectedClass);
        this.gameGUI = new GameGUI(this.getCurrentPlayer(),this);
        this.createTowers();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.inputManager = new InputManager(this.raycaster, this.camera, this.terrain, this.getCurrentPlayer(), this.soldiers, this.towers);
        this.gameGUI.startTimer();
        this.animate();
    }
    addPlayer(player) {
        this.players.push(player);
    }
    setCurrentPlayer(index) {
        if (index >= 0 && index < this.players.length) {
            this.currentPlayerIndex = index;
        }
    }
    updatePlayerCoordinates() {
        const player = this.getCurrentPlayer(); // Obtém o jogador atual
        if (player) {
            const position = player.getPosition(); // Método que retorna a posição do jogador
            document.getElementById('coord-x').textContent = `${position.x.toFixed(1)}`;
            document.getElementById('coord-y').textContent = `${position.y.toFixed(1)}`;
        }
    }    
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    animate() {
        const delta = this.clock.getDelta();
        this.updatePlayerCoordinates(); 
        this.players.forEach(player => player.update(delta));
        if (this.cameraController) {
            this.cameraController.update();
        }
        this.soldiers.forEach(soldier => soldier.update(this.players, this.soldiers, this.towers));
        this.towers.forEach(tower => tower.update(this.getCurrentPlayer(), this.soldiers, this.towers));
        this.gameGUI.update();
        // Remover soldados e torres com saúde <= 0
        this.removeDeadObjects(this.soldiers);
        this.removeDeadObjects(this.towers);
        this.modelController.update(delta);
        this.renderer.render(this.scene, this.camera);

        if (this.checkGameOver()) {
            return;  // Não continua animando se o jogo acabou
        }
        requestAnimationFrame(() => this.animate());

        // Atualizar animações de mixers
        this.scene.children.forEach(child => {
            if (child.userData.mixer) {
                child.userData.mixer.update(delta);
            }
        });
    }
    removeDeadObjects(objects) {
        for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].health <= 0) {
                objects[i].mesh.geometry.dispose();
                objects[i].mesh.material.dispose();
                this.scene.remove(objects[i].mesh);
                objects.splice(i, 1);
            }
        }
    }

    
    showEndScreen(message) {
        document.getElementById('end-message').textContent = message;
        document.getElementById('end-screen').style.display = 'flex';
    }
    checkGameOver() {
        if (this.getCurrentPlayer().healthPoints <= 0) {
            this.showEndScreen('Você morreu!');  // Mensagem de fim de jogo
            return true;  // Indica que o jogo acabou
        }
        
        // Verifica se o tempo acabou
        if (this.gameGUI.getTime() <= 0) {
            this.showEndScreen('Tempo esgotado!');  // Mensagem de fim de jogo
            return true;  // Indica que o jogo acabou
        }
    
        // Verifica se todas as torres do time adversário foram destruídas
        const opponentTeam = this.getCurrentPlayer().team === 'blue' ? 'red' : 'blue';
        const opponentTowers = this.towers.filter(tower => tower.getTeam() === opponentTeam);
        if (opponentTowers.every(tower => tower.healthPoints <= 0)) {
            this.showEndScreen('Você venceu! Todas as torres inimigas foram destruídas!'); // Mensagem de fim de jogo
            return true;  // Indica que o jogo acabou
        }
    
        // Verifica se todas as torres do time do jogador foram destruídas
        const playerTowers = this.towers.filter(tower => tower.getTeam() === this.getCurrentPlayer().team);
        if (playerTowers.every(tower => tower.healthPoints <= 0)) {
            this.showEndScreen('Você perdeu! Todas as suas torres foram destruídas!'); // Mensagem de fim de jogo
            return true;  // Indica que o jogo acabou
        }
    
        return false;
    }
    
    createTerrain() {
        this.terrain = new TerrainManager(this.scene).createTerrain();
        this.scene.add(this.terrain);
    }
    createTowers() {
        const tower_blue_1 = new Tower(this.scene, new THREE.Vector3(-31,-34, 0), 24, 100, 100, 5, this.camera, 'blue',this.gameGUI);
        const tower_red_1 = new Tower(this.scene, new THREE.Vector3(51,5, 0), 24, 100, 100, 5, this.camera, 'red',this.gameGUI);
        const tower_blue_2 = new Tower(this.scene, new THREE.Vector3(-61, -52, 0), 24, 100, 100, 5, this.camera, 'blue',this.gameGUI);
        const tower_red_2 = new Tower(this.scene, new THREE.Vector3(15,5, 0), 24, 100, 100, 5, this.camera, 'red',this.gameGUI);
        this.towers.push(tower_blue_1, tower_red_1, tower_blue_2, tower_red_2);
    }
    createPlayers(selectedClass) {
        let player;
        const position = new THREE.Vector3(-42,-50, 0);
        if (selectedClass === 'Warrior') {
            player = new Warrior(this.scene, position, this.camera, this.renderer, 'blue', this.cameraController);
        } else if (selectedClass === 'Archer') {
            player = new Archer(this.scene, position, this.camera, this.renderer, 'blue', this.cameraController);
        }
        this.players.push(player);
    }
    createCamera() {
        // Passe uma função para acessar o jogador atual dinamicamente
        this.cameraController = new CameraController(this.camera, () => this.getCurrentPlayer());
    } 
}
export default Game;