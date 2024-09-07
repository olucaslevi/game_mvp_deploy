import * as THREE from 'three';
import ModelController from './modelController';

class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.modelController = new ModelController(this.scene);
        this.initializeTerrain();
    }
    
    initializeTerrain() {
        this.modelController.createTerrain((model) => {
            this.model = model;
            this.model.renderOrder = -1; // Defina um renderOrder baixo para o modelo do terreno
            this.scene.add(this.model);
        });
        const terrain = this.createTerrain();
        terrain.renderOrder = -1; // Defina um renderOrder baixo para o plano do terreno
        this.scene.add(terrain);
        return terrain;
    }

    createTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
        const terrainMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: true, // Certifique-se de que a escrita de profundidade esteja ativada
            depthTest: true,  // Certifique-se de que o teste de profundidade esteja ativado
            color: 0x8b4513,
            roughness: 1,
            metalness: 0,
        });
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.position.y = -10;
        terrain.renderOrder = -1; // Certifique-se de que o terreno seja renderizado primeiro

        this.setupLights();
        return terrain;
    }

    setupLights() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffeedd, 0.5);
        fillLight.position.set(-100, 100, -100).normalize();
        fillLight.castShadow = true;
        this.scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
    }

    getHeightAtPoint(x, z) {
        if (!this.model) return 0; // Se o modelo ainda não foi carregado, retorna 0
        const terrain = this.model;
        const geometry = terrain.geometry;
        const vertices = geometry.attributes.position.array;
        const index = Math.floor((x + 100) / 200 * 32) + Math.floor((z + 100) / 200 * 32) * 33; // Exemplo simplificado
        return vertices[index * 3 + 1] || 0; // Retorna a altura no eixo Y
    }
}
export default TerrainManager;
