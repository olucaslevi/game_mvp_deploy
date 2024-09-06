import * as THREE from 'three';
import ModelController from './modelController';
import TrailEffect from './Trail';

export class Projectile {
    constructor(scene, position, target, speed = 20, towers, damage) {
        this.scene = scene;
        this.position = position.clone();
        this.position.z = 7;
        this.target = target;
        this.direction = new THREE.Vector3().subVectors(target.getPosition(), position).normalize();
        this.speed = speed;
        this.towers = towers;
        this.damage = damage;
        this.trailEffect = new TrailEffect(this.scene, 0xffff00);
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        this.model = null;
        this.modelController = new ModelController(this.scene);
        this.modelController.createProjectile(this.position, this.target, model => {
            this.model = model;
            if (this.model) {
                this.model.position.copy(this.position);
            }
        });
    }
    update() {
        if (!this.target) {
            return false;
        }
        const direction = new THREE.Vector3().subVectors(this.target.getPosition(), this.position).normalize();
        this.position.add(direction.clone().multiplyScalar(this.speed));
        this.mesh.position.copy(this.position);
        if (this.model) {
            this.model.position.copy(this.position);
            this.model.lookAt(this.target.getPosition());
        }
        const energyBallPosition = this.mesh.position.clone();
        this.trailEffect.updateTrail(energyBallPosition);
        const distanceToTarget = this.position.distanceTo(this.target.getPosition());
        if (distanceToTarget <= this.speed) {
            this.target.takeDamage(this.damage);
            this.scene.remove(this.mesh);
            this.scene.remove(this.pointLight);
            if (this.model) {
                this.scene.remove(this.model);
            }
            return true;
        }
        return false;
    }
}
