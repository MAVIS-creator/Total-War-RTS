import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'spa',
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
