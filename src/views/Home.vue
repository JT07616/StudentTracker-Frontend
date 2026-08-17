<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const odjava = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">Pozdrav, {{ authStore.korisnik?.username }}!</h1>
    <button @click="odjava" class="mt-4 rounded-lg bg-[#b56a3d] px-4 py-2 font-medium text-white hover:bg-[#a05c33]">Odjava</button>
  </div>
</template>