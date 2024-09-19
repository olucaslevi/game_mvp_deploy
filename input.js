class InputManager {
    constructor(raycaster, camera, terrain, player, soldiers, towers, cameraController) {
        this.mouse = { x: 0, y: 0, clicked: false };
        this.keys = {};
        this.raycaster = raycaster;
        this.camera = camera;
        this.player = player;
        this.towers = towers;
        this.terrain = terrain;
        this.soldiers = soldiers;
        this.cameraController = cameraController;

        this.initEventListeners();
    }
    initEventListeners() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    onMouseMove(event) {
        if (this.isFirstPersonView()) return;

        this.updateMousePosition(event);

        if (this.mouse.clicked) {
            this.updatePlayerPosition();
        }
    }
    onMouseDown(event) {
        if (this.isFirstPersonView()) return;

        this.mouse.clicked = true;
        this.updatePlayerPosition();
    }
    onMouseUp() {
        if (this.isFirstPersonView()) return;

        this.mouse.clicked = false;
    }
    onKeyDown(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = true;

        if (key === 'c' && this.cameraController) {
            this.cameraController.toggleCameraMode();
        }
    }
    onKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }
    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    isFirstPersonView() {
        return this.cameraController && this.cameraController.isFirstPerson;
    }
    updatePlayerPosition() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.terrain]);

        if (intersects.length > 0) {
            const targetPosition = intersects[0].point;
            this.player.moveTo(targetPosition);

            if (this.player.getTarget()) {
                this.player.setTarget(null);
            } else {
                this.checkTarget();
            }
        }
    }
    checkTarget() {
        if (!this.player.getTarget()) {
            const targets = [...this.soldiers.map(s => s.mesh), ...this.towers.map(t => t.mesh)];
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(targets);

            if (intersects.length > 0) {
                const target = this.findTarget(intersects[0].object);
                if (target) this.player.setTarget(target);
            }
        }
    }
    findTarget(mesh) {
        let target = this.soldiers.find(
            (soldier) => soldier.mesh === mesh && soldier.getTeam() !== this.player.getTeam()
        );
        if (!target) {
            target = this.towers.find(
                (tower) => tower.mesh === mesh && tower.getTeam() !== this.player.getTeam()
            );
        }

        return target;
    }
    update() {
        if (this.isFirstPersonView()) {
        }
    }

    getMouse() {
        return this.mouse;
    }
}

export default InputManager;
