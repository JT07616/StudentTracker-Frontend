<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Trash2, Check } from 'lucide-vue-next'
import api from '../services/api.js'
import ConfirmDelete from '../components/ConfirmDelete.vue'

const obveze = ref([])
const kolegiji = ref([])
const greska = ref('')
const greskaBrisanja = ref('')
const obrada = ref(false)
const potvrda = ref(null) // za brisanje
const filter = ref('sve') // sve | nerijeseno | rijeseno
const noviNaziv = ref('')
const noviKolegijId = ref('')
const noviRok = ref('')

async function dohvatiObveze() {
  greska.value = ''
  try {
    const { data } = await api.get('/obveze')
    obveze.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju obveza'
  }
}

async function dohvatiKolegije() {
  greska.value = ''
  try {
    const { data } = await api.get('/kolegiji')
    kolegiji.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju kolegija'
  }
}

async function dodajObvezu() {
  if (!noviNaziv.value.trim() || !noviKolegijId.value) return
  greska.value = ''
  obrada.value = true
  try {
    await api.post('/obveze', {
      naziv: noviNaziv.value.trim(),
      kolegijId: noviKolegijId.value,
      rok: noviRok.value || null,
    })
    noviNaziv.value = ''
    noviRok.value = ''
    await dohvatiObveze()
  } catch (error) {
    greska.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri dodavanju obveze'
  } finally {
    obrada.value = false
  }
}

async function promijeniGotovo(obveza) {
  greska.value = ''
  try {
    await api.patch(`/obveze/${obveza._id}`, { gotovo: !obveza.gotovo })
    await dohvatiObveze()
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri promjeni statusa'
  }
}

function zatraziBrisanje(obveza) {
  greskaBrisanja.value = ''
  potvrda.value = { id: obveza._id, poruka: `Obrisati obvezu "${obveza.naziv}"?` }
}

async function potvrdiBrisanje() {
  try {
    await api.delete(`/obveze/${potvrda.value.id}`)
    await dohvatiObveze()
    potvrda.value = null
  } catch (error) {
    greskaBrisanja.value = error.response?.data?.message || 'Greška pri brisanju obveze'
  }
}

const nazivKolegija = (id) => kolegiji.value.find((kolegij) => kolegij._id === id)?.naziv || 'Nepoznat kolegij'
const daniDo = (datum) => Math.ceil((new Date(datum).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))


const rokTekst = (rok) => {
  const dana = daniDo(rok)
  if (dana === 0) return 'DANAS'
  if (dana > 0) return `za ${dana} ${dana === 1 ? 'dan' : 'dana'}`
  return `kasniš ${-dana} ${-dana === 1 ? 'dan' : 'dana'}`
}

const rijesenoTekst = (datum) => {
  const dana = -daniDo(datum)
  return dana === 0 ? 'riješeno danas' : `riješeno prije ${dana} ${dana === 1 ? 'dan' : 'dana'}`
}

const aktivne = computed(() =>
  obveze.value.filter((obveza) => !obveza.gotovo).sort((a, b) => new Date(a.rok || '9999-01-01') - new Date(b.rok || '9999-01-01')),
)

const grupe = computed(() => [
  { kljuc: 'kasnis', naslov: '🔴 Kasniš', lista: aktivne.value.filter((obveza) => obveza.rok && daniDo(obveza.rok) < 0), prazno: 'Ništa ne gori' },
  { kljuc: 'tjedan', naslov: '🟠 Ovaj tjedan', lista: aktivne.value.filter((obveza) => obveza.rok && daniDo(obveza.rok) >= 0 && daniDo(obveza.rok) <= 7), prazno: null },
  { kljuc: 'kasnije', naslov: '⚪ Kasnije', lista: aktivne.value.filter((obveza) => obveza.rok && daniDo(obveza.rok) > 7), prazno: null },
  { kljuc: 'bezRoka', naslov: '⚫ Bez roka', lista: aktivne.value.filter((obveza) => !obveza.rok), prazno: null },
  { kljuc: 'rijeseno', naslov: '🟢 Riješeno', lista: obveze.value.filter((obveza) => obveza.gotovo), prazno: null },
])

