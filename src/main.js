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

// ✅ Pinia 등록 후에 로그인 스토어 사용 (세션 복원)
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { setupTokenRefreshTimer } from '@/utils/token-utils.js'

const loginStore = useUserLoginStore()
loginStore.restoreSession()

// 자동 토큰 갱신 타이머 설정
setupTokenRefreshTimer(loginStore)

// ✅ 최종 mount
app.mount('#app')
