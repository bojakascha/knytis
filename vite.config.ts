import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom domain — always served from root regardless of build mode.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
