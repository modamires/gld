import {defineConfig} from 'vite';
export default defineConfig({
  // Relative assets work on username.github.io and username.github.io/repository.
  base: './',
  build:{rollupOptions:{output:{manualChunks:{phaser:['phaser'],react:['react','react-dom/client']}}}}
});
