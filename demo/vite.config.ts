import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  base: './',
  plugins: [
    vue({})
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'global-builtin']
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        standalone: resolve(__dirname, 'index.html'),
      }
    }
  }
})
