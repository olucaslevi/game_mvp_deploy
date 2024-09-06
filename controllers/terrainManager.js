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
            this.scene.add(this.model);
        });
        const terrain = this.createTerrain();
        this.scene.add(terrain);
        return terrain; // Retorna o terreno para ser usado pelo InputManager
    }
    createTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
        const terrainMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0,
            depthWrite:false,
            color: 0x8b4513,
            roughness: 1,
            metalness: 0,
        });
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.position.y = -10;
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // Iluminação branca
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.1); // Luz de preenchimento mais suave
        directionalLight.position.set(0, 1, 1).normalize(); // Ajuste da posição da luz direcional
        fillLight.position.set(-1, -1, -5).normalize(); // Ajuste da posição da luz de preenchimento
        this.scene.add(directionalLight);
        this.scene.add(fillLight);
        this.setupLights();
        return terrain;
    }
    setupLights() {
        // Luz direcional principal (luz do sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Luz direcional principal
        directionalLight.position.set(100, 100, 100); // Posição da luz
        directionalLight.castShadow = true; // Permitir que a luz crie sombras
        // Aumentar o campo de sombra da luz direcional
        directionalLight.shadow.mapSize.width = 2048; // Tamanho do mapa de sombras
        directionalLight.shadow.mapSize.height = 2048;
        // Ajuste o campo de visão da câmera de sombra
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);
        // Luz de preenchimento suave
        const fillLight = new THREE.DirectionalLight(0xffeedd, 0.5); // Luz de preenchimento mais suave com um tom quente
        fillLight.position.set(-100, 100, -100).normalize();
        fillLight.castShadow = true;
        this.scene.add(fillLight);
        // Luz ambiente para iluminação geral
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Luz ambiente suave para iluminar todas as direções
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
