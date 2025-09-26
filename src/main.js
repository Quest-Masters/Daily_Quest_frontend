// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './plugins/axios' // ✅ Axios 설정 (JWT interceptor 포함)

// ✅ Pinia와 Router 세팅
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// ✅ 보안 설정 초기화
import { initSecurityConfig } from '@/config/security.js'
initSecurityConfig()

// ✅ 보안 업그레이드: 기존 토큰 정리
import { cleanupLegacyTokens, logTokenStatus } from '@/utils/auth-migration.js'
cleanupLegacyTokens()

// ✅ Pinia 등록 후에 로그인 스토어 사용 (세션 복원)
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { setupTokenRefreshTimer } from '@/utils/token-utils.js'

const loginStore = useUserLoginStore()

// 비동기 세션 복원
;(async () => {
  await loginStore.restoreSession()

  // 자동 토큰 갱신 타이머 설정
  setupTokenRefreshTimer(loginStore)

  // 개발 환경에서 토큰 상태 로깅
  logTokenStatus()
})()

// ✅ 최종 mount
app.mount('#app')
