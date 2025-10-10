<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
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

  // 에러 처리
  if (error) {
    errorMessage.value = '카카오 로그인에 실패했습니다.'
    isProcessing.value = false
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    return
  }

  // 성공 처리
  if (success === 'true') {
    try {
      // 백엔드에서 세션을 생성했으므로, 프론트엔드에서 세션 정보 확인
      const response = await axios.get('/api/users/session', {
        withCredentials: true,
      })

      if (response.data.success) {
        // 로그인 상태 업데이트
        loginStore.isLoggedIn = true
        loginStore.currentUser = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          profileImage: response.data.profileImage,
        }

        isProcessing.value = false
        console.log('✅ 카카오 로그인 성공')

        // 홈으로 이동
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        errorMessage.value = '세션 정보를 가져오지 못했습니다.'
        isProcessing.value = false
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('세션 정보 가져오기 실패:', error)
      errorMessage.value = '로그인 처리 중 오류가 발생했습니다.'
      isProcessing.value = false
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } else {
    // success 파라미터가 없는 경우
    errorMessage.value = '잘못된 접근입니다.'
    isProcessing.value = false
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})
</script>

<template>
  <div class="kakao-callback-page">
    <div class="callback-container">
      <div v-if="isProcessing" class="processing">
        <div class="spinner"></div>
        <h2>카카오 로그인 처리 중...</h2>
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
.kakao-callback-page {
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
