// 보안 관련 설정을 중앙에서 관리

export const securityConfig = {
  // 개발 환경 여부
  isDevelopment: import.meta.env.NODE_ENV === 'development',

  // API 기본 URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',

  // 보안 로깅 활성화
  enableSecurityLogs: import.meta.env.VITE_ENABLE_SECURITY_LOGS === 'true',

  // HTTPS 사용 여부 (프로덕션에서는 자동으로 true)
  useSecureCookies:
    import.meta.env.NODE_ENV === 'production' || import.meta.env.VITE_SECURE_COOKIES === 'true',

  // 토큰 설정
  tokens: {
    // Access Token 만료 시간 (밀리초)
    accessTokenDuration: 30 * 60 * 1000, // 30분

    // 토큰 갱신 여유 시간 (만료 5분 전에 갱신)
    refreshThreshold: 5 * 60 * 1000, // 5분

    // 자동 갱신 체크 간격
    refreshCheckInterval: 60 * 1000, // 1분
  },

  // 쿠키 설정
  cookies: {
    sameSite: 'strict', // CSRF 보호
    secure: import.meta.env.NODE_ENV === 'production', // HTTPS에서만
    httpOnly: true, // JavaScript 접근 차단
  },

  // 보안 헤더
  headers: {
    contentType: 'application/json',
    // 필요시 추가 보안 헤더
  },

  // CSP (Content Security Policy) 권장사항
  csp: {
    recommendation: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' " + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'),
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
}

// 환경별 설정 검증
export const validateSecurityConfig = () => {
  const warnings = []

  if (securityConfig.isDevelopment) {
    console.group('🔧 개발 환경 보안 설정')
    console.log('API Base URL:', securityConfig.apiBaseUrl)
    console.log('Secure Cookies:', securityConfig.useSecureCookies)
    console.log('Security Logs:', securityConfig.enableSecurityLogs)
    console.groupEnd()
  }

  if (import.meta.env.NODE_ENV === 'production') {
    if (!securityConfig.apiBaseUrl.startsWith('https://')) {
      warnings.push('⚠️ 프로덕션 환경에서는 HTTPS API URL을 사용해야 합니다.')
    }

    if (!securityConfig.useSecureCookies) {
      warnings.push('⚠️ 프로덕션 환경에서는 Secure 쿠키를 사용해야 합니다.')
    }
  }

  if (warnings.length > 0) {
    console.warn('🚨 보안 설정 경고:')
    warnings.forEach((warning) => console.warn(warning))
  }

  return warnings.length === 0
}

// 앱 초기화 시 설정 검증 실행
export const initSecurityConfig = () => {
  validateSecurityConfig()

  if (securityConfig.enableSecurityLogs) {
    console.log('🛡️ 보안 모드 활성화됨')
  }
}
