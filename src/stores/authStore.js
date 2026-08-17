import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const korisnik = ref(JSON.parse(localStorage.getItem('korisnik')) || null)
  // učitaj iz localStoragea pri pokretanju te će tako onda korisnik biti prijavljen i ako refresha
  const token = ref(localStorage.getItem('jwt_token') || null)
  const autoriziran = computed(() => !!token.value)

  const login = async (podaci) => {
    const { data } = await api.post('/auth/login', podaci)
    token.value = data.jwt_token
    korisnik.value = data.korisnik
    localStorage.setItem('jwt_token', data.jwt_token)
    localStorage.setItem('korisnik', JSON.stringify(data.korisnik))

    return data
  }

  const register = async (podaci) => {
    const { data } = await api.post('/auth/register', podaci)
    token.value = data.jwt_token
    korisnik.value = data.korisnik
    localStorage.setItem('jwt_token', data.jwt_token)
    localStorage.setItem('korisnik', JSON.stringify(data.korisnik))

    return data
  }

  const logout = () => {
    token.value = null
    korisnik.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('korisnik')
  }

  return { korisnik, token, autoriziran, login, register, logout }
})
