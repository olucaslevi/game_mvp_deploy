import * as THREE from 'three';

export class HealthBarManager {
    constructor(object, camera, renderer) {
        this.object = object;
        this.camera = camera;
        this.renderer = renderer;

        this.initHealthBar();
    }
    initHealthBar() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.material = new THREE.SpriteMaterial({ map: this.texture });
        this.sprite = new THREE.Sprite(this.material);
        this.sprite.scale.set(1.2,0.7,2);
        this.sprite.position.set(0, 30000,0);  
        this.object.mesh.add(this.sprite);
    }
    update() {
        const healthPercent = this.object.healthPoints / 100;
        this.drawHealthBar(healthPercent);
        this.texture.needsUpdate = true;
        this.updateSpritePosition();
        this.updateSpriteRotation();
    }
    updateSpritePosition() {
        this.sprite.position.set(0,0, 8);
    }
    updateSpriteRotation() {
        const offset = 13;
        // use offset
        this.sprite.rotation.y = this.camera.rotation.y + offset;
        this.sprite.rotation.x = this.camera.rotation.x + offset;
        this.sprite.rotation.z = this.camera.rotation.z + offset;
        this.sprite.position.set(0, 0, 8);
    }
    drawHealthBar(healthPercent) {
        this.clearCanvas();
        this.drawBackground();
        this.drawHealth(healthPercent);
        this.drawText();
    }
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.context.fillStyle = 'gray';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawHealth(healthPercent) {
        const color = healthPercent > 0.7 ? 'green' : healthPercent > 0.3 ? 'yellow' : 'red';
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, healthPercent * this.canvas.width, this.canvas.height);
    }
    drawText() {
        this.context.font = 'Bold 100px Arial';
        this.context.fillStyle = 'white';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(`${this.object.healthPoints}`, this.canvas.width / 2, this.canvas.height / 2);
    }
    remove() {
        this.object.mesh.remove(this.sprite);
        this.canvas.remove();	
    }
}

export default HealthBarManager;