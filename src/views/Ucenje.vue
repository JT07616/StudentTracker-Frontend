<script setup>
import { ref, computed, onMounted } from 'vue'
import { Play, Square, Trash2, Eye, EyeOff } from 'lucide-vue-next'
import api from '../services/api.js'
import ConfirmDelete from '../components/ConfirmDelete.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useTimerStore } from '../stores/timerStore.js'

const authStore = useAuthStore()
const timer = useTimerStore()
const mojUsername = authStore.korisnik.username

const sesije = ref([])
const kolegiji = ref([])
const ljestvica = ref([])
const greska = ref('')
const greskaBrisanja = ref('')
const potvrdaBrisanja = ref(null)
const obrada = ref(false)
const filterKolegij = ref('') 

async function dohvatiSesije() {
  greska.value = ''
  try {
    const { data } = await api.get('/ucenje')
    sesije.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju sesija'
  }
}

async function dohvatiKolegije() {
  greska.value = ''
  try {
    const { data } = await api.get('/kolegiji')
    kolegiji.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju kolegija'
  }
}

const minuteTekst = (m) => `${Math.floor(m / 60) ? Math.floor(m / 60) + ' h ' : ''}${m % 60 ? m % 60 + ' min' : ''}`.trim() || '0 min'
const prikazaneSesije = computed(() => (filterKolegij.value ? sesije.value.filter((sesija) => sesija.kolegijId === filterKolegij.value) : sesije.value))
const ukupnoFiltrirano = computed(() => prikazaneSesije.value.reduce((zbroj, sesija) => zbroj + sesija.trajanjeMin, 0))

async function zaustavi() {
  timer.zaustavi()
  greska.value = ''
  if (timer.proteklo < 60) {
    timer.resetiraj()
    return
  }
  obrada.value = true
  try {
    await api.post('/ucenje', {
      pocetak: new Date(timer.pocetak).toISOString(),
      kraj: new Date().toISOString(),
      kolegijId: timer.kolegijId || null,
    })
    await dohvatiSesije()
    await dohvatiLjestvicu()
    timer.resetiraj()
  } catch (error) {
    greska.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri spremanju sesije'
    timer.pokreniSat()
  } finally {
    obrada.value = false
  }
}

const nazivKolegija = (id) => (id ? kolegiji.value.find((kolegij) => kolegij._id === id)?.naziv || 'Nepoznat kolegij' : 'Bez kolegija')
const formatDatum = (datum) => new Date(datum).toLocaleDateString('hr-HR')

function zatraziBrisanje(sesija) {
  greskaBrisanja.value = ''
  potvrdaBrisanja.value = { id: sesija._id, poruka: `Obrisati sesiju (${nazivKolegija(sesija.kolegijId)}, ${minuteTekst(sesija.trajanjeMin)})?` }
}

async function potvrdiBrisanje() {
  try {
    await api.delete(`/ucenje/${potvrdaBrisanja.value.id}`)
    await dohvatiSesije()
    await dohvatiLjestvicu()
    potvrdaBrisanja.value = null
  } catch (error) {
    greskaBrisanja.value = error.response?.data?.message || 'Greška pri brisanju sesije'
  }
}

async function dohvatiLjestvicu() {
  greska.value = ''
  try {
    const { data } = await api.get('/ucenje/ljestvica')
    ljestvica.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju ljestvice'
  }
}

