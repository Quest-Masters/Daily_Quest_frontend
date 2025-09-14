// 토큰 관련 유틸리티 함수들

// 토큰 만료 시간까지 남은 시간을 계산 (밀리초)
export const getTokenExpirationTime = () => {
  const expiresAt = localStorage.getItem('expires_at')
  if (!expiresAt) return 0
  
  const expireTime = new Date(expiresAt)
  const now = new Date()
  return expireTime.getTime() - now.getTime()
}

// 토큰이 곧 만료되는지 확인 (5분 전)
export const isTokenExpiringSoon = () => {
  const timeLeft = getTokenExpirationTime()
  return timeLeft <= 5 * 60 * 1000 && timeLeft > 0 // 5분 이내
}

// 토큰이 만료되었는지 확인
export const isTokenExpired = () => {
  return getTokenExpirationTime() <= 0
}

// 토큰 만료 시간을 포맷팅해서 반환
export const formatTokenExpirationTime = () => {
  const timeLeft = getTokenExpirationTime()
  
  if (timeLeft <= 0) return '만료됨'
  
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  
  return `${minutes}분 ${seconds}초 남음`
}

// 자동 토큰 갱신을 위한 타이머 설정
export const setupTokenRefreshTimer = (loginStore) => {
  // 토큰이 곧 만료되면 자동 갱신
  const checkAndRefreshToken = async () => {
    if (loginStore.isLoggedIn && isTokenExpiringSoon() && !loginStore.isRefreshing) {
      console.log('토큰이 곧 만료됩니다. 자동 갱신을 시도합니다.')
      await loginStore.refreshAccessToken()
    }
  }

  // 1분마다 체크
  return setInterval(checkAndRefreshToken, 60000)
}