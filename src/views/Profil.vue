<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api.js'
import LozinkaInput from '../components/LozinkaInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const staraLozinka = ref('')
const novaLozinka = ref('')
const ponoviLozinku = ref('')
const greska = ref('')
const obrada = ref(false)
const prikaziLjestvica = ref(true)
const greskaLjestv = ref('')

async function dohvatiProfil() {
  greskaLjestv.value = ''
  try {
    const { data } = await api.get('/auth/me')
    prikaziLjestvica.value = data.showOnLeaderboard
  } catch (error) {
    greskaLjestv.value = error.response?.data?.message || 'Greška pri dohvaćanju profila'
  }
}

async function promijeniVidljivost() {
  greskaLjestv.value = ''
  try {
    await api.patch('/auth/ljestvica', { showOnLeaderboard: prikaziLjestvica.value })
  } catch (error) {
    greskaLjestv.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri spremanju postavke'
    prikaziLjestvica.value = !prikaziLjestvica.value 
  }
}

onMounted(dohvatiProfil)

async function promijeniLozinku() {
  greska.value = ''
  if (novaLozinka.value !== ponoviLozinku.value) {
     greska.value = 'Nove lozinke se ne podudaraju'
     return
  }
  obrada.value = true
  try {
      await api.patch('/auth/lozinka', {
       staraLozinka: staraLozinka.value,
       novaLozinka: novaLozinka.value,
    })
      // stari token vrijedi do isteka pa korisnika odmah odjavljujemo
      authStore.logout()
      router.push({ path: '/login', query: { poruka: 'lozinka' } })
  } catch (error) {
     greska.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri promjeni lozinke'
  } finally {
    obrada.value = false
  }
}
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Profil</h1>
    </div>

    <div class="grid max-w-4xl items-start gap-6 lg:grid-cols-2">
      <div class="space-y-6">
        <!-- podaci racuna -->
        <div class="rounded-xl border border-gray-200 bg-white p-6">
          <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"><User :size="16" /></div>
            <span class="text-sm text-gray-700">Korisničko ime:</span> <span class="ml-auto text-sm font-medium">{{ authStore.korisnik?.username }}</span>
          </div>
          <div class="flex items-center gap-3 pt-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600"><Mail :size="16" /></div>
            <span class="text-sm text-gray-700">Email:</span> <span class="ml-auto text-sm font-medium">{{ authStore.korisnik?.email }}</span>
          </div>
        </div>
        <!-- patch za vidljivost na ljestivic -->
        <div class="rounded-xl border border-gray-200 bg-white p-6">
          <label class="flex cursor-pointer items-center gap-3">
            <input v-model="prikaziLjestvica" @change="promijeniVidljivost" type="checkbox" class="h-4 w-4 accent-brown" />
            <span class="text-sm font-medium text-gray-900">Prikaži me na ljestvici učenja</span>
          </label>
          <p class="mt-2 text-xs text-gray-500">Ako isključiš, kolege te ne vide na tjednoj ljestvici, a sesije ostaju samo tebi.</p>
          <p v-if="greskaLjestv" class="mt-2 text-sm text-red-600">{{ greskaLjestv }}</p>
        </div>
      </div>
      <!-- promjena lozinke -->
      <form @submit.prevent="promijeniLozinku" novalidate class="rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-lg font-bold text-gray-900">Promjena lozinke</h2>

        <label class="text-sm">Stara lozinka:</label>
        <LozinkaInput v-model="staraLozinka" placeholder="Unesi staru lozinku" />

        <label class="mt-4 block text-sm">Nova lozinka:</label>
        <LozinkaInput v-model="novaLozinka" placeholder="Unesi novu lozinku" />

        <label class="mt-4 block text-sm">Ponovi novu lozinku:</label>
        <LozinkaInput v-model="ponoviLozinku" placeholder="Ponovi novu lozinku" />

        <p v-if="greska" class="mt-4 text-red-600">{{ greska }}</p>

        <button type="submit" :disabled="obrada" class="btn btn-primary mt-6 w-full">Promijeni lozinku</button>
      </form>
    </div>
  </div>
</template>