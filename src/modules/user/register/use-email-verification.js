import { ref } from 'vue'
import axios from 'axios'

export function useEmailVerification() {
  const isCodeSent = ref(false)
  const isVerified = ref(false)
  const verificationCode = ref('')
  const timeRemaining = ref(0)
  const isSendingCode = ref(false)
  const isVerifying = ref(false)
  let timer = null

  const sendVerificationCode = async (email) => {
    if (!email) {
      alert('이메일을 입력해주세요')
      return false
    }

    isSendingCode.value = true
    try {
      await axios.post('/api/users/send-verification', { email })

      isCodeSent.value = true
      timeRemaining.value = 300 // 5분
      startTimer()

      alert('인증 코드가 이메일로 발송되었습니다')
      return true
    } catch (error) {
      const message = error.response?.data || '인증 코드 발송에 실패했습니다'
      alert(message)
      return false
    } finally {
      isSendingCode.value = false
    }
  }

  const verifyCode = async (email) => {
    if (!verificationCode.value) {
      alert('인증 코드를 입력해주세요')
      return false
    }

    isVerifying.value = true
    try {
      await axios.post('/api/users/verify-code', {
        email,
        code: verificationCode.value,
      })

      isVerified.value = true
      stopTimer()
      alert('이메일 인증이 완료되었습니다')
      return true
    } catch (error) {
      const message = error.response?.data || '인증 코드가 유효하지 않거나 만료되었습니다'
      alert(message)
      return false
    } finally {
      isVerifying.value = false
    }
  }

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

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    isCodeSent.value = false
    isVerified.value = false
    verificationCode.value = ''
    timeRemaining.value = 0
    stopTimer()
  }

  return {
    isCodeSent,
    isVerified,
    verificationCode,
    timeRemaining,
    isSendingCode,
    isVerifying,
    sendVerificationCode,
    verifyCode,
    formatTime,
    reset,
  }
}
