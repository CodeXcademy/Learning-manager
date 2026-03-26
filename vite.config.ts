import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: host || false,
      port: 3000,
      strictPort: true,
      hmr: host
        ? {protocol: 'ws', host, port: 3001}
        : process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
      minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
      sourcemap: !!process.env.TAURI_DEBUG,
    },
  };
});
