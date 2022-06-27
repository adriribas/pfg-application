import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
//import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
//import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
//import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
      //https: 'agent-base'
    }
  }
  /*optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        })
        //NodeModulesPolyfillPlugin()
      ]
    }
  }*/
  /*build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  }*/
});
