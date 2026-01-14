import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
  server: {
    port: 3111,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'audiogen.2068.online'
    ],
    proxy: {
      '/api/tts': {
        target: 'https://tts.2068.online',
        changeOrigin: true,
        secure: false,
      },
      '/api/whisper': {
        target: 'https://Whisper.2068.online',
        changeOrigin: true,
        secure: false,
      }
    }
  },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
