export const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export const setCookie = (name, value, days = 7) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  // Secure 제거: localhost HTTP 환경에서 작동하도록 수정
  document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax'
}

export const deleteCookie = (name) => {
  // Secure 제거: localhost HTTP 환경에서 작동하도록 수정
  document.cookie =
    name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
}

export const getAccessToken = () => {
  return getCookie('access_token')
}

export const setAccessToken = (token, expiresAt) => {
  if (token && expiresAt) {
    const expiryDate = new Date(parseInt(expiresAt))
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
    setCookie('access_token', token, daysUntilExpiry > 0 ? daysUntilExpiry : 1)
    setCookie('expires_at', expiresAt, daysUntilExpiry > 0 ? daysUntilExpiry : 1)
  }
}

export const removeAccessToken = () => {
  deleteCookie('access_token')
  deleteCookie('expires_at')
}

export const getTokenExpiry = () => {
  return getCookie('expires_at')
}

export const isTokenExpired = () => {
  const expiresAt = getTokenExpiry()
  if (!expiresAt) return true

  const expiryTime = parseInt(expiresAt)
  const currentTime = Date.now()

  return currentTime >= expiryTime
}
