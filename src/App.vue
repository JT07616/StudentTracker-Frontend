<script setup>
import { RouterView, RouterLink } from "vue-router";
import { Info } from "lucide-vue-next";
import { useAuthStore } from "./stores/authStore.js";
import Sidebar from "./components/Sidebar.vue";

const authStore = useAuthStore();
</script>

<template>
  <div class="flex h-screen bg-brown/2">
    <Sidebar v-if="authStore.autoriziran" />
    <main class="flex flex-1 flex-col">
      <div class="flex-1 overflow-y-auto">
        <RouterView />
      </div>
      <!-- neprozirna boja + z-10 da sjena sidebara ne pada preko footera -->
      <footer v-if="authStore.autoriziran" class="relative z-10 flex h-[52px] items-center justify-end border-t border-brown/25 bg-[#f6ede8] px-5">
        <RouterLink to="/o-aplikaciji" class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-950 transition-colors hover:bg-brown/25">
          <Info :size="15" /> O aplikaciji
        </RouterLink>
      </footer>
    </main>
  </div>
</template>