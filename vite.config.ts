import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  appType: 'spa',
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        testbench: resolve(__dirname, 'ui-testbench.html'),
      },
    },
  },
});

