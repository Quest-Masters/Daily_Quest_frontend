<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { useValidation } from '@/modules/user/use-validation.js'

const isLoading = ref(false)
const errorMessage = ref('')
const loginExpiresAt = ref(null) // 로그인 유지 시간 표시용

const form = reactive({
  id: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  id: '',
  password: '',
})

const loginStore = useUserLoginStore()
const router = useRouter()
const route = useRoute()

const { validateId, validatePassword, validateLogin } = useValidation(form, errors)

// 카카오 로그인 핸들러
const handleKakaoLogin = () => {
  // 카카오 로그인 플로우에서도 redirect를 유지하기 위해 localStorage에 저장
  const redirectPath = route.query.redirect
  if (redirectPath) {
    localStorage.setItem('login_redirect', redirectPath)
  }
  // rememberMe를 파라미터로 전달
  loginStore.loginWithKakao(form.rememberMe)
}

// 구글 로그인 핸들러
const handleGoogleLogin = () => {
  // 구글 로그인 플로우에서도 redirect를 유지하기 위해 localStorage에 저장
  const redirectPath = route.query.redirect
  if (redirectPath) {
    localStorage.setItem('login_redirect', redirectPath)
  }
  // rememberMe를 파라미터로 전달
  loginStore.loginWithGoogle(form.rememberMe)
}

watch(() => form.id, validateId)
watch(() => form.password, validatePassword)

const handleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''
  loginExpiresAt.value = null

  const isValidation = validateLogin()
  if (!isValidation) {
    alert('입력을 확인해주세요!')
    isLoading.value = false
    return
  }

  try {
    const success = await loginStore.login({
      id: form.id,
      password: form.password,
    })

    if (success) {
      loginExpiresAt.value = loginStore.expiresAt // Pinia에서 받은 로그인 만료 시간
      // 원래 가려던 페이지가 있으면 그곳으로, 없으면 홈으로 이동
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    } else {
      errorMessage.value = loginStore.errorMessage
    }
  } catch (e) {
    errorMessage.value = '로그인 처리 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <base-input
      id="id"
      label="아이디"
      v-model="form.id"
      type="text"
      placeholder="아이디을 입력하세요"
      :error="errors.id"
      required
    />

    <base-input
      id="password"
      label="비밀번호"
      v-model="form.password"
      type="password"
      placeholder="비밀번호를 입력하세요"
      :error="errors.password"
      required
    />

    <div class="form-options">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.rememberMe" />
        <span>로그인 상태 유지</span>
      </label>
      <div class="user-define">
        <router-link to="/find-id" class="forgot-id">아이디 찾기</router-link>
        <a> \ </a>
        <router-link to="/find-password" class="forgot-password">비밀번호 재설정</router-link>
      </div>
    </div>

    <base-button type="submit" variant="primary" block :disabled="isLoading">
      {{ isLoading ? '로그인 중...' : '로그인' }}
    </base-button>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div class="divider">
      <span>또는</span>
    </div>

    <button type="button" class="kakao-login-button" @click="handleKakaoLogin">
      <svg class="kakao-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.632 4.592 4.121 5.836-.179.654-.656 2.399-.758 2.774-.122.449.164.443.345.322.145-.097 2.313-1.548 3.297-2.201.649.088 1.316.135 2.995.135 5.523 0 10-3.477 10-7.866C22 6.477 17.523 3 12 3z"
        />
      </svg>
      카카오로 시작하기
    </button>

    <button type="button" class="google-login-button" @click="handleGoogleLogin">
      <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      구글로 시작하기
    </button>

    <div class="auth-links">
      <p>
        계정이 없으신가요?
        <router-link to="/register">회원가입</router-link>
      </p>
    </div>
  </form>
</template>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.user-define {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forgot-id {
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-id:hover {
  text-decoration: underline;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-error {
  color: var(--error-color);
  margin-top: 1rem;
  text-align: center;
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--text-secondary);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.divider span {
  padding: 0 1rem;
  font-size: 0.875rem;
}

.kakao-login-button {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #fee500;
  color: #000000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.kakao-login-button:hover {
  background-color: #fdd835;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(254, 229, 0, 0.3);
}

.kakao-login-button:active {
  transform: translateY(0);
}

.kakao-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.google-login-button {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #dadce0;
  border-radius: 6px;
  background-color: #ffffff;
  color: #3c4043;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.google-login-button:hover {
  background-color: #f8f9fa;
  border-color: #c6c6c6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.google-login-button:active {
  transform: translateY(0);
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>
