import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserLoginStore = defineStore('userLogin', () => {
  const isLoggedIn = ref(false)
  const currentUser = ref(null)
  const token = ref('')
  const refreshToken = ref('')
  const expiresAt = ref(null)
  const errorMessage = ref('')
  const isRefreshing = ref(false)

  const login = async ({ id, password }) => {
    try {
      const response = await axios.post('/api/users/login', { id, password })
      const data = response.data
      if (data.success) {
        isLoggedIn.value = true
        currentUser.value = data.user
        token.value = data.token
        refreshToken.value = data.refreshToken

        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        localStorage.setItem('access_token', data.token)
        localStorage.setItem('refresh_token', data.refreshToken)
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

  const logout = async () => {
    try {
      // 백엔드에 로그아웃 알리기 (refresh token 무효화)
      if (refreshToken.value) {
        await axios.post('/api/users/logout', {
          refreshToken: refreshToken.value
        })
      }
    } catch (error) {
      console.warn('로그아웃 처리 중 오류:', error)
    } finally {
      // 로컬 상태 정리
      isLoggedIn.value = false
      currentUser.value = null
      token.value = ''
      refreshToken.value = ''
      expiresAt.value = null

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('expires_at')
    }
  }

  const restoreSession = () => {
    const storedToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedExpiresAt = localStorage.getItem('expires_at')
    
    if (storedToken && storedRefreshToken && storedExpiresAt) {
      const now = new Date()
      const expire = new Date(storedExpiresAt)
      
      token.value = storedToken
      refreshToken.value = storedRefreshToken
      expiresAt.value = storedExpiresAt
      
      if (now < expire) {
        isLoggedIn.value = true
      } else {
        // 토큰이 만료되었지만 refresh 토큰이 있으면 자동 갱신 시도
        refreshAccessToken()
      }
    }
  }

  // 자동 토큰 갱신 함수 (refresh token 사용)
  const refreshAccessToken = async () => {
    if (isRefreshing.value || !refreshToken.value) {
      return false
    }

    isRefreshing.value = true
    
    try {
      const response = await axios.post('/api/users/refresh', {
        refreshToken: refreshToken.value
      })
      
      const data = response.data
      if (data.success) {
        token.value = data.token
        // 백엔드에서 새 refreshToken을 보내지 않으므로 기존 것 유지
        
        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        localStorage.setItem('access_token', data.token)
        localStorage.setItem('expires_at', expiresAt.value)
        
        isLoggedIn.value = true
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      logout()
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  // 수동 세션 갱신 함수 (기존 refreshSession)
  const refreshSession = async () => {
    try {
      const response = await axios.post(
        '/api/users/refresh',
        { refreshToken: refreshToken.value }
      )
      const data = response.data
      if (data.success) {
        token.value = data.token
        // 백엔드에서 새 refreshToken을 보내지 않으므로 기존 것 유지
        
        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        localStorage.setItem('access_token', data.token)
        localStorage.setItem('expires_at', expiresAt.value)
        isLoggedIn.value = true
        return true
      } else {
        errorMessage.value = data.message || '세션 갱신 실패'
        logout()
        return false
      }
    } catch (error) {
      errorMessage.value = error.response?.data?.message || '서버 오류'
      logout()
      return false
    }
  }

  return {
    isLoggedIn,
    currentUser,
    token,
    refreshToken,
    expiresAt,
    errorMessage,
    isRefreshing,
    login,
    logout,
    restoreSession,
    refreshSession,
    refreshAccessToken
  }
})
