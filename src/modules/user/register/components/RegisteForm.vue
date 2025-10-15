<script setup>
import PersonalInformation from '@/modules/user/register/components/PersonalInformation.vue'
import EmailVerification from '@/modules/user/register/components/EmailVerification.vue'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserRegisterStore } from '../user-store'
import { useUserLoginStore } from '@/modules/user/login/login-store.js'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useValidation } from '@/modules/user/use-validation.js'
import axios from 'axios'

const registerStore = useUserRegisterStore()
const loginStore = useUserLoginStore()
const router = useRouter()

const isLoading = ref(false)
const errorMessage = ref('')
const showModal = ref(false)

// 이메일 인증 상태
const isEmailVerified = ref(false)
const verifiedEmail = ref('')

const openModal = () => {
  showModal.value = true
}

const handleModalClose = () => {
  form.agreeTerms = true
  showModal.value = false
}

const handleEmailVerified = (email) => {
  isEmailVerified.value = true
  verifiedEmail.value = email
}

const { form, errors } = registerStore
const {
  validateId,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateEmail,
  validatePhone,
  validateAll,
} = useValidation(form, errors)

watch(() => form.id, validateId)
watch(() => form.password, validatePassword)
watch(() => form.confirmPassword, validateConfirmPassword)
watch(() => form.name, validateName)
watch(() => [form.email.id, form.selectedDomain, form.customDomain], validateEmail)
watch(() => [form.phone.first, form.phone.middle, form.phone.last], validatePhone)

const isDuplicateId = ref(null)
const idChecked = ref(false)

const checkDuplicateId = async () => {
  if (!form.id) {
    errors.id = '아이디를 입력해주세요'
    return
  }

  try {
    const res = await axios.get('/api/users/check-id', {
      params: { id: form.id },
    })

    isDuplicateId.value = res.data
    idChecked.value = true

    if (res.data) {
      errors.id = '이미 사용 중인 아이디입니다.'
    } else {
      errors.id = ''
      alert('사용 가능한 아이디입니다.')
    }
  } catch (e) {
    console.error(e)
    errors.id = '중복 확인 중 오류가 발생했습니다.'
  }
}

watch(
  () => form.id,
  () => {
    isDuplicateId.value = null
    idChecked.value = false
  },
)

// 카카오 로그인 핸들러
const handleKakaoLogin = () => {
  loginStore.loginWithKakao(false)
}

// 구글 로그인 핸들러
const handleGoogleLogin = () => {
  loginStore.loginWithGoogle(false)
}

const handleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''

  // 이메일 인증 확인
  if (!isEmailVerified.value) {
    alert('이메일 인증을 완료해주세요!')
    isLoading.value = false
    return
  }

  if (!idChecked.value || isDuplicateId.value) {
    alert(!idChecked.value ? '아이디 중복 확인을 해주세요!' : '이미 사용 중인 아이디입니다.')
    isLoading.value = false
    return
  }

  const isValid = validateAll()
  if (!isValid) {
    alert('입력을 확인해주세요!')
    isLoading.value = false
    return
  }

  // ✅ 원하는 구조로 email 객체를 명시적으로 구성
  const formData = {
    id: form.id,
    password: form.password,
    confirmPassword: form.confirmPassword,
    name: form.name,
    email: {
      id: form.email.id,
      selectedDomain: form.selectedDomain,
      customDomain: form.customDomain,
    },
    phone: {
      first: form.phone.first,
      middle: form.phone.middle,
      last: form.phone.last,
    },
    agreeTerms: form.agreeTerms,
  }

  // ✅ 콘솔에 출력
  console.log('백엔드 전송 데이터:', JSON.stringify(formData, null, 2))

  try {
    // ✅ 실제 axios API 요청
    await axios.post('/api/users/register', formData)

    alert('회원가입 성공!')
    registerStore.resetForm() // 회원가입 성공 시 폼 초기화
    router.push('/login')
  } catch (err) {
    errorMessage.value = '회원가입에 실패했습니다.'
    console.error('회원가입 에러:', err.response?.data || err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <div class="form-group">
      <label for="id" class="form-label">아이디</label>
      <div class="input-with-button">
        <div class="input-wrapper">
          <base-input
            id="id"
            v-model="form.id"
            type="text"
            placeholder="아이디를 입력하세요"
            required
          />
        </div>
        <BaseButton type="button" @click="checkDuplicateId" variant="secondary">확인</BaseButton>
      </div>
      <p v-if="errors.id" class="error-message">{{ errors.id }}</p>
    </div>

    <base-input
      id="name"
      label="이름"
      v-model="form.name"
      type="text"
      placeholder="이름을 입력하세요"
      :error="errors.name"
      required
    />

    <!-- 이메일 인증 컴포넌트 -->
    <EmailVerification
      v-model:emailId="form.email.id"
      v-model:selectedDomain="form.selectedDomain"
      v-model:customDomain="form.customDomain"
      :emailDomains="form.emailDomains"
      :error="errors.email"
      @verified="handleEmailVerified"
    />

    <div class="form-group">
      <label for="phone-first" class="form-label">휴대폰 번호</label>
      <div class="phone-input-group">
        <select id="phone-first" v-model="form.phone.first" class="form-input phone-part" required>
          <option value="010">010</option>
          <option value="011">011</option>
          <option value="016">016</option>
          <option value="017">017</option>
          <option value="018">018</option>
          <option value="019">019</option>
        </select>
        <span class="phone-separator">-</span>
        <input
          v-model="form.phone.middle"
          type="text"
          maxlength="4"
          placeholder="0000"
          class="form-input phone-part"
          required
        />
        <span class="phone-separator">-</span>
        <input
          v-model="form.phone.last"
          type="text"
          maxlength="4"
          placeholder="0000"
          class="form-input phone-part"
          required
        />
      </div>
      <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
    </div>

    <base-input
      id="password"
      label="비밀번호"
      v-model="form.password"
      type="password"
      placeholder="비밀번호를 입력하세요"
      :error="errors.password"
      required
    />

    <base-input
      id="confirmPassword"
      label="비밀번호 확인"
      v-model="form.confirmPassword"
      type="password"
      placeholder="비밀번호를 다시 입력하세요"
      :error="errors.confirmPassword"
      required
    />
    <div class="form-agreement">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.agreeTerms" required />
        <span @click.prevent="openModal" class="terms-link"
          >이용약관 및 개인정보 처리방침에 동의합니다</span
        >
      </label>
      <p v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</p>
    </div>

    <base-button type="submit" variant="primary" block :disabled="isLoading || !isEmailVerified">
      {{ isLoading ? '가입 중...' : '회원가입' }}
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
        이미 계정이 있으신가요?
        <router-link to="/login">로그인</router-link>
      </p>
    </div>

    <PersonalInformation :visible="showModal" @close="handleModalClose" />
  </form>
</template>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-agreement {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-label input {
  margin-right: 0.5rem;
  margin-top: 0.25rem;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 94%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--card-color);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.phone-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.phone-separator {
  font-weight: 500;
  color: var(--text-secondary);
}

.phone-part {
  flex: 1;
  text-align: center;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.input-with-button .input-wrapper {
  flex: 1;
}

.input-with-button .input-wrapper :deep(.form-group) {
  margin-bottom: 0;
}

.input-with-button :deep(button) {
  white-space: nowrap;
  min-width: fit-content;
  padding: 0.75rem 1rem;
  flex-shrink: 0;
  margin-top: 0;
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
