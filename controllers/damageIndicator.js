import * as THREE from 'three';

export class DamageIndicator {
    constructor(scene, position, damageValue) {
        this.scene = scene;
        this.position = position.clone();
        this.damageValue = damageValue;
        this.createDamageText();
    }
    createDamageText() {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 258;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 40px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`-${this.damageValue}`, canvas.width / 2, canvas.height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
        // Cria o sprite
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(8, 5, 1);
        this.sprite.position.copy(this.position);
        this.sprite.position.y += 5;
        this.sprite.position.z += 3;

        // Define ordem de renderização para garantir que o texto esteja na frente
        this.sprite.renderOrder = 999; // Alta prioridade de renderização

        this.scene.add(this.sprite);
        this.animateDamageIndicator();
    }

    animateDamageIndicator() {
        const duration = 1300; // Duração da animação
        const moveUpDistance = 4;
        const moveUpSpeed = moveUpDistance / duration;
        const startTime = performance.now();
        const animate = () => {
            const elapsedTime = performance.now() - startTime;
            const progress = elapsedTime / duration;

            if (elapsedTime < duration) {
                this.sprite.position.y += moveUpSpeed;
                const scaleFactor = 1 + 0.5 * Math.sin(progress * Math.PI);
                this.sprite.scale.set(8 * scaleFactor, 5 * scaleFactor, 1);
                if (this.damageValue > 50) {
                    this.sprite.material.color.setRGB(1, 1 - progress, 0);
                } else {
                    this.sprite.material.color.setRGB(1, 1 - progress, 1 - progress);
                }
                this.sprite.material.opacity = 1 - progress;
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(this.sprite);
                this.sprite.material.dispose();
                this.sprite.geometry.dispose();
            }
        };
        animate();
    }
}
export default DamageIndicator;
