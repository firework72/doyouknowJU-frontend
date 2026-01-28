import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components' : path.resolve(__dirname, './src/components')
    }
  },
  server: { // 서버 설정 - 포트번호 설정하기
    proxy: { // 프록시 설정 - 특정 경로 패턴에 대한 요청을 다른 서버로 요청할 수 있게 하는 설정
      '/dykj' : {// /dykj이라는 요청 경로로 요청이 들어왔을 때 해당 proxy에 설정된 서버로 요청을 보내도록하는 설정
        target: 'http://localhost:8080',
        changeOrigin: true, // 요청해더의 host를 target 주소로 변경될 수 있도록 허용하는 설정
        secure: false, // https 인증서 검증 여부 (개발환경에선 false로 설정)
      }
    }
  }
})
