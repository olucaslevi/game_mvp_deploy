import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

export default defineConfig({
  base: '/game_mvp_deploy/',
  build: {
    outDir: 'dist',
  },
  plugins: [
    {
      name: 'copy-static-files',
      closeBundle() {
        const modelsDir = resolve(__dirname, 'dist/models');
        const sourceDir = resolve(__dirname, 'models');

        // Certifique-se de que o diretório dist/models existe
        if (!existsSync(modelsDir)) {
          mkdirSync(modelsDir, { recursive: true });
        }

        // Copiar todos os arquivos .glb da pasta models para dist/models
        readdirSync(sourceDir).forEach(file => {
          if (file.endsWith('.glb')) {
            const sourcePath = resolve(sourceDir, file);
            const destPath = resolve(modelsDir, file);
            copyFileSync(sourcePath, destPath);
          }
        });
      }
    }
  ]
});
