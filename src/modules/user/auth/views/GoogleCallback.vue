<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { getAccessToken, getTokenExpiry } from '@/utils/cookie-utils'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const loginStore = useUserLoginStore()

const isProcessing = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  // URL에서 쿼리 파라미터 추출
  const success = route.query.success
  const error = route.query.error

  console.log('🔍 구글 콜백 페이지 진입:', { success, error })

  // 에러 처리
  if (error) {
    console.error('❌ 구글 로그인 에러 파라미터:', error)
    errorMessage.value = '구글 로그인에 실패했습니다.'
    isProcessing.value = false
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    return
  }

  // 성공 처리
  if (success === 'true') {
    try {
      // 쿠키에서 토큰 확인
      const token = getAccessToken()
      const expiresAt = getTokenExpiry()

      console.log('✅ 쿠키에서 토큰 확인:', token ? '토큰 있음' : '토큰 없음')

      if (!token) {
        throw new Error('토큰이 쿠키에 없습니다.')
      }

      // 세션에서 사용자 정보 가져오기
      const response = await axios.get('/api/auth/google/session-info', {
        withCredentials: true,
      })

      console.log('📨 세션 정보 응답:', response.data)

      if (response.data.success) {
        // 로그인 상태 업데이트
        loginStore.token = token

        // expiresAt이 숫자인지 확인하고 유효한 Date로 변환
        if (expiresAt && !isNaN(expiresAt)) {
          loginStore.expiresAt = new Date(parseInt(expiresAt)).toISOString()
        } else {
          // 만약 유효하지 않으면 현재 시간 + 1시간으로 설정
          loginStore.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }

        loginStore.isLoggedIn = true
        loginStore.currentUser = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email || '',
          profileImage: response.data.profileImage || '',
        }

        isProcessing.value = false
        console.log('✅ 구글 로그인 성공:', loginStore.currentUser)

        // localStorage에서 저장된 redirect 경로 확인, 없으면 홈으로 이동
        const redirectPath = localStorage.getItem('login_redirect') || '/'
        localStorage.removeItem('login_redirect') // 사용 후 삭제

        setTimeout(() => {
          router.push(redirectPath)
        }, 1500)
      } else {
        throw new Error(response.data.message || '세션 정보를 가져오지 못했습니다.')
      }
    } catch (error) {
      console.error('❌ 구글 로그인 처리 실패:', error)
      errorMessage.value = `로그인 처리 중 오류가 발생했습니다: ${error.message}`
      isProcessing.value = false
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } else {
    // success 파라미터가 없는 경우
    console.error('❌ success 파라미터가 없음:', success)
    errorMessage.value = '잘못된 접근입니다.'
    isProcessing.value = false
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})
</script>

<template>
  <div class="google-callback-page">
    <div class="callback-container">
      <div v-if="isProcessing" class="processing">
        <div class="spinner"></div>
        <h2>구글 로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>

      <div v-else-if="errorMessage" class="error">
        <div class="error-icon">⚠️</div>
        <h2>로그인 실패</h2>
        <p>{{ errorMessage }}</p>
        <p class="redirect-message">로그인 페이지로 이동합니다...</p>
      </div>

      <div v-else class="success">
        <div class="success-icon">✓</div>
        <h2>로그인 성공!</h2>
        <p>환영합니다.</p>
        <p class="redirect-message">홈으로 이동합니다...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.google-callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
}

.callback-container {
  width: 100%;
  max-width: 480px;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  text-align: center;
}

.processing,
.error,
.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  color: var(--error-color);
}

.success-icon {
  width: 64px;
  height: 64px;
  background-color: var(--success-color, #4caf50);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

h2 {
  color: var(--text-primary);
  margin: 0;
}

p {
  color: var(--text-secondary);
  margin: 0;
}

.redirect-message {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-tertiary, #999);
}
</style>
