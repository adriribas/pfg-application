import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
//import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
//import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
//import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ autoImportComponentCase: 'kebab', sassVariables: 'src/css/quasar-variables.sass' })
  ],
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
