<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'
import { useAuthStore } from '../stores/authStore.js'

const authStore = useAuthStore()
const mojUsername = authStore.korisnik?.username || ''

const kolegiji = ref([])
const obveze = ref([])
const sesije = ref([])
const greska = ref('')

async function dohvatiKolegije() {
  greska.value = ''
  try {
    const { data } = await api.get('/kolegiji')
    kolegiji.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju kolegija'
  }
}

const polozeni = computed(() => kolegiji.value.filter((kolegij) => kolegij.status === 'polozen'))
const prosjekTekst = computed(() => {
  if (!polozeni.value.length) return '—'
  const prosjek = polozeni.value.reduce((zbroj, kolegij) => zbroj + kolegij.ocjena, 0) / polozeni.value.length
  return prosjek.toFixed(2).replace('.', ',')
})
const ectsPolozeno = computed(() => polozeni.value.reduce((zbroj, kolegij) => zbroj + kolegij.ects, 0))
const ectsUpisano = computed(() => kolegiji.value.reduce((zbroj, kolegij) => zbroj + kolegij.ects, 0))


async function dohvatiObveze() {
  greska.value = ''
  try {
    const { data } = await api.get('/obveze')
    obveze.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju obveza'
  }
}

const nerijesene = computed(() => obveze.value.filter((obveza) => !obveza.gotovo))
const rokoviTjedna = computed(() => nerijesene.value.filter((obveza) => obveza.rok && daniDo(obveza.rok) >= 0 && daniDo(obveza.rok) <= 7).sort((a, b) => new Date(a.rok) - new Date(b.rok)).slice(0, 5))

const pocetakTjedna = () => {
  const datum = new Date()
  datum.setHours(0, 0, 0, 0)
  datum.setDate(datum.getDate() - ((datum.getDay() + 6) % 7))
  return datum
}

async function dohvatiSesije() {
  greska.value = ''
  try {
    const { data } = await api.get('/ucenje')
    sesije.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju sesija'
  }
}

const minuteTekst = (m) => `${Math.floor(m / 60) ? Math.floor(m / 60) + ' h ' : ''}${m % 60 ? m % 60 + ' min' : ''}`.trim() || '0 min'
const daniDo = (datum) => Math.ceil((new Date(datum).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))

const rokTekst = (rok) => {
  const dana = daniDo(rok)
  if (dana === 0) return 'DANAS'
  return `za ${dana} ${dana === 1 ? 'dan' : 'dana'}`
}

const sesijeTjedna = computed(() => sesije.value.filter((sesija) => new Date(sesija.pocetak) >= pocetakTjedna()))
const minuteTjedan = computed(() => sesijeTjedna.value.reduce((zbroj, sesija) => zbroj + sesija.trajanjeMin, 0))

const poDanima = computed(() => {
  const minute = [0, 0, 0, 0, 0, 0, 0]
  for (const sesija of sesijeTjedna.value) {
    minute[(new Date(sesija.pocetak).getDay() + 6) % 7] += sesija.trajanjeMin
  }
  return minute
})

const najviseUDanu = computed(() => Math.max(...poDanima.value, 1))
const dani = ['pon', 'uto', 'sri', 'čet', 'pet', 'sub', 'ned']
const danasIndex = (new Date().getDay() + 6) % 7

const formatDatum = (datum) => new Date(datum).toLocaleDateString('hr-HR')
const nadolazeciIspiti = computed(() => kolegiji.value.filter((kolegij) => kolegij.status === 'upisan' && kolegij.ispitniRok && daniDo(kolegij.ispitniRok) >= 0).sort((a, b) => new Date(a.ispitniRok) - new Date(b.ispitniRok)).slice(0, 3))

