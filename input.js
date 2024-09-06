
class InputManager {
    constructor(raycaster,camera, terrain, player, soldiers, towers) {
      this.mouse = {
        x: 0,
        y: 0,
        clicked: false
      };
      this.raycaster = raycaster;
      this.camera = camera;
      this.player = player;
      this.towers = towers;
      this.terrain = terrain;
      this.soldiers = soldiers;
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mousedown', this.onMouseDown.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    onMouseMove(event) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      if (this.mouse.clicked) {
        this.updatePlayerPosition();
      }
    }
    onMouseDown(event) {
      this.mouse.clicked = true;
      this.updatePlayerPosition();
    }
    onMouseUp() {
      this.mouse.clicked = false;
    }
    updatePlayerPosition() {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects([this.terrain]);
      if (intersects.length > 0) {
          const targetPosition = intersects[0].point;
          this.player.moveTo(targetPosition);
          // Se o jogador está atacando, pare o ataque quando o terreno é clicado
          if (this.player.getTarget()) {
              this.player.setTarget(null);
          } else {
              this.checkTarget();
          }
      }
  }
    checkTarget() {
      if (!this.player.getTarget()) {
        const { soldiers, towers } = this;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let target = null;
        let intersects = [];
        if (soldiers) {
          intersects = this.raycaster.intersectObjects(
            soldiers.map((soldier) => soldier.mesh)
          );
          if (intersects.length > 0) {
            target = soldiers.find(
              (soldier) =>
                soldier.mesh === intersects[0].object &&
                soldier.getTeam() !== this.player.getTeam() // Verifica se o soldado é inimigo
            );
            if (target) {
              this.player.setTarget(target);
              return;
            }
          }
        }
        if (towers) {
          intersects = this.raycaster.intersectObjects(
            towers.map((tower) => tower.mesh)
          );
          if (intersects.length > 0) {
            target = towers.find(
              (tower) =>
                tower.mesh === intersects[0].object &&
                tower.getTeam() !== this.player.getTeam() // Verifica se a torre é inimiga
            );
            if (target) {
              this.player.setTarget(target);
              return;
            }
          }
        }
      }
    }
    getMouse() {
      return this.mouse;
    }
  }
  export default InputManager;