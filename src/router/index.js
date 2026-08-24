import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Kolegiji from '../views/Kolegiji.vue'
import Obveze from '../views/Obveze.vue'
import Pomoc from '../views/Pomoc.vue'
import Ucenje from '../views/Ucenje.vue'
import Profil from '../views/Profil.vue'
import OAplikaciji from '../views/OAplikaciji.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/kolegiji', name: 'kolegiji', component: Kolegiji, meta: { requiresAuth: true } },
    { path: '/obveze', name: 'obveze', component: Obveze, meta: { requiresAuth: true } },
    { path: '/pomoc', name: 'pomoc', component: Pomoc, meta: { requiresAuth: true } },
    { path: '/ucenje', name: 'ucenje', component: Ucenje, meta: { requiresAuth: true } },
    { path: '/profil', name: 'profil', component: Profil, meta: { requiresAuth: true } },
    { path: '/o-aplikaciji', name: 'oAplikaciji', component: OAplikaciji }
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.autoriziran) return '/login'
  if ((to.name === 'login' || to.name === 'register') && authStore.autoriziran) return '/'
})

export default router
