import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserLoginStore = defineStore('userLogin', () => {
  const isLoggedIn = ref(false)
  const currentUser = ref(null)
  const token = ref('')
  const expiresAt = ref(null)
  const errorMessage = ref('')

  const login = async ({ id, password }) => {
    try {
      const response = await axios.post('/api/users/login', {
        id,
        password,
      })

      const data = response.data

      if (data.success) {
        isLoggedIn.value = true
        currentUser.value = data.user
        token.value = data.token

        // 💡 로그인 만료 시간 설정 (기본: 30분)
        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        localStorage.setItem('access_token', data.token)
        localStorage.setItem('expires_at', expiresAt.value)

        return true
      } else {
        errorMessage.value = data.message || '로그인 실패'
        return false
      }
    } catch (error) {
      errorMessage.value = error.response?.data?.message || '서버 오류'
      return false
    }
  }

  const logout = () => {
    isLoggedIn.value = false
    currentUser.value = null
    token.value = ''
    expiresAt.value = null

    localStorage.removeItem('access_token')
    localStorage.removeItem('expires_at')
  }

  return {
    isLoggedIn,
    currentUser,
    token,
    expiresAt,
    errorMessage,
    login,
    logout,
  }
})
