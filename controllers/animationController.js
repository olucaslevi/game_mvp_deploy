// import * as THREE from 'three';

// class SpriteAnimation {
//     constructor(scene, textureURL, frameRate = 120, scale = 0.1) {
//         this.scene = scene;
//         this.textureURL = textureURL;
//         this.frameRate = frameRate;
//         this.frames = [];
//         this.currentFrame = 0;
//         this.lastUpdateTime = 0;
//         this.texture = null;
//         this.sprite = null;
//         this.scale = scale; // Nova propriedade para controle do tamanho do sprite
//         this.createSprite();
//     }

//     createSprite() {
//         const loader = new THREE.TextureLoader();
//         loader.load(this.textureURL, texture => {
//             this.texture = texture;
//             this.calculateFrameSize();
//             this.createFrames();

//             // Create a plane geometry with the size of a single frame
//             const geometry = new THREE.PlaneGeometry(this.tileWidth, this.tileHeight);
//             const material = new THREE.MeshBasicMaterial({
//                 map: this.texture,
//                 transparent: true,
//                 depthWrite: false,
                
//             });

//             this.sprite = new THREE.Mesh(geometry, material);
//             this.sprite.position.set(0, 0, 1); // Ajusta a posição para o centro

//             // Ajuste a escala do sprite
//             this.sprite.scale.set(this.scale, this.scale, 10);

//             this.scene.add(this.sprite);

//             // Ensure the texture is fully loaded and available
//             this.texture.onUpdate = () => {
//                 this.sprite.material.map.needsUpdate = true;
//             };
//         });
//     }

//     calculateFrameSize() {
//         const textureWidth = this.texture.image.width;
//         const textureHeight = this.texture.image.height;

//         // Determine the number of rows and columns based on the aspect ratio
//         const aspectRatio = textureWidth / textureHeight;
//         const numCols = Math.round(Math.sqrt(aspectRatio * 16)); // 16 is a rough guess for max number of columns
//         const numRows = Math.round(numCols / aspectRatio);

//         this.numCols = numCols;
//         this.numRows = numRows;

//         // Calculate the size of each tile
//         this.tileWidth = textureWidth / this.numCols;
//         this.tileHeight = textureHeight / this.numRows;
//     }

//     createFrames() {
//         const textureWidth = this.texture.image.width;
//         const textureHeight = this.texture.image.height;

//         for (let row = 0; row < this.numRows; row++) {
//             for (let col = 0; col < this.numCols; col++) {
//                 const offsetX = col * this.tileWidth;
//                 const offsetY = (this.numRows - row - 1) * this.tileHeight;

//                 const frame = new THREE.Vector2(
//                     offsetX / textureWidth,
//                     offsetY / textureHeight
//                 );
//                 this.frames.push(frame);
//             }
//         }
//     }
//     setPosition(position) {
//         if (this.sprite) {
//             this.sprite.position.copy(position);
//         }
//     }
//     update(delta) {
//         if (this.sprite) {
//             this.lastUpdateTime += delta;
//             if (this.lastUpdateTime > 1 / this.frameRate) {
//                 this.lastUpdateTime = 0;
//                 this.currentFrame = (this.currentFrame + 1) % this.frames.length;
//                 const frame = this.frames[this.currentFrame];
//                 this.sprite.material.map.offset.set(frame.x, frame.y);
//                 this.sprite.material.map.repeat.set(
//                     this.tileWidth / this.texture.image.width,
//                     this.tileHeight / this.texture.image.height
//                 );
//                 this.sprite.material.map.needsUpdate = true;
//             }
//         }
//     }
    
//     dispose() {
//         if (this.sprite) {
//             this.scene.remove(this.sprite);
//             this.sprite.geometry.dispose();
//             this.sprite.material.dispose();
//             this.sprite = null;
//         }
//     }
    
    
// }

// export default SpriteAnimation;
