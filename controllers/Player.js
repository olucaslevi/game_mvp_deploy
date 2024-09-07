import * as THREE from 'three';
import { HealthBarManager } from './healthBarManager';
import ModelController from './modelController';
import { DamageIndicator } from './damageIndicator';
import NameTag from './nameTag';
import CameraController from './cameraManager';

class Player {
    constructor(scene, position, camera, renderer, team, cameraController) {
        this.scene = scene;
        this.position = position;
        this.team = team;
        this.mesh = this.createMesh();
        scene.add(this.mesh);
        this.targetPosition = null;
        this.speed = 0.2;
        this.healthPoints = 300;
        this.damage = 10;
        this.camera = camera;
        this.cameraController = new CameraController(this.camera, this.targetPosition);
        this.renderer = renderer;
        this.attackRange = 2;
        this.target = null;
        this.cooldown = 50;
        this.currentModelState = 'AI';
        this.lastIndicatorTime = 0;
        this.debounceTime = 800;
        this.healthBarManager = new HealthBarManager(this, camera, renderer);
        this.model = null
        this.playerName = "Jogador";
        this.nameTag = new NameTag(scene, this.mesh, "Jogador");
    }
    moveTo(position, target = null) {
        if (this.model && this.model.userData.activeAction !== 'Walk') {
            this.modelController.playAnimation(this.model, 'Walk',2,2);
            this.model.userData.activeAction = 'Walk';
        }
        
        this.targetPosition = position.clone();
        this.updateDestinationIndicator(position);
        if (target) {
            this.target = target;
        }
    }
    updateDestinationIndicator(position) {
        const currentTime = performance.now(); 
        if (currentTime - this.lastIndicatorTime < this.debounceTime) {
            return;
        }
        this.lastIndicatorTime = currentTime;
        if (this.destinationIndicator) {
            this.scene.remove(this.destinationIndicator);
            this.destinationIndicator.geometry.dispose();
            this.destinationIndicator.material.dispose();
            this.destinationIndicator = null;
        }
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.destinationIndicator = new THREE.Mesh(geometry, material);
        this.scene.add(this.destinationIndicator);
        this.destinationIndicator.position.copy(position);
        setTimeout(() => {
            if (this.destinationIndicator) {
                this.scene.remove(this.destinationIndicator);
                this.destinationIndicator.geometry.dispose();
                this.destinationIndicator.material.dispose();
                this.destinationIndicator = null;
            }
            this.scene.remove(pointLight);
        }, 1000);
    }
    createMesh() {
        const geometry = new THREE.ConeGeometry(2, 2, 4);
        const material = new THREE.MeshBasicMaterial({
            color: 'red',
            opacity: 0,
            transparent: true,
            depthWrite: false,
            depthTest: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        return mesh;
    }
    lookAtTarget(target) {
        const targetPosition = target.getPosition();
        const directionToTarget = new THREE.Vector3().subVectors(targetPosition, this.mesh.position).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionToTarget);
        this.mesh.quaternion.copy(quaternion);
        if (this.model) {
            this.model.quaternion.copy(quaternion);
        }
    }
    takeDamage(damage, attackerPosition) {
        if (this.healthPoints <= 0) {
            return;
        }
        this.healthPoints -= damage;
        if (this.healthPoints <= 0) {
            this.healthPoints = 0;
        }
        new DamageIndicator(this.scene, this.mesh.position, damage);
        if (this.model) {
            this.modelController.playAnimation(this.model, 'Hit', 0.3, 0.5);
            setTimeout(() => {
                this.modelController.playAnimation(this.model, 'Idle', 10, 7);
            }, 100);
        }
        this.cameraController.shake(1.5);
        this.healthBarManager.update();
    }
    attack(target) {
        if (this.cooldown > 0 || target.getTeam() === this.team) {
            this.isAttacking = false;
            return;
        }
            const distance = this.mesh.position.distanceTo(target.position);
        if (distance <= this.attackRange+5) {
            target.takeDamage(this.damage);
            this.isAttacking = true;
            this.modelController.stopAnimation(this.model,'Walk');
            this.modelController.playAnimation(this.model, 'Attack',1,2);
        } else {
            this.isAttacking = false;
        }
        this.cooldown = 50;
    }
    update(delta) {
        if (this.nameTag) {
            this.nameTag.update(this.mesh.position);
        }
        if (this.targetPosition !== null && this.mesh.position.distanceTo(this.targetPosition) > 0.8) {
            if (!this.isMoving) {
                this.isMoving = true;
                // Toca a animação "Walk" se o modelo estiver definido
                if (this.model && this.modelController) {
                    this.modelController.playAnimation(this.model, 'Walk',2,2);
                }
            }
        } else if (this.isMoving) {
            // Quando o jogador chega ao destino, para a animação de "Walk" e inicia "Idle"
            this.isMoving = false;
            this.targetPosition = null;
            if (this.modelController) {
                this.modelController.stopAnimation(this.model, 'Walk');
                this.modelController.playAnimation(this.model, 'Idle', 10, 7);
            }
        }
        if (this.model) {
            this.model.position.copy(this.mesh.position);
            this.model.rotation.copy(this.mesh.rotation);
        }
        if (this.model && this.modelController) {
            this.modelController.update(delta);
        }
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        if (this.target) {
            if (!this.target.isAlive()) {
                this.target = null;
                this.isAttacking = false;
                if (this.modelController) {
                    this.modelController.stopAnimation(this.model, 'Attack');
                    this.modelController.playAnimation(this.model, 'Idle', 10, 7);
                }
                return;
            }
    
            const distanceToTarget = this.mesh.position.distanceTo(this.target.mesh.position);
            if (distanceToTarget <= this.attackRange) {
                if (this.cooldown <= 0) {
                    this.attack(this.target);
                    return;
                }
            } else {
                this.moveToTarget();
            }
        } else if (this.targetPosition) {
            this.moveToTarget();
        }
    }
    moveToTarget() {
        if (!this.targetPosition || !this.mesh.position) {
            return;
        }
        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position).normalize();
        const distanceToMove = Math.min(this.speed, this.mesh.position.distanceTo(this.targetPosition));
        this.mesh.position.addScaledVector(direction, distanceToMove);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        this.mesh.quaternion.copy(quaternion);
        if (this.mesh.position.distanceTo(this.targetPosition) < 0.3) {
            this.targetPosition = null;
            if (this.modelController) {
                this.modelController.stopAnimation(this.model, 'Walk');
                this.modelController.playAnimation(this.model, 'Idle', 10, 7);
            }
        }
    }
    getPosition() {
        return this.mesh.position.clone();
    }
    isAlive() {
        return this.healthPoints > 0;
    }
    getTeam() {
        return this.team;
    }
    setTarget(target) {
        const targetIndicator = document.getElementById('target-indicator');
    
        if (target && target.isAlive() && target.getTeam() !== this.team) {
            this.target = target;
            this.lookAtTarget(target);
    
            // Atualiza o indicador de target na GUI
            targetIndicator.textContent = `Target: ${target.name || 'Desconhecido'}`;
    
            // Muda a cor do target para indicar que foi selecionado
            this.highlightTarget(target);
    
            const distanceToTarget = this.mesh.position.distanceTo(target.position);
            if (distanceToTarget > this.attackRange) {
                this.targetPosition = target.position.clone();
            } else {
                this.targetPosition = null;
            }
        } else {
            // Se o target for nulo ou inválido
            this.removeHighlightFromTarget(); // Remove o destaque do target anterior
            this.target = null;
            this.targetPosition = null;
            targetIndicator.textContent = "Target: Nenhum"; // Reseta o indicador de target
        }
    }
    
