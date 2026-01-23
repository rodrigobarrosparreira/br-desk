import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 1. OBRIGATÓRIO PARA GITHUB PAGES:
    // Troque 'br-desk' pelo nome EXATO do seu repositório no GitHub.
    // Se seu repo chama 'sistema-br', coloque '/sistema-br/'.
    base: '/br-desk/', 

    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        // 2. AJUSTE DO ALIAS:
        // Como você moveu tudo para 'src', o @ deve apontar para lá.
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});