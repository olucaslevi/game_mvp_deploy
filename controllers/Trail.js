import * as THREE from 'three';

class TrailEffect {
    constructor(scene, color) {
      this.scene = scene;
      this.particles = [];
      this.color = color;
    }
    createParticle(position) {
      const geometry = new THREE.SphereGeometry(0.9, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.8 });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      this.scene.add(particle);
      this.particles.push(particle);
      setTimeout(() => {
        this.scene.remove(particle);
        this.particles = this.particles.filter(p => p !== particle);
      }, 100); // duração do rastro em milissegundos
    }
    updateTrail(position) {
      this.createParticle(position);
    }
  }
  export default TrailEffect;