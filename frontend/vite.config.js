import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || env.BASE_PATH || process.env.BASE_PATH || '/';

  return {
    base: basePath,
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
    },
  };
});

