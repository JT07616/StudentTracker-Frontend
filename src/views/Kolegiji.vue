<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import api from '../services/api.js'
import ConfirmDelete from '../components/ConfirmDelete.vue'

const kolegiji = ref([])
const godine = ref([])
const greska = ref('')
const greskaBrisanja = ref('')
const obrada = ref(false) 
// kolegiji forma
const prikaziFormu = ref(false)
const uredjivanjeId = ref(null) 
const godinaIdForme = ref(null)
const semestarForme = ref(null)
const greskaForme = ref('')
const naziv = ref('')
const ects = ref('')
const status = ref('upisan')
const ocjena = ref('')
const ispitniRok = ref('')
// akademska godina forma
const prikaziFormuGodine = ref(false)
const noviRedniBroj = ref(null)
const novaOznaka = ref('')
const greskaGodine = ref('')

const potvrda = ref(null) // za brisanje

async function dohvatiKolegije() {
  greska.value = ''
  try {
    const { data } = await api.get('/kolegiji')
    kolegiji.value = data
  } catch (error) {
     greska.value = error.response?.data?.message || 'Greška pri dohvaćanju kolegija'
  }
}

async function dohvatiGodine() {
  greska.value = ''
  try {
    const { data } = await api.get('/akademske-godine')
    godine.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju godina'
  }
}

const dostupneGodine = computed(() => {
  const zauzete = godine.value.map((godina) => godina.redniBroj)
  return [1, 2, 3, 4, 5, 6].filter((broj) => !zauzete.includes(broj))
})

function openFormaGodine() {
  noviRedniBroj.value = dostupneGodine.value[0] || null
  novaOznaka.value = ''
  greskaGodine.value = ''
  prikaziFormuGodine.value = true
}

async function dodajGodinu() {
  greskaGodine.value = ''
  obrada.value = true
  try {
    await api.post('/akademske-godine', {
      redniBroj: noviRedniBroj.value,
      akademskaGodina: novaOznaka.value || null,
    })
     prikaziFormuGodine.value = false
     await dohvatiGodine()
  } catch (error) {
     greskaGodine.value = error.response?.data?.message || 'Greška pri dodavanju godine'
  } finally {
     obrada.value = false
  }
}


function openFormaKolegij(godina, semestar) {
  uredjivanjeId.value = null
  godinaIdForme.value = godina._id
  semestarForme.value = semestar
  naziv.value = ''
  ects.value = ''
  status.value = 'upisan'
  ocjena.value = ''
  ispitniRok.value = ''
  greskaForme.value = ''
  prikaziFormu.value = true
}

function openEditKolegij(kolegij) {
  uredjivanjeId.value = kolegij._id
  godinaIdForme.value = kolegij.godinaId
  semestarForme.value = kolegij.semestar
  naziv.value = kolegij.naziv
  ects.value = kolegij.ects
  status.value = kolegij.status
  ocjena.value = kolegij.ocjena || ''
  ispitniRok.value = kolegij.ispitniRok ? kolegij.ispitniRok.slice(0, 10) : '' 
  greskaForme.value = ''
  prikaziFormu.value = true
}

async function spremiKolegij() {
  greskaForme.value = ''
  obrada.value = true
  const podaci = {
    naziv: naziv.value,
    ects: Number(ects.value),
    godinaId: godinaIdForme.value,
    semestar: semestarForme.value,
    status: status.value,
    ocjena: status.value === 'polozen' && ocjena.value ? Number(ocjena.value) : null,
    ispitniRok: ispitniRok.value || null,
  }
  try {
    if (uredjivanjeId.value) {
      await api.put(`/kolegiji/${uredjivanjeId.value}`, podaci)
    } else {
      await api.post('/kolegiji', podaci)
    }
    prikaziFormu.value = false
     await dohvatiKolegije()
  } catch (error) {
    greskaForme.value = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri spremanju'
  } finally {
    obrada.value = false
  }
}

