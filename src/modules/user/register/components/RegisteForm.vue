<script setup>
import PersonalInformation from '@/modules/user/register/components/PersonalInformation.vue'
import EmailVerification from '@/modules/user/register/components/EmailVerification.vue'
import BaseInput from '@/components/BaseSetting/BaseInput.vue'
import BaseButton from '@/components/BaseSetting/BaseButton.vue'
import { useUserRegisterStore } from '../user-store'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useValidation } from '@/modules/user/use-validation.js'
import axios from 'axios'

const registerStore = useUserRegisterStore()
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
    const response = await axios.post('/api/users/register', formData)

    alert('회원가입 성공!')
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
</style>
