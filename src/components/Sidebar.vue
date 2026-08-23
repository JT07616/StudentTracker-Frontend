<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { LogOut, LayoutDashboard, Users, CheckSquare, BookOpen, Timer, Settings } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore.js'
import { useTimerStore } from '../stores/timerStore.js'

const router = useRouter()
const authStore = useAuthStore()
const timer = useTimerStore()

// ikone i putanje koje se koriste u navigaciji sidebara
const navItems = [
  { path: '/', label: 'Pregled', icon: LayoutDashboard },
  { path: '/kolegiji', label: 'Kolegiji', icon: BookOpen },
  { path: '/obveze', label: 'Obveze', icon: CheckSquare },
  { path: '/ucenje', label: 'Učenje', icon: Timer },
  { path: '/pomoc', label: 'Pomoć', icon: Users },
  { path: '/profil', label: 'Profil', icon: Settings },
]

const korisnikInitials = computed(() => {
  return authStore.korisnik?.username?.[0]?.toUpperCase() || '?'
})

function odjava() {
  timer.zaustavi()
  timer.resetiraj()
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="flex h-screen w-60 shrink-0 flex-col border-r border-brown/25 bg-brown/10 text-gray-900 shadow-xl">
    <!-- Header -->
    <div class="p-5">
      <h1 class="text-base font-bold text-amber-950">StudentTracker</h1>
    </div>
    <!-- Navigacija -->
    <nav class="flex-1 space-y-1 px-3">
      <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" custom v-slot="{ href, navigate, isActive }">
        <a :href="href" @click="navigate" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" :class="isActive ? 'bg-brown text-white' : 'text-black hover:bg-brown/25'">
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ item.label }}</span>
        </a>
      </RouterLink>
    </nav>
    <!-- mini timer od ucenja - klik vodi na stranicu -->
    <RouterLink v-if="timer.pocetak" to="/ucenje" class="mx-3 mb-1 flex items-center gap-3 rounded-lg bg-brown/25 px-3 py-2.5 text-sm font-medium text-black">
      <Timer class="h-4 w-4 shrink-0" /><span>Učenje</span><span class="ml-auto font-mono">{{ timer.prikazVremena }}</span>
    </RouterLink>
    <!-- Profil -->
    <div class="px-3 py-2">
      <div class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-black">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brown text-xs font-bold text-white">{{ korisnikInitials }}</div> <span class="truncate">{{ authStore.korisnik?.username }}</span>
      </div>
    </div>
    <!-- Odjava -->
    <div class="border-t border-brown/25 p-3">
      <button @click="odjava" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-brown/25">
        <LogOut class="h-4 w-4 shrink-0" /><span>Odjava</span>
      </button>
    </div>
  </aside>
</template>
