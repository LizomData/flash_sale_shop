const API_BASE_URL = 'http://localhost:8080'
let authToken = localStorage.getItem('auth_token') || ''

export function setAuthToken(token) {
  authToken = token || ''
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export function getAuthToken() {
  return authToken
}

function parseJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    return null
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 < Date.now()
}

function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

async function request(path, options = {}) {
  if (authToken && isTokenExpired(authToken)) {
    setAuthToken('')
    const err = new Error('登录已过期，请重新登录')
    err.status = 401
    throw err
  }
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || '请求失败'
    const err = new Error(message)
    err.status = response.status
    throw err
  }
  return data
}

export function fetchSnapshot() {
  return request('/api/bootstrap')
}

export function buySeckill(eventId, qty = 1) {
  return request(`/api/seckills/${eventId}/buy`, {
    method: 'POST',
    body: JSON.stringify({ qty })
  })
}

export function addCart(payload) {
  return request('/api/cart', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function checkout() {
  return request('/api/orders/checkout', { method: 'POST' })
}

export function createSeckill(payload) {
  return request('/api/admin/seckills', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function createProduct(payload) {
  return request('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
