import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ModelController {
    constructor(scene,modelType) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.animations = {};
        this.modelType = modelType;
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
        if (model.userData.isDead) {
            console.warn(`Tentativa de reproduzir animação em um modelo de soldado morto: ${model.name}`);
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
            console.warn(`Animation "${animationName}" not found for model: ${model.name}`);
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
        const url = this.modelType === 'AI' ? './models/lagarto.glb' : './models/lagartoManual.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.06;
        this.loadModel(url, position, rotation, scale, color, callback);
    }
    createTower(position, color, callback) {
        const url = this.modelType === 'AI' ? './models/towerIA.glb' : './models/tower.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 1;
        this.loadModel(url, position, rotation, scale, color, callback);
    }
    createWarrior(position, callback) {
        const url = this.modelType === 'AI' ? './models/warrior.glb' : './models/warriorManual.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.06;
        this.loadModel(url, position, rotation, scale, null, callback);
    }
    createArcher(position, callback) {
        const url = this.modelType === 'AI' ? './models/archer.glb' : './models/archerManual.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.06;
        this.loadModel(url, position, rotation, scale, null, callback);
    }
    createTerrain(callback) {
        const url = './models/terrain.glb';
        const position = new THREE.Vector3(0, 0, 0);
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 2;
        this.loadModel(url, position, rotation, scale, null, callback);
    }
    removeModel(model) {
        if (!model) return;
    
        model.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
            if (child.userData.mixer) {
                child.userData.mixer.stopAllAction(); // Para todas as animações
                child.userData.mixer = null; // Remove o mixer
            }
        });
    
        this.scene.remove(model);
        model = null; // Libera a referência ao modelo para o coletor de lixo
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
        if (!currentModel) {
            console.warn('No current model to switch from.');
            return;
        }
        const currentPosition = currentModel.position.clone();
        const currentRotation = currentModel.rotation.clone();
        const currentScale = currentModel.scale.clone();
        this.disposeModel(currentModel);
        this.loadModel(newUrl, currentPosition, currentRotation, currentScale.x, null, (newModel) => {
            if (currentModel.userData.isDead) {
                console.warn('O modelo atual pertence a um soldado que já foi morto. Ignorando a troca.');
                return;
            }
            newModel.position.copy(currentPosition);
            newModel.rotation.copy(currentRotation);
            newModel.scale.copy(currentScale);
            this.scene.add(newModel);
            this.playAnimation(newModel, 'Walk', 1, 2);
            if (callback) callback(newModel);
        });
    }
    disposeModel(model) {
        if (!model) return;
    
        // Remove o modelo da cena
        this.scene.remove(model);
    
        // Percorre os componentes do modelo para liberar memória
        model.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
            if (child.userData.mixer) {
                child.userData.mixer.stopAllAction(); // Para todas as animações
                child.userData.mixer = null; // Remove o mixer
            }
        });
        model = null; // Remove a referência ao modelo
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
