import * as THREE from 'three';

class NameTag {
    constructor(scene, object, name) {
        if (!(object instanceof THREE.Object3D)) {
            throw new Error("O objeto fornecido não é uma instância de THREE.Object3D.");
        }
        this.scene = scene;
        this.object = object;
        this.createNameTag(name);
    }
    createNameTag(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        context.font = 'Bold 18px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText(name, canvas.width / 2, canvas.height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            opacity: 0.5
        });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(10, 5, 1);
        this.sprite.renderOrder = 2;
        if (this.object && this.object.position) {
            this.sprite.position.copy(this.object.position);
            this.sprite.position.y -= 3;
        }
        this.scene.add(this.sprite);
    }
    update() {
        if (this.object && this.object.position) {
            this.sprite.position.copy(this.object.position);
            this.sprite.position.y -= 3;
        }
    }
    remove() {
        this.scene.remove(this.sprite);
        this.sprite.material.map.dispose();
        this.sprite.material.dispose();
        this.sprite.geometry.dispose();
    }
}

export default NameTag;