// tip odreduje i poruku i rutu brisanja; kriva vrijednost pukne vidljivo (404 u modalu)
function zatraziBrisanje(tip, stavka) {
  greskaBrisanja.value = ''
  potvrda.value = { tip, id: stavka._id, poruka: tip === 'kolegij' ? `Obrisati kolegij "${stavka.naziv}"?` : `Ukloniti ${stavka.redniBroj}. godinu?` }
}

async function potvrdiBrisanje() {
  const { tip, id } = potvrda.value
  try {
    if (tip === 'kolegij') {
      await api.delete(`/kolegiji/${id}`)
      await dohvatiKolegije()
    } else {
      await api.delete(`/akademske-godine/${id}`)
      await dohvatiGodine()
    }
    potvrda.value = null
  } catch (error) {
    greskaBrisanja.value = error.response?.data?.message || `Greška pri brisanju ${tip === 'kolegij' ? 'kolegija' : 'godine'}`
  }
}

const kolegijiSemestra = (semestar) => kolegiji.value.filter((kolegij) => kolegij.semestar === semestar)
const polozeniEctsGodine = (godinaId) => kolegiji.value.filter((kolegij) => kolegij.godinaId === godinaId && kolegij.status === 'polozen').reduce((zbroj, kolegij) => zbroj + kolegij.ects, 0)

const formatDatum = (datum) => new Date(datum).toLocaleDateString('hr-HR')
const rokProsao = (datum) => new Date(datum) < new Date(new Date().setHours(0, 0, 0, 0))

