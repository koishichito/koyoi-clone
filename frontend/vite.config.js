import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'validate-env',
      buildStart() {
        // 環境変数の警告（エラーにはしない）
        if (!process.env.VITE_LIFF_ID) {
          console.warn('⚠️  VITE_LIFF_ID is not set. Using fallback value.');
        }
        if (!process.env.VITE_API_URL) {
          console.warn('⚠️  VITE_API_URL is not set. Using fallback value.');
        }
        
        // 設定されている場合は表示
        if (process.env.VITE_LIFF_ID) {
          console.log('✅ VITE_LIFF_ID:', process.env.VITE_LIFF_ID);
        }
        if (process.env.VITE_API_URL) {
          console.log('✅ VITE_API_URL:', process.env.VITE_API_URL);
        }
      }
    }
  ],
  server: {
    host: true,
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      'localhost'
    ]
  }
})
