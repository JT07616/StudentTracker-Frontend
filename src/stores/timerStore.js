import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTimerStore = defineStore('timer', () => {
  // ucitaj iz localStoragea pri pokretanju pa timer prezivi i refresh 
  const pocetak = ref(Number(localStorage.getItem('timer_pocetak')) || null)
  const kolegijId = ref(localStorage.getItem('timer_kolegij') || '')
  const proteklo = ref(pocetak.value ? Math.floor((Date.now() - pocetak.value) / 1000) : 0)
  let interval = null

  const prikazVremena = computed(() => new Date(proteklo.value * 1000).toISOString().substring(11, 19))

  const pokreniSat = () => {
    interval = setInterval(() => { proteklo.value = Math.floor((Date.now() - pocetak.value) / 1000) }, 1000)
  }

  const startaj = () => {
    pocetak.value = Date.now()
    proteklo.value = 0
    localStorage.setItem('timer_pocetak', pocetak.value)
    localStorage.setItem('timer_kolegij', kolegijId.value)
    pokreniSat()
  }

  const zaustavi = () => clearInterval(interval)

  const resetiraj = () => {
    pocetak.value = null
    proteklo.value = 0
    localStorage.removeItem('timer_pocetak')
    localStorage.removeItem('timer_kolegij')
  }

  if (pocetak.value) pokreniSat()

  return { pocetak, proteklo, kolegijId, prikazVremena, pokreniSat, startaj, zaustavi, resetiraj }
})