onMounted(() => {
  dohvatiSesije()
  dohvatiKolegije()
  dohvatiLjestvicu()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Učenje</h1>
      <p class="text-sm text-gray-700">Pokreni timer kada kreneš učiti.</p>
    </div>

    <p v-if="greska" class="mb-4 text-red-600">{{ greska }}</p>
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <!-- timer -->
      <div class="lg:col-span-2">
        <div class="mb-6 rounded-xl border border-gray-200 bg-white px-8 py-12 text-center">
          <p class="font-mono text-5xl font-bold text-gray-900">{{ timer.prikazVremena }}</p>

          <div class="mx-auto mt-8 flex max-w-md items-center justify-center gap-3">
            <select v-model="timer.kolegijId" :disabled="!!timer.pocetak" class="input mt-0! w-48!">
              <option value="">Bez kolegija</option>
              <option v-for="kolegij in kolegiji" :key="kolegij._id" :value="kolegij._id">{{ kolegij.naziv }}</option>
            </select>
            <button v-if="!timer.pocetak" @click="timer.startaj" class="btn btn-primary flex items-center gap-2 px-6 py-2.5"><Play :size="16" fill="currentColor" /> Počni učiti</button>
            <button v-else @click="zaustavi" :disabled="obrada" class="btn flex items-center gap-1.5 bg-red-700 text-white hover:bg-red-800"><Square :size="15" fill="currentColor" /> Prestani učiti</button>
          </div>
          <p class="mt-4 text-sm text-gray-500">Timer radi i dok si na drugim stranicama, vidiš ga u izborniku. Klikom na njega vraćaš se na ovu stranicu.</p>
          <p class="mt-1 text-sm font-medium text-gray-600">Sesije kraće od minute se ne spremaju.</p>
        </div>
        <!-- moje sesije -->
        <div class="rounded-xl border border-gray-200 bg-white">
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
            <p class="font-medium text-gray-900">Moje sesije<span v-if="filterKolegij" class="ml-2 text-sm font-normal text-gray-500">ukupno {{ minuteTekst(ukupnoFiltrirano) }}</span></p>
            <select v-model="filterKolegij" class="input mt-0! w-48!">
              <option value="">Svi kolegiji</option>
              <option v-for="kolegij in kolegiji" :key="kolegij._id" :value="kolegij._id">{{ kolegij.naziv }}</option>
            </select>
          </div>
          <p v-if="!prikazaneSesije.length" class="px-4 py-8 text-center text-sm text-gray-500">{{ filterKolegij ? 'Nema sesija za taj kolegij' : 'Još nemaš sesija — pokreni timer' }}</p>
          <div v-for="sesija in prikazaneSesije" :key="sesija._id" class="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
            <div class="flex-1">
              <p class="text-gray-900">{{ nazivKolegija(sesija.kolegijId) }}</p>
              <p class="text-xs text-gray-500">{{ formatDatum(sesija.pocetak) }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">{{ minuteTekst(sesija.trajanjeMin) }}</p>
            <button @click="zatraziBrisanje(sesija)" title="Obriši sesiju" class="p-1 text-gray-400 hover:text-red-600"><Trash2 :size="14" /></button>
          </div>
        </div>
      </div>
      <!-- tjedna ljestvica -->
      <div class="rounded-xl border border-gray-200 bg-white">
        <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Ljestvica ovog tjedna</p>
        <p v-if="!ljestvica.length" class="px-4 py-8 text-center text-sm text-gray-500">Još nitko nije učio ovaj tjedan</p>

        <div v-for="(red, i) in ljestvica" :key="red.username" class="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 last:border-b-0" :class="red.username === mojUsername && 'bg-brown/5'">
          <span class="w-6 text-sm text-gray-500">{{ i + 1 }}.</span>
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brown/15 text-xs font-bold text-brown">{{ red.username[0].toUpperCase() }}</span>
          <span class="flex-1 text-sm text-gray-700" :class="red.username === mojUsername && 'font-medium'">{{ red.username === mojUsername ? red.username + ' (ti)' : red.username }}</span>
          <span v-if="red.username === mojUsername" title="Vidljivost mijenjaš u Profilu" class="flex items-center gap-1 text-xs" :class="red.skriven ? 'text-gray-400' : 'text-green-700'"><EyeOff v-if="red.skriven" :size="13" /><Eye v-else :size="13"/>{{ red.skriven ? 'skriveno' : 'vidljivo' }}</span>
          <span class="text-sm text-gray-700">{{ minuteTekst(red.minute) }}</span>
        </div>
        <p class="px-4 pt-3 text-xs text-gray-500">Ljestvica se resetira svaki ponedjeljak. Ne želiš biti na njoj? Isključi to u Profilu.</p>
        <p class="px-4 pt-1 pb-3 text-xs text-gray-500">Oznaka uz tvoje ime prikazuje jesi li vidljiv drugima.</p>
      </div>
    </div>
    <ConfirmDelete v-if="potvrdaBrisanja" :poruka="potvrdaBrisanja.poruka" :greska="greskaBrisanja" @potvrdi="potvrdiBrisanje" @odustani="potvrdaBrisanja = null" />
  </div>
</template>