const filtriraneGrupe = computed(() => {
  if (filter.value === 'nerijeseno') return grupe.value.filter((grupa) => grupa.kljuc !== 'rijeseno')
  if (filter.value === 'rijeseno') return grupe.value.filter((grupa) => grupa.kljuc === 'rijeseno')
  return grupe.value
})

onMounted(() => {
  dohvatiObveze()
  dohvatiKolegije()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Obveze</h1>
    </div>

    <p v-if="greska" class="mb-4 text-red-600">{{ greska }}</p>

    <!-- bez kolegija nema obveza - vodi korisnika -->
    <div v-if="!kolegiji.length" class="py-16 text-center text-gray-700">
      <p class="mb-4">Prvo dodaj kolegije da bi mogao unositi obveze.</p>
      <RouterLink to="/kolegiji" class="btn btn-primary inline-block">Idi na Kolegije</RouterLink>
    </div>

    <template v-else>
      <!-- inline unos -->
      <form @submit.prevent="dodajObvezu" class="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <select v-model="noviKolegijId" class="input mt-0! w-56!">
          <option value="" disabled>Kolegij</option>
          <option v-for="kolegij in kolegiji" :key="kolegij._id" :value="kolegij._id">{{ kolegij.naziv }}</option>
        </select>
        <input v-model="noviNaziv" placeholder="Nova obveza, npr. Predati seminar..." class="input mt-0! flex-1" />
        <input v-model="noviRok" type="date" class="input mt-0! w-40!" />
        <button type="submit" :disabled="obrada" class="btn btn-primary flex items-center gap-1"><Plus :size="14" /> Dodaj</button>
      </form>
      <!-- filteri -->
      <div class="mb-4 flex gap-2">
        <button @click="filter = 'sve'" :class="filter === 'sve' ? 'bg-brown text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'" class="btn text-sm">Sve obveze</button>
        <button @click="filter = 'nerijeseno'" :class="filter === 'nerijeseno' ? 'bg-brown text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'" class="btn text-sm">Neriješeno</button>
        <button @click="filter = 'rijeseno'" :class="filter === 'rijeseno' ? 'bg-brown text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'" class="btn text-sm">Riješeno</button>
      </div>
      <!-- grupe po hitnosti -->
      <div v-for="grupa in filtriraneGrupe" :key="grupa.kljuc">
        <div v-if="grupa.lista.length || grupa.prazno" class="mb-6 rounded-xl border border-gray-200 bg-white">
          <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">{{ grupa.naslov }} ({{ grupa.lista.length }})</p>

          <p v-if="!grupa.lista.length" class="px-4 py-4 text-center text-sm text-gray-700">{{ grupa.prazno }}</p>
          <div v-for="obveza in grupa.lista" :key="obveza._id" class="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0" :class="obveza.gotovo && 'bg-gray-50'">
            <input type="checkbox" :checked="obveza.gotovo" @change="promijeniGotovo(obveza)" class="h-4 w-4 accent-brown" />
            <div class="flex-1">
              <p class="text-gray-900" :class="!obveza.gotovo && 'font-medium'">{{ obveza.naziv }}</p>
              <p class="text-sm text-gray-500">{{ nazivKolegija(obveza.kolegijId) }}</p>
            </div>
            <Check v-if="obveza.gotovo" :size="16" class="text-green-600" />
            <p v-if="obveza.gotovo" class="text-xs text-gray-500">{{ rijesenoTekst(obveza.updatedAt) }}</p>
            <p v-else-if="obveza.rok" class="text-sm" :class="daniDo(obveza.rok) < 0 ? 'font-medium text-red-600' : daniDo(obveza.rok) === 0 ? 'font-bold text-red-600' : 'text-gray-700'">{{ rokTekst(obveza.rok) }}</p>
            <button @click="zatraziBrisanje(obveza)" class="rounded-lg border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 :size="14" /></button>
          </div>
        </div>
      </div>
    </template>

    <ConfirmDelete v-if="potvrda" :poruka="potvrda.poruka" :greska="greskaBrisanja" @potvrdi="potvrdiBrisanje" @odustani="potvrda = null" />
  </div>
</template>