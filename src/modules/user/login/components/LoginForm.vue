<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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

const { validateId, validatePassword, validateLogin } = useValidation(form, errors)

// 카카오 로그인 핸들러
const handleKakaoLogin = () => {
  loginStore.loginWithKakao()
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
      router.push('/')
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
</style>
