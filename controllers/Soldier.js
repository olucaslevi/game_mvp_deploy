import * as THREE from 'three';
import { HealthBarManager } from './healthBarManager';
import ModelController from './modelController';
import { DamageIndicator } from './damageIndicator';
import NameTag from './nameTag';

class Soldier {
    constructor(scene, position,target, attackRadius = 0.4,followRadius = 6, moveSpeed = 0.1, cooldown = 100, healthPoints = 100, damage = 10, team='blue', gameGUI) {  
        this.scene = scene;
        this.position = position;
        this.target = target;
        this.healthPoints = 100;
        this.team = team;
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        this.attackRadius = attackRadius;
        this.cooldown = cooldown;
        this.cooldownCounter = 0;
        this.healthPoints = healthPoints;
        this.damage = damage;
        this.followRadius = followRadius;
        this.moveSpeed = moveSpeed;
        this.isAttacking = false;
        this.healthBarManager = new HealthBarManager(this, this.scene, this.scene);
        this.model = null;
        this.isDead = false;
        this.modelController = new ModelController(this.scene);
        this.modelController.createSoldier(this.position, this.team, model => {
            this.model = model;
            this.modelController.playAnimation(this.model, 'Walk', 1, 2);
        });
        this.gameGUI = gameGUI;
        this.name = "Soldado";
        this.nameTag = new NameTag(scene, this.mesh, "Soldado");
        console.log('GameGUI passed to Soldier:', gameGUI);
    }
    update(players, soldiers, towers) {
        if (this.nameTag) {
            this.nameTag.update(this.mesh.position);
        }
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            this.onDeath();
        }
        this.healthBarManager.update();
        this.applySeparationForce(soldiers);
        this.updateModelPosition();

        let playerInRadius = this.findPlayerInRadius(players);
        if (playerInRadius) {
            this.target = playerInRadius;
            this.interactWithTarget(playerInRadius);
        } else {
            let target = this.findTarget(players, soldiers, towers);
            if (target && target.isAlive() && target.getTeam() !== this.getTeam()) {
                this.target = target;
                this.interactWithTarget(target);
            } else {
                this.moveTowardsNearestEnemyTower(towers);
            }
        }
    
