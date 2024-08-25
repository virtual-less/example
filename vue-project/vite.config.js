import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    proxy:{
      "/api/chat":{
        rewrite:(path)=>path.replace(new RegExp('^/api/chat'),''),
        target:'http://chat.test.com:9080/',
        ws: true,
        changeOrigin:true
      },
      "/api/user":{
        rewrite:(path)=>path.replace(new RegExp('^/api/user'),''),
        target:'http://user.test.com:9080/',
        changeOrigin:true
      }
    }
  }
})
