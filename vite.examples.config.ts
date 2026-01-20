import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/maplibre-gl-extend/',
  build: {
    outDir: 'dist-examples',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        basic: resolve(__dirname, 'examples/basic/index.html'),
        react: resolve(__dirname, 'examples/react/index.html'),
        cog: resolve(__dirname, 'examples/cog/index.html'),
        'cog-simple': resolve(__dirname, 'examples/cog-simple/index.html'),
        zarr: resolve(__dirname, 'examples/zarr/index.html'),
        'zarr-simple': resolve(__dirname, 'examples/zarr-simple/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