onMounted(() => {
  dohvatiKolegije()
  dohvatiGodine()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kolegiji</h1>
        <p class="text-sm text-gray-700">Kolegiji po godinama studija</p>
      </div>
      <button v-if="dostupneGodine.length" @click="openFormaGodine" class="btn btn-primary flex items-center gap-1.5"><Plus :size="16" /> Dodaj akademsku godinu</button>
    </div>
    <p v-if="greska" class="mb-4 text-red-600">{{ greska }}</p>
    <div v-if="!godine.length" class="py-16 text-center text-gray-700"><p class="mb-4">Dodaj prvu godinu i kreni s unosom kolegija.</p></div>
    <!-- godine -->
    <div v-for="godina in godine" :key="godina._id" class="mb-8">
      <div class="mb-3 flex items-center gap-3">
        <h2 class="text-lg font-bold text-gray-900">{{ godina.redniBroj }}. godina</h2>
        <span v-if="godina.akademskaGodina" class="text-sm text-gray-700">{{ godina.akademskaGodina }}</span>
        <span class="text-sm text-gray-700">{{ polozeniEctsGodine(godina._id) }} ECTS položeno</span>
        <button @click="zatraziBrisanje('godina', godina)" class="btn ml-auto flex items-center gap-1.5 border border-gray-300 text-sm text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600" title="Ukloni godinu"><Trash2 :size="14" />Ukloni akademsku godinu</button>
      </div>
      <!-- semestri -->
      <div v-for="semestar in [godina.redniBroj * 2 - 1, godina.redniBroj * 2]" :key="semestar" class="mb-4 rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <p class="font-medium text-gray-900">{{ semestar }}. semestar ({{ semestar % 2 === 1 ? 'zimski' : 'ljetni' }})</p>
          <button @click="openFormaKolegij(godina, semestar)" class="btn flex items-center gap-1 border border-brown text-sm text-brown hover:bg-brown/10"><Plus :size="14" /> Dodaj kolegij</button>
        </div>

        <p v-if="!kolegijiSemestra(semestar).length" class="px-4 py-5 text-center text-sm text-gray-700">Još nema kolegija</p>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-left text-gray-500">
              <th class="px-4 py-2 font-medium">Kolegij</th>
              <th class="w-20 px-2 py-2 text-center font-medium">ECTS</th>
              <th class="w-28 px-2 py-2 font-medium">Status</th>
              <th class="w-20 px-2 py-2 text-center font-medium">Ocjena</th>
              <th class="w-32 px-2 py-2 font-medium">Ispitni rok</th>
              <th class="w-24 px-2 py-2 font-medium">Akcije</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kolegij in kolegijiSemestra(semestar)" :key="kolegij._id" class="border-b border-gray-100 last:border-b-0">
              <td class="px-4 py-3 font-medium text-gray-900">{{ kolegij.naziv }}</td>
              <td class="px-2 py-3 text-center text-gray-700">{{ kolegij.ects }}</td>
              <td class="px-2 py-3"><span :class="kolegij.status === 'polozen' ? 'text-green-700' : 'text-brown'">{{ kolegij.status === 'polozen' ? 'Položen' : 'Upisan' }}</span></td>
              <td class="px-2 py-3 text-center text-gray-700">{{ kolegij.ocjena || '–' }}</td>
              <td class="px-2 py-3" :class="kolegij.ispitniRok && rokProsao(kolegij.ispitniRok) ? 'text-red-600' : 'text-gray-700'">{{ kolegij.ispitniRok ? formatDatum(kolegij.ispitniRok) : '–' }}</td>
              <td class="px-2 py-3">
                <div class="flex gap-1">
                  <button @click="openEditKolegij(kolegij)" class="rounded-lg border border-gray-200 p-1.5 text-gray-700 hover:bg-gray-50"><Pencil :size="14" /></button>
                  <button @click="zatraziBrisanje('kolegij', kolegij)" class="rounded-lg border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- modal za kolegije -->
    <div v-if="prikaziFormu" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="prikaziFormu = false">
      <form @submit.prevent="spremiKolegij" novalidate class="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 class="mb-5 text-lg font-bold">{{ uredjivanjeId ? 'Uredi kolegij' : 'Novi kolegij' }} — {{ semestarForme }}. semestar ({{ semestarForme % 2 === 1 ? 'zimski' : 'ljetni' }})</h2>

        <label class="text-sm font-medium">Naziv</label>
        <input v-model="naziv" class="input" />

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium">ECTS</label>
            <input v-model="ects" type="number" class="input" />
          </div>
          <div>
            <label class="text-sm font-medium">Status</label>
            <select v-model="status" class="input">
              <option value="upisan">Upisan</option>
              <option value="polozen">Položen</option>
            </select>
          </div>
          <div v-if="status === 'polozen'">
            <label class="text-sm font-medium">Ocjena</label>
            <input v-model="ocjena" type="number" class="input" />
          </div>
          <div>
            <label class="text-sm font-medium">Ispitni rok</label>
            <input v-model="ispitniRok" type="date" class="input" />
          </div>
        </div>

        <p v-if="greskaForme" class="mt-3 text-sm text-red-600">{{ greskaForme }}</p>

        <div class="mt-5 flex gap-2">
          <button type="submit" :disabled="obrada" class="btn btn-primary">Spremi</button>
          <button type="button" @click="prikaziFormu = false" class="btn border border-gray-300 hover:bg-gray-50">Odustani</button>
        </div>
      </form>
    </div>
    <!-- akademska godina modal -->
    <div v-if="prikaziFormuGodine" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="prikaziFormuGodine = false">
      <form @submit.prevent="dodajGodinu" novalidate class="w-full max-w-sm rounded-2xl bg-white p-6">
        <h2 class="mb-5 text-lg font-bold">Nova godina</h2>

        <label class="text-sm font-medium">Godina studija</label>
        <select v-model="noviRedniBroj" class="input">
          <option v-for="broj in dostupneGodine" :key="broj" :value="broj">{{ broj }}. godina</option>
        </select>

        <label class="mt-4 block text-sm font-medium">Akademska godina (neobavezno)</label>
        <input v-model="novaOznaka" placeholder="npr. 2025./26." class="input" />

        <p v-if="greskaGodine" class="mt-3 text-sm text-red-600">{{ greskaGodine }}</p>

        <div class="mt-5 flex gap-2">
          <button type="submit" :disabled="obrada" class="btn btn-primary">Dodaj</button>
          <button type="button" @click="prikaziFormuGodine = false" class="btn border border-gray-300 hover:bg-gray-50">Odustani</button>
        </div>
      </form>
    </div>

    <ConfirmDelete v-if="potvrda" :poruka="potvrda.poruka" :greska="greskaBrisanja" @potvrdi="potvrdiBrisanje" @odustani="potvrda = null" />
  </div>
</template>
