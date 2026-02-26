import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({}),
    dts({
      tsconfigPath: './tsconfig.app.json',
      strictOutput: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
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
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'cune-iiif-orm-viewer',
    },
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        'primevue',
        /^primevue\//,
        /^@primevue\//,
        'primeicons',
        /^primeicons\//,
        'openseadragon',
        /^@iiif\//,
        'splitpanes',
        '@vueuse/core',
        '@vueuse/components',
        'vue-inline-svg',
        'dompurify',
        'uuid',
        '@annotorious/annotorious',
        '@annotorious/openseadragon',
        'cune-iiif-orm-atf-utils',
      ],
    },
  },
})
