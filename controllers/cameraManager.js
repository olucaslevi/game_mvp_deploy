import * as THREE from 'three';

class CameraController {
    constructor(camera, getPlayer) {
        this.camera = camera;
        this.getPlayer = getPlayer;
        this.offset = new THREE.Vector3(0, -14, 10);
        this.shakeIntensity = 0;
        this.mouseControlsAdded = false;
        this.isFirstPerson = false;
        this.pitch = -1;
        this.yaw = 0;
        this.cameraHeight = 5;
        this.onMouseMove = this.onMouseMove.bind(this);
        this.setupMouseControls();
    }
    setupMouseControls() {
        if (!this.mouseControlsAdded) {
            window.addEventListener('mousemove', this.onMouseMove);
            this.mouseControlsAdded = true;
        }
    }
    onMouseMove(event) {
        if (typeof this.getPlayer !== 'function') {
            console.error('getPlayer is not a function or is null:', this.getPlayer);
            return;
        }
        const player = this.getPlayer();
        if (!player) {
            console.error('Player is undefined');
            return;
        }
        const playerPosition = player.getPosition();
        if (this.isFirstPerson) {
            this.handleFirstPersonView(event);
        } else {
            this.handleThirdPersonView(playerPosition);
        }
    }
    handleFirstPersonView(event) {
        const sensitivity = 0.0015;
        this.yaw -= event.movementX * sensitivity;
        this.pitch -= event.movementY * sensitivity;
        this.camera.rotation.set(this.pitch + Math.PI / 2, this.yaw, 0);
    }
    handleThirdPersonView(playerPosition) {
        this.camera.position.set(
            playerPosition.x + this.offset.x,
            playerPosition.y + this.offset.y,
            playerPosition.z + this.offset.z + 20
        );
        this.camera.lookAt(playerPosition);
    }
    shake(intensity = 5, duration = 300) {
        this.shakeIntensity = intensity;
        const startTime = performance.now();
        const shakeAnimation = () => {
            const elapsed = performance.now() - startTime;
            if (elapsed < duration) {
                const shakeFactor = this.shakeIntensity * (1 - elapsed / duration);
                this.applyShake(shakeFactor);
                requestAnimationFrame(shakeAnimation);
            } else {
                this.shakeIntensity = 0;
            }
        };
        shakeAnimation();
    }
    applyShake(shakeFactor) {
        this.camera.position.x += (Math.random() - 0.5) * shakeFactor;
        this.camera.position.y += (Math.random() - 0.5) * shakeFactor;
    }
    toggleCameraMode() {
        this.isFirstPerson = !this.isFirstPerson;
    }
    update() {
        const player = this.getPlayer();
        if (!player) return;

        const playerPosition = player.getPosition();
        if (this.isFirstPerson) {
            this.updateFirstPersonView(playerPosition);
        } else {
            this.handleThirdPersonView(playerPosition);
        }
    }
    updateFirstPersonView(playerPosition) {
        this.camera.position.set(
            playerPosition.x,
            playerPosition.y - 8,
            playerPosition.z + 10
        );
        this.camera.rotation.x = Math.PI / 2;
    }
}
export default CameraController;
