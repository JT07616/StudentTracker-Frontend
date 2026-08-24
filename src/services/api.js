import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('korisnik')
      localStorage.removeItem('timer_pocetak')
      localStorage.removeItem('timer_kolegij')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)


export default api
