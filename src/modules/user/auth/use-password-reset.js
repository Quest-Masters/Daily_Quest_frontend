import { ref } from 'vue'
import axios from 'axios'

export function usePasswordReset() {
  const currentStep = ref(1) // 1: 이메일, 2: 인증코드, 3: 새 비밀번호
  const email = ref('')
  const verificationCode = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')

  const isCodeSent = ref(false)
  const isCodeVerified = ref(false)
  const timeRemaining = ref(0)
  const isSendingCode = ref(false)
  const isVerifying = ref(false)
  const isResetting = ref(false)

  let timer = null

  // 인증 코드 발송
  const sendResetCode = async () => {
    if (!email.value) {
      alert('이메일을 입력해주세요')
      return false
    }

    isSendingCode.value = true
    try {
      await axios.post('/api/users/password-reset/send-code', {
        email: email.value,
      })

      isCodeSent.value = true
      currentStep.value = 2
      timeRemaining.value = 300 // 5분
      startTimer()

      alert('비밀번호 재설정 코드가 이메일로 발송되었습니다')
      return true
    } catch (error) {
      const message = error.response?.data || '코드 발송에 실패했습니다'
      alert(message)
      return false
    } finally {
      isSendingCode.value = false
    }
  }

  // 인증 코드 검증
  const verifyResetCode = async () => {
    if (!verificationCode.value) {
      alert('인증 코드를 입력해주세요')
      return false
    }

    isVerifying.value = true
    try {
      await axios.post('/api/users/password-reset/verify-code', {
        email: email.value,
        code: verificationCode.value,
      })

      isCodeVerified.value = true
      currentStep.value = 3
      stopTimer()

      alert('인증이 완료되었습니다')
      return true
    } catch (error) {
      const message = error.response?.data || '인증 코드가 유효하지 않거나 만료되었습니다'
      alert(message)
      return false
    } finally {
      isVerifying.value = false
    }
  }

  // 비밀번호 재설정
  const resetPassword = async () => {
    if (!newPassword.value || !confirmPassword.value) {
      alert('새 비밀번호를 입력해주세요')
      return false
    }

    if (newPassword.value !== confirmPassword.value) {
      alert('비밀번호가 일치하지 않습니다')
      return false
    }

    isResetting.value = true
    try {
      await axios.post('/api/users/password-reset/reset', {
        email: email.value,
        newPassword: newPassword.value,
      })

      alert('비밀번호가 성공적으로 변경되었습니다')
      return true
    } catch (error) {
      const message = error.response?.data || '비밀번호 변경에 실패했습니다'
      alert(message)
      return false
    } finally {
      isResetting.value = false
    }
  }

  // 타이머 시작
  const startTimer = () => {
    stopTimer()
    timer = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        stopTimer()
      }
    }, 1000)
  }

  // 타이머 정지
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 초기화
  const reset = () => {
    currentStep.value = 1
    email.value = ''
    verificationCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    isCodeSent.value = false
    isCodeVerified.value = false
    timeRemaining.value = 0
    stopTimer()
  }

  return {
    currentStep,
    email,
    verificationCode,
    newPassword,
    confirmPassword,
    isCodeSent,
    isCodeVerified,
    timeRemaining,
    isSendingCode,
    isVerifying,
    isResetting,
    sendResetCode,
    verifyResetCode,
    resetPassword,
    formatTime,
    reset,
  }
}
