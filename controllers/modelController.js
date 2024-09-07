import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ModelController {
    constructor(scene,glowMaterial) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.animations = {};
    }
    loadModel(url, position, rotation, scale, color, callback) {
        this.loader.load(
            url,
            (glb) => {
                const model = glb.scene;
                model.position.copy(position);
                model.scale.set(scale, scale, scale);       
                model.rotation.set(rotation.x, rotation.y, rotation.z);
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true; 
                        child.receiveShadow = true;
                    }
                });
                this.scene.add(model);
                if (glb.animations && glb.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    model.userData.mixer = mixer;
                    model.userData.activeAction = null;
                }
                model.userData.animations = {};
                glb.animations.forEach((animation) => {
                    model.userData.animations[animation.name] = animation;
                });
                if (callback) callback(model);
            },
        );
    }
    playAnimation(model, animationName, speed = 1, duration = 1) {
        if (!model || !model.userData.mixer) {
            return;
        }
        const mixer = model.userData.mixer;
        const animation = model.userData.animations[animationName];
        if (animation) {
            if (model.userData.activeAction instanceof THREE.AnimationAction) {
                model.userData.activeAction.stop();
            }
            const action = mixer.clipAction(animation);
            action.setEffectiveTimeScale(speed);
            action.setDuration(duration);
            action.setEffectiveWeight(1);
    
            action.play();
            model.userData.activeAction = action;
        } else {
            console.warn(`Animation "${animationName}" not found`);
        }
    }
    stopAnimation(model, animationName) {
        if (!model || !model.userData.mixer) {
            return;
        }

        const mixer = model.userData.mixer;
        const animation = model.userData.animations[animationName];

        if (animation) {
            const action = mixer.clipAction(animation);
            action.stop();
        } else {
            console.warn(`Animation "${animationName}" not found`);
        }
    }
    createSoldier(position, color, callback) {
        const url = './models/AI/lagarto.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.06;
        this.loadModel(url, position, rotation, scale, color, callback);
    }
    createTower(position, color, callback) {
        const url = './models/tower.glb';
        const rotation = new THREE.Vector3(1, 0, 0);
        const scale = 1;
        this.loadModel(url, position, rotation, scale, color, callback);
    }
    createProjectile(position, color, callback) {
        const url = './../banana.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.8;
        this.loadModel(url, position, rotation, scale, color, callback);
    }
    createTerrain(callback) {
        const url = './models/terrain.glb';
        const position = new THREE.Vector3(0, 0, 0);
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 2;
        this.loadModel(url, position, rotation, scale, null, callback);
    }
    createWarrior(position, callback) {
        const url = './models/AI/warrior.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.06;
        this.loadModel(url, position, rotation, scale, null, callback);
    }
    createArcher(position, callback) {
        const url = './models/AI/archer.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.06;
        this.loadModel(url, position, rotation, scale, null, callback);
    }
    removeModel(model) {
        this.scene.remove(model);
    }
    getAnimationDuration(model, animationName) {
        if (!model) {
            return 0;
        }
        const animation = model.userData.animations[animationName];
        if (animation) {
            return animation.duration;
        } else {
            console.warn(`Animation "${animationName}" not found`);
            return 0;
        }
    }
    switchModel(currentModel, newUrl, callback) {
        // Remove o modelo atual da cena
        if (currentModel) {
            this.scene.remove(currentModel);
        }
    
        // Carrega o novo modelo
        this.loadModel(newUrl, currentModel.position, currentModel.rotation, currentModel.scale.x, null, (newModel) => {
            // Define o novo modelo como ativo
            newModel.position.copy(currentModel.position);
            newModel.rotation.copy(currentModel.rotation);
            newModel.scale.copy(currentModel.scale);
    
            // Adiciona o novo modelo na cena
            this.scene.add(newModel);
    
            // Toca a animação "Walk" no novo modelo
            this.playAnimation(newModel, 'Walk', 1, 2); // Inicia a animação "Walk"
    
            // Chama o callback para atualizar a referência do modelo
            if (callback) callback(newModel);
        });
    }
    
    update(delta) {
        this.scene.children.forEach(child => {
            if (child.userData.mixer) {
                child.userData.mixer.update(delta);
            }
        });
    }
}
export default ModelController;
