<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' 
import { useAuthStore } from '../stores/authStore.js'
import LozinkaInput from '../components/LozinkaInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('') 
const email = ref('')
const password = ref('')
const ponoviLozinku = ref('')
const greska = ref('')
const obrada = ref(false) 

async function submitRegister() {
  greska.value = ''
  if (password.value !== ponoviLozinku.value) {
    greska.value = 'Lozinke se ne podudaraju'
    return
  }
  obrada.value = true
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    router.push('/o-aplikaciji')
  } catch (error) {
    greska.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri registraciji'
  } finally {
    obrada.value = false 
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col lg:flex-row">
    <!-- lijevo: logo i ilustracija -->
    <div class="flex flex-col items-center justify-center gap-10 bg-brown/10 px-8 py-10 lg:w-1/2">
      <img src="/logo.svg" alt="StudentTracker" class="w-80" />
      <img src="/register.svg" alt="" class="w-full max-w-xs" />
    </div>
    <!-- desno: forma -->
    <div class="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <p class="mb-6 text-3xl font-bold text-brown">Dobrodošli</p>

      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <form @submit.prevent="submitRegister" novalidate>
          <label>Korisničko ime</label>
          <input v-model="username" type="text" placeholder="Upišite korisničko ime" class="input" />

          <label class="mt-4 block">Email</label>
          <input v-model="email" type="email" placeholder="Upišite email" class="input" />

          <label class="mt-4 block">Lozinka</label>
          <LozinkaInput v-model="password" placeholder="Upišite lozinku" />

          <label class="mt-4 block">Ponovi lozinku</label>
          <LozinkaInput v-model="ponoviLozinku" placeholder="Ponovite lozinku" />

          <p v-if="greska" class="mt-4 text-red-600">{{ greska }}</p>

          <button type="submit" :disabled="obrada" class="btn btn-primary mt-6 w-full">Registriraj se</button>
        </form>
        <p class="mt-4 text-center">Već imate račun? <RouterLink to="/login" class="text-brown">Prijava</RouterLink></p>
      </div>
    </div>
  </div>
</template>
