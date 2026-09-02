import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  // ako u localStorageu ostane neispravan zapis, JSON.parse pukne i aplikacija se uopće ne pokrene (naišao na to u firefoxu)
  const ucitajKorisnika = () => {
    try {
      return JSON.parse(localStorage.getItem('korisnik'))
    } catch {
      return null
    }
  }
  const korisnik = ref(ucitajKorisnika() || null)
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
