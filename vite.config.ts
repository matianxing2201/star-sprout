import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    /**
     * 图标在构建期内联成 SVG 组件（见 src/ui/icons/registry.ts）。
     *
     * 为什么不用图标库的运行时组件包：
     * 那种包把每种字重都打进同一个组件里，166 个图标 × 6 种字重 ≈ 163 kB gzip，
     * 占首屏 JS 的 72% —— 对一个面向儿童的站点太重了。
     * 这里按「用到的图标 + 用到的字重」精确内联，只留下真正需要的 path 数据。
     */
    Icons({ compiler: 'vue3' }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    open: false,
  },

  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
  },

  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'tests/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
  },
})
