<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore.js";
import LozinkaInput from "../components/LozinkaInput.vue";

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
  <div class="flex min-h-full flex-col lg:flex-row">
    <!-- lijevo: logo i ilustracija -->
    <div class="flex flex-col items-center justify-center gap-10 bg-brown/10 px-8 py-10 lg:w-1/2">
      <img src="/logo.svg" alt="StudentTracker" class="w-80" />
      <img src="/login.svg" alt="" class="w-full max-w-sm" />
    </div>
    <!-- desno: forma -->
    <div class="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <p class="mb-6 text-3xl font-bold text-brown">Dobrodošli natrag</p>
      <p v-if="route.query.poruka === 'lozinka'" class="mb-4 font-medium text-green-700">Lozinka uspješno promijenjena — prijavite se ponovno.</p>
      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <form @submit.prevent="submitLogin" novalidate>

          <label>Email</label>
          <input v-model="email" type="email" placeholder="Upišite email" class="input" />

          <label class="mt-4 block">Lozinka</label>
          <LozinkaInput v-model="password" placeholder="Upišite lozinku" />

          <p v-if="greska" class="mt-4 text-red-600">{{ greska }}</p>
          <button type="submit" :disabled="obrada" class="btn btn-primary mt-6 w-full">Prijava</button>

        </form>
        <p class="mt-4 text-center">Nemate račun? <RouterLink to="/register" class="text-brown">Registracija</RouterLink></p>
      </div>
    </div>
  </div>
</template>