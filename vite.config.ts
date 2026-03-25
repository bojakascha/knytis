import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project URL: https://<user>.github.io/<repo>/
const repo = 'knytis';

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? `/${repo}/` : '/',
  plugins: [react()],
}));