        if (this.cooldownCounter > 0) {
            this.cooldownCounter--;
        }
    }
    applySeparationForce(soldiers) {
        const separationForce = new THREE.Vector3();
        for (const otherSoldier of soldiers) {
            if (otherSoldier !== this && otherSoldier.isAlive() && this.position.distanceTo(otherSoldier.position) < 1) {
                const force = new THREE.Vector3().subVectors(this.position, otherSoldier.position).normalize().multiplyScalar(0.05);
                force.z = 0;
                separationForce.add(force);
            }
        }
        this.position.add(separationForce);
    }
    findTarget(players, soldiers, towers) {
        let target = null;
        // Procura o soldado mais próximo dentro do raio de followRadius
        for (const soldier of soldiers) {
            if (this.position && soldier.position) {
                const distance = this.position.distanceTo(soldier.position);
                if (distance <= this.followRadius && soldier.getTeam() !== this.getTeam()) {
                    if (soldier !== this && soldier.isAlive() && (!target || distance < this.position.distanceTo(target.position))) {
                        target = soldier;
                        break;
                    }
                }
            }
        }
        // Se não houver soldados dentro do raio de followRadius, procure por jogadores
        if (!target) {
            for (const player of players) {
                const distanceToPlayer = this.position.distanceTo(player.getPosition());
                if (distanceToPlayer <= this.followRadius && player.getTeam() !== this.getTeam()) {
                    target = player;
                    break;
                }
            }
        }
        // Se não houver jogadores ou soldados próximos, procure por torres inimigas
        if (!target) {
            for (const tower of towers) {
                const distanceToTower = this.position.distanceTo(tower.getPosition());
                if (distanceToTower <= this.followRadius && tower.getTeam() !== this.getTeam() && tower.isAlive()) {
                    target = tower;
                    break;
                }
            }
        }
        return target;
    }
    unsetTarget() {
        this.target = null;
    }
    interactWithTarget(target) {
        if (!target.isAlive()) {
            this.unsetTarget();
            this.modelController.stopAnimation(this.model, 'Attack');
            this.modelController.playAnimation(this.model, 'Idle', 1, 1);
            return;
        }
        if (this.position.distanceTo(target.getPosition()) > this.attackRadius) {
            this.moveTowardsTarget(target);
        } else if (this.cooldownCounter === 0) {
            this.attack(target);
            this.cooldownCounter = this.cooldown;
        }
    }
    attack(target) {
        if (!this.isAlive() || this.cooldownCounter > 0) {
            return;
        }
        if (target.isAlive() && target.getTeam() !== this.team) {
            // Verifica se o alvo é uma torre
            if (typeof target.takeDamage === 'function') {
                target.takeDamage(this.damage); // Aplica o dano à torre
            } else {
                target.takeDamage(this.damage, this.position); // Aplica o dano a jogadores e soldados
            }
    
            this.isAttacking = true;
            this.modelController.playAnimation(this.model, 'Attack', 3, 2.5); // Animação de ataque
            const attackDuration = this.modelController.getAnimationDuration(this.model, 'Attack');
            setTimeout(() => {
                this.isAttacking = false; // Define que o ataque terminou
                if (this.isAlive() && this.target === target && target.isAlive()) {
                    this.modelController.playAnimation(this.model, 'Idle', 1, 1);
                } else {
                    this.modelController.stopAnimation(this.model, 'Attack', 1, 1);
                    this.modelController.playAnimation(this.model, 'Walk', 1, 1);
                    this.unsetTarget();
                }
            }, attackDuration * 1000); // Corrigido para multiplicar por 1000 para milissegundos
        } else {
            this.modelController.stopAnimation(this.model, 'Attack', 1, 1);
            this.modelController.playAnimation(this.model, 'Dead', 5,3);
            this.unsetTarget();
        }
        this.cooldownCounter = this.cooldown;
    }
    findPlayerInRadius(players) {
        for (let player of players) {
            if (player.getTeam() !== this.getTeam() && this.position.distanceTo(player.getPosition()) <= this.followRadius) {
                return player;
            }
        }
        return null;
    }
    handleDamageEffect() {
        if (this.target) {
            const direction = new THREE.Vector3().subVectors(this.position, this.target.getPosition()).normalize().multiplyScalar(0.55);
            this.position.add(direction);
            this.mesh.position.copy(this.position);
            if (!this.damageTimeout) {
                this.updateModelColor(0xff0000);
                this.damageTimeout = setTimeout(() => {
                    this.updateModelColor(0xffffff);
                    this.damageTimeout = null;
                    this.isDamaged = false;
                }, 100);
            }
        }
    }
    updateModelColor(color) {
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.set(new THREE.Color(color));
                }
            });
        }
    }
    moveTowardsTarget(target) {
        const direction = new THREE.Vector3().subVectors(target.getPosition(), this.position).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        this.mesh.quaternion.copy(quaternion);
        this.position.add(direction.multiplyScalar(this.moveSpeed));
        this.mesh.position.copy(this.position);
    }
    moveTowardsNearestEnemyTower(towers) {
        let nearestTower = null;
        let shortestDistance = Infinity;
        // Procurar a torre inimiga mais próxima que ainda está viva
        for (const tower of towers) {
            if (tower.isAlive() && tower.getTeam() !== this.getTeam()) { // Verifica se a torre está viva e pertence ao time inimigo
                const distanceToTower = this.position.distanceTo(tower.getPosition());
                if (distanceToTower < shortestDistance) {
                    nearestTower = tower;
                    shortestDistance = distanceToTower;
                }
            }
        }
        // Se encontrar uma torre viva, move-se em direção a ela
        if (nearestTower) {
            this.moveTowardsTarget(nearestTower);
        }
    }
    createMesh() {
        const geometry = new THREE.BoxGeometry(3, 2, 11);
        const material = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, depthWrite: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        return mesh;
    }
    takeDamage(amount) {
        this.healthPoints -= amount;
        this.healthBarManager.update();
        new DamageIndicator(this.scene, this.position, amount);
        this.handleDamageEffect()
        if (this.healthPoints <= 0) {
            this.die();
        }
        if (this.healthPoints > 0) {
            this.modelController.playAnimation(this.model, 'Hit', 1, 2); // ? Animação OK
        } else {
            this.die();
        }
    }
    onDeath() {
        console.log(`Soldier from team ${this.team} died.`);
        console.log(`Game GUI: ${this.gameGUI}`); // Verifica se gameGUI está definido
    
        this.modelController.playAnimation(this.model, 'Dead', 5, 5);
        setTimeout(() => {
            this.scene.remove(this.mesh);
            if (this.model) {
                this.modelController.removeModel(this.model);
            }
    
            if (this.gameGUI) {
                console.log(`Updating kill count for team ${this.team === 'blue' ? 'red' : 'blue'}.`);
                if (this.team === 'blue') {
                    this.gameGUI.updateKillCount('red'); 
                } else {
                    this.gameGUI.updateKillCount('blue'); 
                }
            }
    
            if (this.nameTag) {
                this.nameTag.remove();
                this.nameTag = null;
            }
        }, 1000);
    }
    
    die() {
        this.onDeath();
    }
    isAlive() {
        this.outOfRangeCounter++;
        return this.healthPoints > 0;
    }
    getPosition() {
        return this.mesh.position;
    }
    setPosition(position) {
        this.position = position;
    }
    getTeam() {
        return this.team;
    }
    moveTo(position) {
        this.position = position;
        this.mesh.position.copy(position);
        this.followRadiusIndicator.position.copy(position);
        this.attackRadiusIndicator.position.copy(position);
    }
    isClicked(worldPosition) {
        return this.mesh.geometry.boundingBox.containsPoint(worldPosition);
    }
    updateModelPosition() {
        if (this.model && this.model.position && this.mesh) {
            // Copia a posição do mesh para o modelo
            this.model.position.copy(this.mesh.position);
            this.model.rotation.copy(this.mesh.rotation);
            this.model.rotation.y = 0;
        }
    }   
}

export default Soldier;