import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  timeout: 12000,
})

function getToken() {
  let token = localStorage.getItem('adt-anonymous-token')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('adt-anonymous-token', token)
  }
  return token
}
api.interceptors.request.use(config => {
  config.headers['X-Anonymous-Token'] = getToken()
  return config
})
export const getLetters = params => api.get('/letters/', { params })
export const getLetter = id => api.get(`/letters/${id}/`)
export const getFeatured = () => api.get('/letters/featured/')
export const getRandom = () => api.get('/letters/random/')
export const submitLetter = data => api.post('/letters/submit/', data)
export const appreciate = id => api.post(`/letters/${id}/appreciate/`)
export const reportLetter = data => api.post('/reports/', data)
export default api
