import * as THREE from 'three';
import { Projectile } from './../controllers/projectileController';
import { HealthBarManager } from './healthBarManager';
import ModelController from './modelController';
import { DamageIndicator } from './damageIndicator';
import NameTag from './nameTag';
import Soldier from './Soldier';
class Tower {
    constructor(scene, position, attackRadius = 20, cooldown = 1000, healthPoints = 500, damage = 1, camera, team, gameGUI,modelType) {
        this.scene = scene;
        this.position = position;
        this.attackRadius = attackRadius;
        this.cooldown = cooldown;
        this.cooldownCounter = 0;
        this.modelType = modelType;
        this.healthPoints = healthPoints;   
        this.damage = damage;
        this.projectiles = [];
        this.camera = camera;
        this.team = team;
        this.gameGUI = gameGUI;
        this.createTowerMesh();
        this.healthBarManager = new HealthBarManager(this, camera, scene);
        this.model = null;
        this.modelController = new ModelController(this.scene, this.modelType);
        this.modelController.createTower(this.position, this.team, model => {
            this.model = model;
        });
        this.name = "Torre";
        this.nameTag = new NameTag(scene, this.mesh, this.name);
        this.soldierSpawnTimer = this.getRandomSpawnInterval();
        this.spawnedSoldierCount = 0
    }
    createTowerMesh() {
        const geometry = new THREE.BoxGeometry(6, 5, 14);
        const material = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, depthWrite: false });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.mesh);

    }
    shoot(target, damage) {
        if (!target.isAlive()) {
            return;
        }
        if (target.getTeam() === this.team) {
            return;
        }
        const projectile = new Projectile(this.scene, this.position, target, 0.2, this.team, damage);
        this.projectiles.push(projectile);
    }
    update(player, soldiers, towers) {
        if (this.cooldownCounter > 0) {
            this.cooldownCounter--;
        }
        if (this.isDestroyed) {
            return; // Se a torre está destruída, não faz nada
        }
        this.spawnSoldierIfNeeded(soldiers); // Verifica e gera soldados se necessário

        let aliveSoldiers = soldiers.filter(soldier => soldier.isAlive() && soldier.getTeam() !== this.team);
        let alivePlayer = player.isAlive() && player.getTeam() !== this.team; // Verifica se o jogador é inimigo
    
        // Priorizar o jogador inimigo como alvo se estiver dentro do alcance
        if (alivePlayer && this.position.distanceTo(player.mesh.position) <= this.attackRadius && this.cooldownCounter === 0) {
            this.shoot(player, this.damage);
            this.cooldownCounter = this.cooldown;
            return; // Interrompe a execução para que a torre ataque apenas o jogador neste ciclo
        }
    
        // Se o jogador inimigo não for atacado, então atacar os soldados inimigos
        aliveSoldiers.forEach(soldier => {
            const distanceToSoldier = this.position.distanceTo(soldier.mesh.position);
            if (distanceToSoldier <= this.attackRadius && this.cooldownCounter === 0) {
                this.shoot(soldier, this.damage);
                this.cooldownCounter = this.cooldown;
            }
        });
    
        this.projectiles = this.projectiles.filter(projectile => !projectile.update(player, aliveSoldiers, towers));
        this.healthBarManager.update();
    }
    spawnSoldierIfNeeded(soldiers) {
        if (this.isDestroyed) return;
        if (this.soldierSpawnTimer <= 0 && this.spawnedSoldierCount < 8) {
            this.createSoldier(soldiers);
            this.soldierSpawnTimer = this.getRandomSpawnInterval();
        } else {
            this.soldierSpawnTimer -= 1 / 60;
        }
    }
    createSoldier(soldiers) {
        const health = Math.floor(Math.random() * (30 - 10) + 80);
        const damage = Math.floor(Math.random() * (28 - 12) + 12);
        const speed = Math.random() * (0.09 - 0.08) + 0.08;
        const position = this.getPosition().clone();
        position.x += (Math.random() * 10 - 5);
        position.y += (Math.random() * 10 - 5);
        position.z = 0;

        const soldier = new Soldier(this.scene, position, null, 2, 12, speed, 100, health, damage, this.team, this.gameGUI,this.modelType);
        soldiers.push(soldier);
        this.spawnedSoldierCount++;
    }
    getRandomSpawnInterval() {
        return Math.floor(Math.random() * (15 - 3) + 3);
    }
    takeDamage(damage) {
        if (this.isDestroyed) return;
    
        this.healthPoints -= damage;
        if (this.healthPoints <= 0) {
            this.healthPoints = 0;
            this.die();
        }
        new DamageIndicator(this.scene, this.position, damage);
        if (this.healthBarManager) {
            this.healthBarManager.update();
        }
    }
    getDamage() {
        return this.damage;
    }
    getPosition() {
        return this.mesh.position.clone();
    }
    getTeam() {
        return this.team;
    }
    isAlive() {
        return this.healthPoints > 0;
    }
    setPosition(position) {
        this.position = position;
        this.mesh.position.copy(position);
        this.attackRadiusIndicator.position.copy(position);
    }
    die() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;
        this.scene.remove(this.mesh);
        if (this.model) {
            this.scene.remove(this.model);
        }
        this.projectiles.forEach(projectile => this.scene.remove(projectile.mesh));
        this.projectiles = [];
        if (this.healthBarManager && typeof this.healthBarManager.dispose === 'function') {
            this.healthBarManager.dispose();
        }
        if (this.nameTag) {
            this.nameTag.remove();
        }
    }
    isClicked(worldPosition) {
        return this.mesh.geometry.boundingBox.containsPoint(worldPosition);
    }
    setTarget(player, soldiers) {
        let targets = [player, ...soldiers].filter(target => target.isAlive() && this.position.distanceTo(target.mesh.position) <= this.attackRadius);
        targets.sort((a, b) => this.position.distanceTo(a.mesh.position) - this.position.distanceTo(b.mesh.position));
        if (targets.length > 0) {
            if (this.target!== targets[0]) {
                this.target = targets[0];
            }
        }
    }
}
export { Tower };
