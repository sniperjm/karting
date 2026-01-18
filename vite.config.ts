
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: use process.cwd() with type casting to any to resolve the TS error
  // 'Property cwd does not exist on type Process'. This is safe because 
  // vite.config.ts runs in a Node.js environment.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // Gebruik './' als base zodat de app overal werkt (ook op sub-folders)
    base: './',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});
