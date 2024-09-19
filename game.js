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
        this.initializeGame();
    }
    initializeGame() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.players = [];
        this.towers = [];
        this.soldiers = [];
        this.currentPlayerIndex = 0;
        this.raycaster = new THREE.Raycaster();
        this.terrain = null;
        this.clock = new THREE.Clock();
        this.gameGUI = null;
        this.spawnInterval = null;
        this.isIA = false;
    }
    start(selectedClass, selectedModelType) {
        this.modelType = selectedModelType;
        this.modelController = new ModelController(this.scene, this.modelType);
        this.createTerrain();
        this.createSky();
        this.createPlayers(selectedClass);
        this.createCamera();
        this.createGameGUI();
        this.createTowers();
        this.setupRenderer();
        this.setupInputManager();
        this.gameGUI.startTimer();
        this.animate();
    }
    createSky() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x30A3BC) },
                bottomColor: { value: new THREE.Color(0xD4B77A) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform vec3 sunColor;
                uniform float offset;
                uniform float exponent;
                uniform float hazeAmount;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).z;
                    float gradientMix = pow(max(h, 0.0), exponent);
                    vec3 skyColor = mix(bottomColor, topColor, gradientMix);
                    float sunEffect = smoothstep(0.0, 1.0, h);
                    skyColor = mix(skyColor, sunColor, sunEffect * 0.3);
                    float distance = length(vWorldPosition);
                    float fogFactor = exp(-distance * hazeAmount);
                    skyColor = mix(skyColor, bottomColor, 1.0 - fogFactor);
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    createPlayers(selectedClass) {
        const position = new THREE.Vector3(-42, -50, 0);
        let player;
    
        if (selectedClass === 'Warrior') {
            player = new Warrior(this.scene, position, this.camera, this.renderer, 'blue', this.cameraController, this.modelType);
        } else if (selectedClass === 'Archer') {
            player = new Archer(this.scene, position, this.camera, this.renderer, 'blue', this.cameraController, this.modelType);
        }
        this.players.push(player);
    }
    createCamera() {
        this.cameraController = new CameraController(this.camera, () => this.getCurrentPlayer());
    }
    createGameGUI() {
        this.gameGUI = new GameGUI(this.getCurrentPlayer(), this);
    }
    setupRenderer() {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    setupInputManager() {
        this.inputManager = new InputManager(
            this.raycaster,
            this.camera,
            this.terrain,
            this.getCurrentPlayer(),
            this.soldiers,
            this.towers,
            this.cameraController
        );
    }
    createTerrain() {
        this.terrain = new TerrainManager(this.scene).createTerrain();
        this.scene.add(this.terrain);
    }
    createTowers() {
        const towerPositions = [
            { position: new THREE.Vector3(-31, -34, 0), team: 'blue' },
            { position: new THREE.Vector3(51, 5, 0), team: 'red' },
            { position: new THREE.Vector3(-61, -52, 0), team: 'blue' },
            { position: new THREE.Vector3(15, 5, 0), team: 'red' }
        ];
        towerPositions.forEach(({ position, team }) => {
            const tower = new Tower(this.scene, position, 24, 200, 400, 5, this.camera, team, this.gameGUI,this.modelType);
            this.towers.push(tower);
        });
    }
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    updatePlayerCoordinates() {
        const player = this.getCurrentPlayer();
        if (player) {
            const position = player.getPosition();
            document.getElementById('coord-x').textContent = `${position.x.toFixed(1)}`;
            document.getElementById('coord-y').textContent = `${position.y.toFixed(1)}`;
        }
    }
    animate() {
        const delta = this.clock.getDelta();
        this.updatePlayerCoordinates();
        this.players.forEach(player => player.update(delta));
        this.cameraController?.update();
        this.inputManager?.update();
        this.soldiers.forEach(soldier => soldier.update(this.players, this.soldiers, this.towers));
        this.towers.forEach(tower => tower.update(this.getCurrentPlayer(), this.soldiers, this.towers));
        this.gameGUI.update();
        this.removeDeadObjects(this.soldiers);
        this.removeDeadObjects(this.towers);
        this.modelController.update(delta);
        this.renderer.render(this.scene, this.camera);

        if (!this.checkGameOver()) {
            requestAnimationFrame(() => this.animate());
        }

        this.updateMixers(delta);
    }
    updateMixers(delta) {
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
            this.showEndScreen('Você morreu!');
            return true;
        }
        if (this.gameGUI.getTime() <= 0) {
            this.showEndScreen('Tempo esgotado!');
            return true;
        }
        const opponentTeam = this.getCurrentPlayer().team === 'blue' ? 'red' : 'blue';
        const opponentTowers = this.towers.filter(tower => tower.getTeam() === opponentTeam);
        if (opponentTowers.every(tower => tower.healthPoints <= 0)) {
            this.showEndScreen('Você venceu! Todas as torres inimigas foram destruídas!');
            return true;
        }
        const playerTowers = this.towers.filter(tower => tower.getTeam() === this.getCurrentPlayer().team);
        if (playerTowers.every(tower => tower.healthPoints <= 0)) {
            this.showEndScreen('Você perdeu! Todas as suas torres foram destruídas!');
            return true;
        }
        return false;
    }
}

export default Game;
