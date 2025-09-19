import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { setAccessToken, removeAccessToken, getAccessToken, getTokenExpiry, isTokenExpired } from '@/utils/cookie-utils'

export const useUserLoginStore = defineStore('userLogin', () => {
  const isLoggedIn = ref(false)
  const currentUser = ref(null)
  const token = ref('')
  const expiresAt = ref(null)
  const errorMessage = ref('')
  const isRefreshing = ref(false)

  const login = async ({ id, password }) => {
    try {
      const response = await axios.post(
        '/api/users/login',
        { id, password },
        {
          withCredentials: true, // httpOnly 쿠키 사용을 위해 필요
        },
      )
      const data = response.data
      if (data.success) {
        isLoggedIn.value = true
        currentUser.value = data.user
        token.value = data.token

        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        // access token을 쿠키에 저장 (refresh token은 httpOnly 쿠키로 처리)
        setAccessToken(data.token, Date.now() + 1000 * 60 * 30)
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
      // 백엔드에 로그아웃 알리기 (서버에서 refresh token 무효화 및 쿠키 제거)
      await axios.post(
        '/api/users/logout',
        {},
        {
          withCredentials: true, // httpOnly 쿠키 접근을 위해 필요
        },
      )
    } catch (error) {
      console.warn('로그아웃 처리 중 오류:', error)
    } finally {
      // 로컬 상태 정리
      isLoggedIn.value = false
      currentUser.value = null
      token.value = ''
      expiresAt.value = null

      // access token 쿠키 제거 (refresh token은 서버에서 쿠키 제거)
      removeAccessToken()
    }
  }

  const restoreSession = () => {
    const storedToken = getAccessToken()
    const storedExpiresAt = getTokenExpiry()

    if (storedToken && storedExpiresAt) {
      token.value = storedToken
      expiresAt.value = new Date(parseInt(storedExpiresAt)).toISOString()

      if (!isTokenExpired()) {
        isLoggedIn.value = true
      } else {
        // 토큰이 만료되었다면 refresh 토큰으로 자동 갱신 시도
        refreshAccessToken()
      }
    }
  }

  // 자동 토큰 갱신 함수 (httpOnly 쿠키의 refresh token 사용)
  const refreshAccessToken = async () => {
    if (isRefreshing.value) {
      return false
    }

    isRefreshing.value = true

    try {
      const response = await axios.post(
        '/api/users/refresh',
        {},
        {
          withCredentials: true, // httpOnly 쿠키의 refresh token 사용
        },
      )

      const data = response.data
      if (data.success) {
        token.value = data.token

        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        setAccessToken(data.token, Date.now() + 1000 * 60 * 30)

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

  // 수동 세션 갱신 함수 (refreshAccessToken과 동일하지만 에러 메시지 설정 포함)
  const refreshSession = async () => {
    try {
      const response = await axios.post(
        '/api/users/refresh',
        {},
        {
          withCredentials: true, // httpOnly 쿠키의 refresh token 사용
        },
      )
      const data = response.data
      if (data.success) {
        token.value = data.token

        const expireTime = new Date(Date.now() + 1000 * 60 * 30)
        expiresAt.value = expireTime.toISOString()

        setAccessToken(data.token, Date.now() + 1000 * 60 * 30)
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
    expiresAt,
    errorMessage,
    isRefreshing,
    login,
    logout,
    restoreSession,
    refreshSession,
    refreshAccessToken,
  }
})
