// 기존 refresh token 로컬 스토리지 정리를 위한 마이그레이션 유틸리티

/**
 * 기존 로컬 스토리지의 refresh token을 정리합니다.
 * 앱 초기화 시 한 번 실행되어야 합니다.
 */
export const cleanupLegacyTokens = () => {
  try {
    // 기존 refresh_token 제거
    const hasLegacyRefreshToken = localStorage.getItem('refresh_token')

    if (hasLegacyRefreshToken) {
      console.log('🔧 보안 업그레이드: 기존 refresh token을 로컬 스토리지에서 제거합니다.')
      localStorage.removeItem('refresh_token')
    }

    // 관련 로그 정보도 정리
    const legacyKeys = [
      'refresh_token',
      'refreshToken', // 혹시 다른 형태로 저장된 경우
      'user_refresh_token'
    ]

    let removedCount = 0
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        removedCount++
      }
    })

    if (removedCount > 0) {
      console.log(`✅ ${removedCount}개의 레거시 토큰이 정리되었습니다.`)
      console.log('🛡️ 이제 refresh token은 안전한 httpOnly 쿠키로 관리됩니다.')
    }

    return true
  } catch (error) {
    console.warn('레거시 토큰 정리 중 오류 발생:', error)
    return false
  }
}

/**
 * 현재 저장된 토큰 상태를 확인합니다. (디버깅 목적)
 */
export const checkTokenStatus = () => {
  const accessToken = localStorage.getItem('access_token')
  const expiresAt = localStorage.getItem('expires_at')
  const refreshToken = localStorage.getItem('refresh_token') // 이제는 없어야 함

  return {
    hasAccessToken: !!accessToken,
    hasExpiresAt: !!expiresAt,
    hasRefreshToken: !!refreshToken, // false여야 함
    accessTokenLength: accessToken?.length || 0,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isTokenExpired: expiresAt ? new Date() > new Date(expiresAt) : true
  }
}

/**
 * 개발 환경에서 토큰 상태 로깅
 */
export const logTokenStatus = () => {
  if (import.meta.env.NODE_ENV === 'development') {
    const status = checkTokenStatus()
    console.group('🔐 현재 토큰 상태')
    console.log('Access Token:', status.hasAccessToken ? '✅ 존재' : '❌ 없음')
    console.log('Expires At:', status.expiresAt)
    console.log('Token Expired:', status.isTokenExpired ? '❌ 만료됨' : '✅ 유효함')
    console.log('Refresh Token in localStorage:', status.hasRefreshToken ? '⚠️ 발견 (제거 필요)' : '✅ 없음 (정상)')
    console.groupEnd()
  }
}