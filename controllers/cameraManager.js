import * as THREE from 'three';

class CameraController {
    constructor(camera, getPlayer) {
        this.camera = camera;
        this.getPlayer = getPlayer;
        this.offset = new THREE.Vector3(0, -14, 10);
        this.shakeIntensity = 0;
    }
    shake(intensity = 5, duration = 300) {
        this.shakeIntensity = intensity;
        const startTime = performance.now();
        const shakeAnimation = () => {
            const elapsed = performance.now() - startTime;
            if (elapsed < duration) {
                const shakeFactor = this.shakeIntensity * (1 - elapsed / duration);
                this.camera.position.x += (Math.random() - 0.5) * shakeFactor;
                this.camera.position.y += (Math.random() - 0.5) * shakeFactor;
                requestAnimationFrame(shakeAnimation);
            } else {
                this.shakeIntensity = 0;
            }
        };
        shakeAnimation();
    }
    update() {
        const player = this.getPlayer();
        if (!player) return;
        this.camera.position.x = player.getPosition().x + this.offset.x;
        this.camera.position.y = player.getPosition().y + this.offset.y;
        this.camera.position.z = player.getPosition().z + this.offset.z + 20;
        this.camera.lookAt(player.getPosition());
    }
}
export default CameraController;
