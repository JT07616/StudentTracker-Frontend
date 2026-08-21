<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api.js'

const router = useRouter()
const authStore = useAuthStore()

const staraLozinka = ref('')
const novaLozinka = ref('')
const ponoviLozinku = ref('')
const greska = ref('')
const obrada = ref(false)

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

    <!-- podaci rachuna -->
    <div class="mb-6 max-w-md rounded-xl border border-gray-200 bg-white p-6">
      <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"><User :size="16" /></div>
        <span class="text-sm text-gray-700">Korisničko ime:</span> <span class="ml-auto text-sm font-medium">{{ authStore.korisnik?.username }}</span>
      </div>
      <div class="flex items-center gap-3 pt-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600"><Mail :size="16" /></div>
        <span class="text-sm text-gray-700">Email:</span> <span class="ml-auto text-sm font-medium">{{ authStore.korisnik?.email }}</span>
      </div>
    </div>

    <!-- promjena lozinke -->
    <form @submit.prevent="promijeniLozinku" novalidate class="max-w-md rounded-xl border border-gray-200 bg-white p-6">
      <h2 class="mb-4 text-lg font-bold text-gray-900">Promjena lozinke</h2>

      <label class="text-sm font-medium">Stara lozinka</label>
      <input v-model="staraLozinka" type="password" placeholder="Unesi staru lozinku" class="input" />

      <label class="mt-4 block text-sm font-medium">Nova lozinka</label>
      <input v-model="novaLozinka" type="password" placeholder="Unesi novu lozinku" class="input" />

      <label class="mt-4 block text-sm font-medium">Ponovi novu lozinku</label>
      <input v-model="ponoviLozinku" type="password" placeholder="Ponovi novu lozinku" class="input" />

      <p v-if="greska" class="mt-4 text-red-600">{{ greska }}</p>

      <button type="submit" :disabled="obrada" class="btn btn-primary mt-6 w-full">Promijeni lozinku</button>
    </form>
  </div>
</template>