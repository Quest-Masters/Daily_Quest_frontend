import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import {
  setAccessToken,
  removeAccessToken,
  getAccessToken,
  getTokenExpiry,
  isTokenExpired,
} from '@/utils/cookie-utils'

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

        const expireTime = new Date(Date.now() + 1000 * 60 * 60) // 1시간
        expiresAt.value = expireTime.toISOString()

        // access token만 쿠키에 저장 (refresh token은 서버에서 HttpOnly 쿠키로 설정)
        setAccessToken(data.token, Date.now() + 1000 * 60 * 60) // 1시간

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

      // access token 쿠키 제거 (refresh token은 서버에서 HttpOnly 쿠키 제거)
      removeAccessToken()
    }
  }

  const restoreSession = async () => {
    const storedToken = getAccessToken()
    const storedExpiresAt = getTokenExpiry()

    console.log('🔄 세션 복원 시도:', {
      hasToken: !!storedToken,
      hasExpiry: !!storedExpiresAt,
      token: storedToken ? storedToken.substring(0, 20) + '...' : 'null',
    })

    if (storedToken) {
      token.value = storedToken

      // expires_at이 없거나 유효하지 않으면 기본값 설정
      if (storedExpiresAt && !isNaN(parseInt(storedExpiresAt))) {
        expiresAt.value = new Date(parseInt(storedExpiresAt)).toISOString()
      } else {
        // 기본적으로 현재 시간 + 1시간
        expiresAt.value = new Date(Date.now() + 60 * 60 * 1000).toISOString()
        console.log('⚠️ expires_at 쿠키가 없어서 기본값 설정')
      }

      // 토큰 만료 확인 (expires_at이 없으면 항상 유효하다고 간주)
      const expired = storedExpiresAt ? isTokenExpired() : false

      if (!expired) {
        // 토큰이 유효하면 서버에서 사용자 정보 가져오기
        try {
          console.log('📡 /api/users/profile 요청 시작...')
          const response = await axios.get('/api/users/profile', {
            withCredentials: true,
          })

          console.log('📨 /api/users/profile 응답:', response.data)

          if (response.data && response.data.userId) {
            currentUser.value = {
              userId: response.data.userId,
              name: response.data.name,
              email: response.data.email || '',
              profileImage: response.data.profileImageUrl || '',
            }
            isLoggedIn.value = true
            console.log('✅ 세션 복원 성공: 사용자 정보 로드됨', currentUser.value)
          } else {
            console.warn('⚠️ /api/profile 응답에 userId가 없음')
          }
        } catch (error) {
          console.error('❌ 사용자 정보 조회 실패:', error)
          console.error('에러 상세:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
          })

          // 401 에러면 토큰 갱신 시도
          if (error.response?.status === 401) {
            console.log('⏰ 토큰이 만료됨, refresh 토큰으로 갱신 시도...')
            const refreshSuccess = await refreshAccessToken()
            if (refreshSuccess) {
              // 갱신 성공 후 사용자 정보 다시 가져오기
              await restoreSession()
            } else {
              console.log('❌ 토큰 갱신 실패: 로그아웃 처리')
              logout()
            }
          }
        }
      } else {
        console.log('⏰ 토큰이 만료됨, refresh 토큰으로 갱신 시도...')
        // 토큰이 만료되었다면 refresh 토큰으로 자동 갱신 시도
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          console.log('✅ 토큰 갱신 성공: 사용자 정보 다시 로드')
          // 갱신 성공 후 사용자 정보 가져오기
          await restoreSession()
        } else {
          console.log('❌ 토큰 갱신 실패: 로그아웃 처리')
          logout()
        }
      }
    } else {
      console.log('❌ 저장된 토큰이 없음: 로그인 필요')
    }
  }

  // 자동 토큰 갱신 함수 (httpOnly 쿠키의 refresh token 사용)
  const refreshAccessToken = async () => {
    if (isRefreshing.value) {
      return false
    }

    isRefreshing.value = true

    try {
      // 소셜 로그인 사용자인지 확인 (userId가 kakao_ 또는 google_로 시작)
      const isKakaoUser = currentUser.value?.userId?.startsWith('kakao_')
      const isGoogleUser = currentUser.value?.userId?.startsWith('google_')

      let refreshEndpoint = '/api/users/refresh'
      if (isKakaoUser) {
        refreshEndpoint = '/api/auth/kakao/refresh'
      } else if (isGoogleUser) {
        refreshEndpoint = '/api/auth/google/refresh'
      }

      console.log(`🔄 토큰 갱신 시도: ${refreshEndpoint}`)

      const response = await axios.post(
        refreshEndpoint,
        {},
        {
          withCredentials: true, // HttpOnly 쿠키의 refresh token 자동 전송
        },
      )

      const data = response.data
      if (data.success) {
        // 소셜 로그인은 응답에 token이 없을 수 있음 (쿠키로 자동 설정)
        if (data.token) {
          token.value = data.token
        } else {
          // 쿠키에서 토큰 다시 읽기
          token.value = getAccessToken()
        }

        const expireTime = new Date(Date.now() + 1000 * 60 * 60) // 1시간
        expiresAt.value = expireTime.toISOString()

        // 소셜 로그인은 서버에서 쿠키 설정, 일반 로그인은 클라이언트에서 설정
        const isSocialLogin = isKakaoUser || isGoogleUser
        if (!isSocialLogin && data.token) {
          setAccessToken(data.token, Date.now() + 1000 * 60 * 60) // 1시간
        }

        isLoggedIn.value = true
        console.log('✅ 토큰 갱신 성공')
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error)
      logout()
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  // 수동 세션 갱신 함수 (refreshAccessToken과 동일하지만 에러 메시지 설정 포함)
  const refreshSession = async () => {
    try {
      // 소셜 로그인 사용자인지 확인 (userId가 kakao_ 또는 google_로 시작)
      const isKakaoUser = currentUser.value?.userId?.startsWith('kakao_')
      const isGoogleUser = currentUser.value?.userId?.startsWith('google_')

      let refreshEndpoint = '/api/users/refresh'
      if (isKakaoUser) {
        refreshEndpoint = '/api/auth/kakao/refresh'
      } else if (isGoogleUser) {
        refreshEndpoint = '/api/auth/google/refresh'
      }

      const response = await axios.post(
        refreshEndpoint,
        {},
        {
          withCredentials: true, // HttpOnly 쿠키의 refresh token 자동 전송
        },
      )
      const data = response.data
      if (data.success) {
        // 소셜 로그인은 응답에 token이 없을 수 있음 (쿠키로 자동 설정)
        if (data.token) {
          token.value = data.token
        } else {
          token.value = getAccessToken()
        }

        const expireTime = new Date(Date.now() + 1000 * 60 * 60) // 1시간
        expiresAt.value = expireTime.toISOString()

        // 소셜 로그인은 서버에서 쿠키 설정, 일반 로그인은 클라이언트에서 설정
        const isSocialLogin = isKakaoUser || isGoogleUser
        if (!isSocialLogin && data.token) {
          setAccessToken(data.token, Date.now() + 1000 * 60 * 60) // 1시간
        }

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

  // 카카오 로그인 URL 가져오기
  const getKakaoLoginUrl = async () => {
    try {
      const response = await axios.get('/api/auth/kakao/login-url')
      return response.data.loginUrl
    } catch (error) {
      console.error('카카오 로그인 URL 가져오기 실패:', error)
      errorMessage.value = '카카오 로그인을 시작할 수 없습니다.'
      return null
    }
  }

  // 카카오 로그인 시작 (새 창으로 카카오 로그인 페이지 열기)
  const loginWithKakao = async (rememberMe = false) => {
    try {
      const loginUrl = await getKakaoLoginUrl()
      if (loginUrl) {
        // rememberMe를 state 파라미터에 추가
        const urlWithRememberMe = `${loginUrl}&state=${encodeURIComponent(JSON.stringify({ rememberMe }))}`
        // 카카오 로그인 페이지로 리다이렉트
        window.location.href = urlWithRememberMe
      }
    } catch (error) {
      console.error('카카오 로그인 시작 실패:', error)
      errorMessage.value = '카카오 로그인을 시작할 수 없습니다.'
    }
  }

  // 카카오 콜백 처리 (인가 코드로 로그인 처리)
  const handleKakaoCallback = async (code) => {
    try {
      const response = await axios.get('/api/auth/kakao/callback', {
        params: { code },
        withCredentials: true,
      })

      const data = response.data
      if (data.success) {
        // 카카오 로그인 성공 시 세션 설정
        isLoggedIn.value = true
        currentUser.value = {
          userId: data.userId,
          name: data.name,
          email: data.email,
          profileImage: data.profileImage,
        }

        // 세션 기반이므로 토큰은 서버에서 관리
        // 필요시 access token을 받아서 저장할 수 있음
        console.log('✅ 카카오 로그인 성공:', data.message)
        return true
      } else {
        errorMessage.value = data.message || '카카오 로그인 실패'
        return false
      }
    } catch (error) {
      console.error('카카오 콜백 처리 실패:', error)
      errorMessage.value =
        error.response?.data?.message || '카카오 로그인 처리 중 오류가 발생했습니다.'
      return false
    }
  }

  // 구글 로그인 URL 가져오기
  const getGoogleLoginUrl = async (rememberMe = false) => {
    try {
      const response = await axios.get('/api/auth/google/login-url', {
        params: { rememberMe },
      })
      return response.data.loginUrl
    } catch (error) {
      console.error('구글 로그인 URL 가져오기 실패:', error)
      errorMessage.value = '구글 로그인을 시작할 수 없습니다.'
      return null
    }
  }

  // 구글 로그인 시작 (구글 로그인 페이지로 리다이렉트)
  const loginWithGoogle = async (rememberMe = false) => {
    try {
      const loginUrl = await getGoogleLoginUrl(rememberMe)
      if (loginUrl) {
        // 구글 로그인 페이지로 리다이렉트
        window.location.href = loginUrl
      }
    } catch (error) {
      console.error('구글 로그인 시작 실패:', error)
      errorMessage.value = '구글 로그인을 시작할 수 없습니다.'
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
    loginWithKakao,
    handleKakaoCallback,
    loginWithGoogle,
  }
})
