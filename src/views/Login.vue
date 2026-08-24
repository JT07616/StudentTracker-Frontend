<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore.js";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref(""); 
const password = ref("");
const obrada = ref(false); 
const greska = ref(""); 

async function submitLogin() {
  greska.value = ""; 
  obrada.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push("/");
  } catch (error) {
    greska.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "Pogrešan email ili lozinka";
  } finally {
    obrada.value = false; 
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col items-center justify-center px-4">
    <img src="/logo.svg" alt="StudentTracker" class="mb-6 w-80" />
     <p class="mb-6 text-center">Dobrodošli, prijavite se za nastavak</p>
    <p v-if="route.query.poruka === 'lozinka'" class="mb-4 text-center font-medium text-green-700">Lozinka uspješno promijenjena — prijavite se ponovno.</p>
    <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
      <form @submit.prevent="submitLogin" novalidate>

        <label>Email</label>
        <input v-model="email" type="email" placeholder="Upišite email" class="input" />

        <label class="mt-4 block">Lozinka</label>
        <input v-model="password" type="password" placeholder="Upišite lozinku" class="input" />

        <p v-if="greska" class="mt-4 text-red-600">{{ greska }}</p>
        <button type="submit" :disabled="obrada" class="btn btn-primary mt-6 w-full">Prijava</button>

      </form>

      <p class="mt-4 text-center">Nemate račun? <RouterLink to="/register" class="text-[#b56a3d]">Registracija</RouterLink></p>
    </div>
  </div>
</template>