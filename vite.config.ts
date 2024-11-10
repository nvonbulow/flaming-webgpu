import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import wgslRollup from '@use-gpu/wgsl-loader/rollup';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    tsconfigPaths({ root: './' }),
    wasm(),
    topLevelAwait(),
    react(),
    // eslint(),
    // checker({
    //   typescript: true,
    // }),
    wgslRollup(),
  ],
  server: {
    port: 8080,
  },
  preview: {
    port: 8080,
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
  }
});