    highlightTarget(target) {
        if (target && target.model) {
            target.model.traverse((child) => {
                if (child.isMesh) {
                    // Armazena a cor original do material
                    child.userData.originalColor = child.material.color.getHex();
    
                    // Define a cor para um amarelo mais forte
                    child.material.color.setHex(0xFFFF00); // Amarelo forte e chapado
                    child.material.emissive = new THREE.Color(0xFFFF00); // Emissivo em amarelo para maior brilho
                    child.material.emissiveIntensity = 0.8; // Ajuste de intensidade para destacar o brilho
                }
            });
        }
    }
    removeHighlightFromTarget() {
        if (this.target && this.target.model) {
            this.target.model.traverse((child) => {
                if (child.isMesh && child.userData.originalColor !== undefined) {
                    child.material.color.setHex(child.userData.originalColor); // Restaura a cor original
                    child.material.emissive = new THREE.Color(0x000000); // Remove o efeito emissivo
                    child.material.emissiveIntensity = 0; // Remove a intensidade emissiva
                    delete child.userData.originalColor; // Remove o dado de usuário
                }
            });
        }
    }
    
    getTarget() {
        return this.target ? this.target.position.clone() : null;
    }
    remove() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.scene.remove(this.mesh);
        if (this.nameTag) {
            this.nameTag.remove();
        }
    }
    updateHealthText() {
        this.healthBar.scale.x = this.healthPoints / 100;
    }
}
class Warrior extends Player {
    constructor(scene, position, camera, renderer, team) {
        super(scene, position, camera, renderer, team);
        this.attackRange = 8;
        this.damage = 20;
        this.modelController = new ModelController(this.scene)
        this.modelController.createWarrior(this.position,(model) => {
            this.model = model;
            this.modelController.playAnimation(this.model, 'Idle', 10, 7);
        });
    }
    attack(target) {
        if (this.cooldown > 0 || target.getTeam() === this.team) {
            this.isAttacking = false;
            return;
        }

        this.lookAtTarget(target);
        const distance = this.mesh.position.distanceTo(target.position);
        if (distance <= this.attackRange) {
            target.takeDamage(this.damage);
            this.isAttacking = true;
            this.modelController.playAnimation(this.model, 'Attack',3,2);
        } else {
            this.isAttacking = false;
        }

        this.cooldown = 50;
    }
}
class Archer extends Player {
    constructor(scene, position, camera, renderer, team) {
        super(scene, position, camera, renderer, team);
        this.attackRange = 26;
        this.damage = 12;
        this.projectiles = [];
        this.modelController = new ModelController(this.scene);
        this.modelController.createArcher(this.position, (model) => {
            this.model = model;
            this.modelController.playAnimation(this.model, 'Idle', 10, 7);
        });
    }

