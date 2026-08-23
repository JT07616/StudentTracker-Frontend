<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Play, Square, Trash2 } from 'lucide-vue-next'
import api from '../services/api.js'
import ConfirmDelete from '../components/ConfirmDelete.vue'
import { useAuthStore } from '../stores/authStore.js'

const authStore = useAuthStore()
const mojUsername = authStore.korisnik.username

const sesije = ref([])
const kolegiji = ref([])
const ljestvica = ref([])
const greska = ref('')
const greskaBrisanja = ref('')
const potvrdaBrisanja = ref(null)
const odabraniKolegij = ref('') 

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

const pocetak = ref(null) // null = timer ne radi
const proteklo = ref(0) // sekunde
let interval = null

const prikazVremena = computed(() => new Date(proteklo.value * 1000).toISOString().substring(11, 19))
const minuteTekst = (m) => `${Math.floor(m / 60) ? Math.floor(m / 60) + ' h ' : ''}${m % 60 ? m % 60 + ' min' : ''}`.trim() || '0 min'

const pokreniSat = () => {
  interval = setInterval(() => { proteklo.value = Math.floor((Date.now() - pocetak.value) / 1000) }, 1000)}
const startaj = () => { pocetak.value = Date.now(), proteklo.value = 0, pokreniSat()}

async function zaustavi() {
  clearInterval(interval)
  greska.value = ''
  if (proteklo.value < 60) {
    greska.value = 'Sesije kraće od minute se ne spremaju'
    pocetak.value = null
    proteklo.value = 0
    return
  }
  try {
    await api.post('/ucenje', {
      pocetak: new Date(pocetak.value).toISOString(),
      kraj: new Date().toISOString(),
      kolegijId: odabraniKolegij.value || null,
    })
    await dohvatiSesije()
    await dohvatiLjestvicu()
    pocetak.value = null
    proteklo.value = 0
  } catch (error) {
    greska.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri spremanju sesije'
    pokreniSat()
  }
}

onUnmounted(() => clearInterval(interval))

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
          <p class="font-mono text-5xl font-bold text-gray-900">{{ prikazVremena }}</p>

          <div class="mx-auto mt-8 flex max-w-md items-center justify-center gap-3">
            <select v-model="odabraniKolegij" :disabled="!!pocetak" class="input mt-0! w-48!">
              <option value="">Bez kolegija</option>
              <option v-for="kolegij in kolegiji" :key="kolegij._id" :value="kolegij._id">{{ kolegij.naziv }}</option>
            </select>
            <button v-if="!pocetak" @click="startaj" class="btn btn-primary flex items-center gap-2 px-6 py-2.5"><Play :size="16" fill="currentColor" /> Počni učiti</button>
            <button v-else @click="zaustavi" class="btn flex items-center gap-1.5 bg-red-700 text-white hover:bg-red-800"><Square :size="15" fill="currentColor" /> Prestani učiti</button>
          </div>
          <p class="mt-4 text-xs text-gray-500">Odlaskom na drugu stranicu učenje se prekida i sesija se ne sprema.</p>
        </div>
        <!-- moje sesije -->
        <div class="rounded-xl border border-gray-200 bg-white">
          <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Moje sesije</p>

          <p v-if="!sesije.length" class="px-4 py-8 text-center text-sm text-gray-500">Još nemaš sesija — pokreni timer</p>
          <div v-for="sesija in sesije" :key="sesija._id" class="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
            <div class="flex-1">
              <p class="text-gray-900">{{ nazivKolegija(sesija.kolegijId) }}</p>
              <p class="text-xs text-gray-500">{{ formatDatum(sesija.pocetak) }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">{{ minuteTekst(sesija.trajanjeMin) }}</p>
            <button @click="zatraziBrisanje(sesija)" class="p-1 text-gray-400 hover:text-red-600"><Trash2 :size="14" /></button>
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
          <span class="text-sm text-gray-700">{{ minuteTekst(red.minute) }}</span>
        </div>
        <p class="px-4 py-3 text-xs text-gray-500">Ljestvica se resetira svaki ponedjeljak. Ne želiš biti na njoj? Isključi to u Profilu.</p>
      </div>
    </div>
    <ConfirmDelete v-if="potvrdaBrisanja" :poruka="potvrdaBrisanja.poruka" :greska="greskaBrisanja" @potvrdi="potvrdiBrisanje" @odustani="potvrdaBrisanja = null" />
  </div>
</template>
