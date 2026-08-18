<script setup>
import { RouterView } from "vue-router";
import { useAuthStore } from "./stores/authStore.js";
import Sidebar from "./components/Sidebar.vue";

const authStore = useAuthStore();
</script>

<template>
  <div class="flex min-h-screen bg-brown/2">
    <Sidebar v-if="authStore.autoriziran" />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>