    attack(target) {
        if (this.cooldown > 0 || target.getTeam() === this.team || this.isAttacking) {
            this.isAttacking = false;
            return;
        }
        this.lookAtTarget(target);
        const distance = this.mesh.position.distanceTo(target.getPosition());
        if (distance <= this.attackRange) {
            this.isAttacking = true;
            this.modelController.playAnimation(this.model, 'Attack', 1, 4);
            this.shootArrow(target);
            setTimeout(() => {
                this.isAttacking = false;
                if (!this.isMoving) {
                    this.modelController.playAnimation(this.model, 'Idle', 10, 7);
                }
            }, this.modelController.getAnimationDuration(this.model, 'Attack') * 1000);
        }
        this.cooldown = 60;
    }

    shootArrow(target) {
        // Cria a geometria da flecha
        const arrowGeometry = new THREE.CylinderGeometry(0.1, 0.3, 4, 12);
    
        // Cria o material da flecha com configuração ajustada
        const arrowMaterial = new THREE.MeshBasicMaterial({
            color: 'yellow', // Cor marrom
            transparent: true, // Permite a transparência se necessário
            opacity: 0.8, // Totalmente opaco
            depthTest: true, // Habilita o teste de profundidade
            depthWrite: true, // Habilita a escrita de profundidade
        });
    
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    
        // Defina um renderOrder alto para garantir que a flecha seja renderizada depois do terreno
        arrow.renderOrder = 10; // Defina um valor alto para garantir que a flecha seja renderizada por último
    
        // Ajuste a posição da flecha
        arrow.position.copy(this.mesh.position);
        arrow.position.y += 1; // Eleve a flecha acima da posição inicial
    
        // Define a direção da flecha
        const arrowDirection = new THREE.Vector3().subVectors(target.getPosition(), this.mesh.position).normalize();
        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, arrowDirection);
        arrow.applyQuaternion(quaternion);
    
        // Adiciona a flecha na cena
        this.scene.add(arrow);
        this.projectiles.push(arrow);
    
        // Armazene dados de usuário para manipulação da flecha
        arrow.userData = { target, direction: arrowDirection, speed: 0.5 };
    }
    

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const arrow = this.projectiles[i];
            arrow.position.add(arrow.userData.direction.clone().multiplyScalar(arrow.userData.speed));
            const arrowDirection = arrow.userData.direction.clone();
            const axis = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, arrowDirection);
            arrow.setRotationFromQuaternion(quaternion);
            const distanceToTarget = arrow.position.distanceTo(arrow.userData.target.getPosition());
            if (distanceToTarget <= 1) {
                arrow.userData.target.takeDamage(this.damage);
                this.scene.remove(arrow);
                this.projectiles.splice(i, 1);
            }
        }
    }

    update(delta) {
        if (this.target) {
            if (!this.target.isAlive()) {
                this.removeHighlightFromTarget(); // Remove destaque se o target morrer
                this.target = null;
                // Atualiza a GUI
                const targetIndicator = document.getElementById('target-indicator');
                targetIndicator.textContent = "Target: Nenhum";
            }
        }
        if (this.model && this.modelController) {
            this.modelController.update(delta);
        }
        super.update(delta);
        this.updateProjectiles();
    }
}


export { Player, Warrior, Archer };