onMounted(() => {
  dohvatiKolegije()
  dohvatiObveze()
  dohvatiSesije()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pregled</h1>
      <p class="text-sm text-gray-700">Pozdrav, <b>{{ mojUsername }}</b> — evo kako stojiš</p>
    </div>

    <p v-if="greska" class="mb-4 text-red-600">{{ greska }}</p>

    <!-- gornji red: prsten + tri brojke -->
    <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div class="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p class="font-medium">Ostvareni ECTS</p>
        <p class="mt-1 text-3xl font-bold text-brown">{{ ectsPolozeno }}<span class="text-xl font-medium text-gray-400"> / {{ ectsUpisano }}</span></p>
      </div>

      <div class="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p class="font-medium">Prosjek ocjena</p>
        <p class="mt-1 text-3xl font-bold text-brown">{{ prosjekTekst }}</p>
      </div>

      <div class="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p class="font-medium">Položeni kolegiji</p>
        <p class="mt-1 text-3xl font-bold text-brown">{{ polozeni.length }}<span class="text-xl font-medium text-gray-400"> / {{ kolegiji.length }}</span></p>
      </div>

      <div class="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p class="font-medium">Neriješene obveze</p>
        <p class="mt-1 text-3xl font-bold text-brown">{{ nerijesene.length }}</p>
      </div>

      <div class="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p class="font-medium">Učenje ovaj tjedan</p>
        <p class="mt-1 text-3xl font-bold text-brown">{{ minuteTekst(minuteTjedan) }}</p>
      </div>
    </div>

    <!-- donji red: lijevo ispitni rokovi + rokovi obveza, desno graf ucenja u punoj visini -->
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-4">
        <!-- nadolazeci ispitni rokovi -->
        <div class="rounded-xl border border-gray-200 bg-white">
          <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Nadolazeći ispitni rokovi</p>
          <p v-if="!nadolazeciIspiti.length" class="px-4 py-6 text-center text-sm text-gray-500">Nema zakazanih ispitnih rokova</p>
          <div v-for="kolegij in nadolazeciIspiti" :key="kolegij._id" class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <p class="min-w-0 break-words text-gray-900">{{ kolegij.naziv }}</p>
            <p class="shrink-0 text-sm text-gray-700">{{ formatDatum(kolegij.ispitniRok) }}</p>
          </div>
          <RouterLink to="/kolegiji" class="block px-5 py-3 text-sm font-medium text-brown hover:underline">Pogledaj kolegije →</RouterLink>
        </div>

        <!-- rokovi obveza ovog tjedna -->
        <div class="flex flex-1 flex-col rounded-xl border border-gray-200 bg-white">
          <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Rokovi ovog tjedna</p>
          <p v-if="!rokoviTjedna.length" class="px-4 py-6 text-center text-sm text-gray-500">Ovaj tjedan nema rokova</p>
          <div v-for="obveza in rokoviTjedna" :key="obveza._id" class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <p class="min-w-0 break-words text-gray-900">{{ obveza.naziv }}</p>
            <p class="shrink-0 text-sm" :class="daniDo(obveza.rok) === 0 ? 'font-bold text-red-600' : 'text-gray-700'">{{ rokTekst(obveza.rok) }}</p>
          </div>
          <RouterLink to="/obveze" class="mt-auto px-5 py-3 text-sm font-medium text-brown hover:underline">Pogledaj sve obveze →</RouterLink>
        </div>
      </div>
      <!-- graf ucenja -->
      <div class="flex flex-col rounded-xl border border-gray-200 bg-white">
        <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Učenje po danima</p>
        <div class="flex min-h-48 flex-1 px-6 pt-8">
          <div class="flex flex-1 items-end gap-3 border-b border-gray-200 pb-px">
            <div v-for="(minute, i) in poDanima" :key="i" class="flex h-full flex-1 items-end">
              <!-- brojka stoji iznad stupca, u pt-8 koji smo ostavili gore -->
              <div v-if="minute" class="relative w-full rounded-t" :class="i === danasIndex ? 'bg-brown/60' : 'bg-brown'" :style="{ height: (minute / najviseUDanu) * 100 + '%' }">
                <span class="absolute -top-5 left-0 w-full text-center text-xs font-medium text-gray-900">{{ minuteTekst(minute) }}</span>
              </div>
              <div v-else class="h-1 w-full rounded-t bg-gray-200"></div>
            </div>
          </div>
        </div>
        <div class="flex gap-3 px-6 py-3">
          <p v-for="(dan, i) in dani" :key="dan" class="flex-1 text-center text-sm" :class="i === danasIndex ? 'font-medium text-gray-700' : 'text-gray-400'">{{ dan }}</p>
        </div>
        <div class="flex items-center justify-end border-t border-gray-100 px-5 py-3">
          <RouterLink to="/ucenje" class="text-sm font-medium text-brown hover:underline">Idi na Učenje →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
