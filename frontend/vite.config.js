import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // if want to revert back the the local local backend, comment out the below code
  server: {
    proxy: {
      '/api': {
        target: 'https://innolink-backend-dev-cpbffwadc4gvdhca.eastus-01.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // if want to revert back the the local local backend, comment the above code.
})
