<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import api from '../services/api.js'
import ConfirmDelete from '../components/ConfirmDelete.vue'
import { useAuthStore } from '../stores/authStore.js'

const authStore = useAuthStore()

const zahtjevi = ref([])
const greska = ref('')
const greskaBrisanja = ref('')
const obrada = ref(false)
const potvrda = ref(null) // za brisanje
const filterStatus = ref('') // '' = svi statusi
const filterPomazem = ref('')
const forma = reactive({ prikazi: false, id: null, naslov: '', opis: '', greska: ''})
const prihvat = reactive({zahtjev: null, kontakt: '',greska: ''})

function openForma() { 
  forma.id = null,  
  forma.naslov = '' , 
  forma.opis = '', 
  forma.greska = '', 
  forma.prikazi = true
}
function openEdit(zahtjev) { 
  forma.id = zahtjev._id , 
  forma.naslov = zahtjev.naslov , 
  forma.opis = zahtjev.opis || '' , 
  forma.greska = '', 
  forma.prikazi = true 
}

const mojZahtjev = (zahtjev) => zahtjev.autorId === authStore.korisnik.id
const otvoreniTudji = computed(() => zahtjevi.value.filter((zahtjev) => zahtjev.status === 'otvoren' && !mojZahtjev(zahtjev)))
const moji = computed(() => zahtjevi.value.filter(mojZahtjev))
const mojiFiltrirani = computed(() => (filterStatus.value ? moji.value.filter((zahtjev) => zahtjev.status === filterStatus.value) : moji.value))
const pomazem = computed(() => zahtjevi.value.filter((zahtjev) => zahtjev.pomagacId === authStore.korisnik.id))
const pomazemFiltrirani = computed(() => (filterPomazem.value ? pomazem.value.filter((zahtjev) => zahtjev.status === filterPomazem.value) : pomazem.value))

async function dohvatiZahtjeve() {
  greska.value = ''
  try {
    const { data } = await api.get('/pomoc')
    zahtjevi.value = data
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri dohvaćanju zahtjeva'
  }
}

async function spremiZahtjev() {
  forma.greska = ''
  obrada.value = true
  try {
    if (forma.id) {
      await api.put(`/pomoc/${forma.id}`, { naslov: forma.naslov, opis: forma.opis || null })
    } else {
      await api.post('/pomoc', { naslov: forma.naslov, opis: forma.opis || null })
    }
    forma.prikazi = false
    await dohvatiZahtjeve()
  } catch (error) {
    forma.greska = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri spremanju zahtjeva'
  } finally {
    obrada.value = false
  }
}

function openPrihvat(zahtjev) { prihvat.kontakt = '' , prihvat.greska = '' , prihvat.zahtjev = zahtjev }

async function potvrdiPrihvat() {
  prihvat.greska = ''
  obrada.value = true
  try {
    await api.patch(`/pomoc/${prihvat.zahtjev._id}/prihvati`, { kontakt: prihvat.kontakt || null })
    prihvat.zahtjev = null
    await dohvatiZahtjeve()
  } catch (error) {
    prihvat.greska = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Greška pri prihvaćanju zahtjeva'
  } finally {
    obrada.value = false
  }
}

// rijeseno <-> u tijeku 
async function promijeniRijeseno(id) {
  greska.value = ''
  obrada.value = true
  try {
    await api.patch(`/pomoc/${id}/rijesi`)
    await dohvatiZahtjeve()
  } catch (error) {
    greska.value = error.response?.data?.message || 'Greška pri promjeni statusa'
  } finally {
    obrada.value = false
  }
}

function zatraziBrisanje(zahtjev) {
  greskaBrisanja.value = ''
  potvrda.value = { id: zahtjev._id, poruka: `Obrisati zahtjev "${zahtjev.naslov}"?` }
}

async function potvrdiBrisanje() {
  try {
    await api.delete(`/pomoc/${potvrda.value.id}`)
    await dohvatiZahtjeve()
    potvrda.value = null
  } catch (error) {
    greskaBrisanja.value = error.response?.data?.message || 'Greška pri brisanju zahtjeva'
  }
}

const formatDatum = (datum) => new Date(datum).toLocaleDateString('hr-HR')

onMounted(dohvatiZahtjeve)
</script>

<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pomoć</h1>
      <p class="text-sm text-gray-700">Zatraži pomoć od kolega ili pomogni nekome</p>
    </div>
    <p v-if="greska" class="mb-4 text-red-600">{{ greska }}</p>
    <div class="grid items-start gap-6 lg:grid-cols-3">
      <!-- lijevo: otvoreni zahtjevi kolega -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
        <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          <p class="font-medium text-gray-900">Kolege trebaju pomoć</p>
          <p class="text-sm text-gray-500">{{ otvoreniTudji.length }}</p>
        </div>

        <div v-if="!otvoreniTudji.length" class="px-4 py-10 text-center">
          <img src="/pomoc.svg" alt="" class="mx-auto mb-4 w-44" />
          <p class="text-sm text-gray-500">Trenutno nitko ne traži pomoć</p>
        </div>
        <div v-for="zahtjev in otvoreniTudji" :key="zahtjev._id" class="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0">
          <div class="flex-1">
            <p class="min-w-0 font-medium break-words text-gray-900">{{ zahtjev.naslov }}</p>
            <p v-if="zahtjev.opis" class="mt-0.5 text-sm break-words text-gray-700">{{ zahtjev.opis }}</p>
            <p class="mt-1 text-xs"><strong class="font-medium text-gray-600">{{ zahtjev.autorUsername }}</strong>, <span class="text-brown/70">{{ formatDatum(zahtjev.createdAt) }}</span></p>
          </div>
          <button @click="openPrihvat(zahtjev)" class="btn btn-primary shrink-0 text-sm">Pomoći ću</button>
        </div>
      </div>
      <!-- moje -->
      <div>
        <button @click="openForma()" class="btn btn-primary mb-4 flex w-full items-center justify-center gap-1.5"><Plus :size="16" /> Trebam pomoć</button>
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
            <p class="font-medium text-gray-900">Moji zahtjevi</p>
            <select v-model="filterStatus" class="input mt-0! w-36! py-1!">
              <option value="">Svi ({{ moji.length }})</option>
              <option value="otvoren">Na čekanju</option>
              <option value="prihvacen">U tijeku</option>
              <option value="rijesen">Riješeno</option>
            </select>
          </div>
          <p v-if="!mojiFiltrirani.length" class="px-4 py-6 text-center text-sm text-gray-500">{{ filterStatus ? 'Nema zahtjeva s tim statusom' : 'Još nemaš zahtjeva' }}</p>
          <div v-if="mojiFiltrirani.length" class="space-y-3 p-3">
            <div v-for="zahtjev in mojiFiltrirani" :key="zahtjev._id" class="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div class="flex items-start gap-2">
                <p class="min-w-0 flex-1 font-medium break-words text-gray-900">{{ zahtjev.naslov }}</p>
                <div class="flex gap-1">
                  <button v-if="zahtjev.status === 'otvoren'" @click="openEdit(zahtjev)" title="Uredi zahtjev" class="rounded-lg border border-gray-200 p-1.5 text-gray-700 hover:bg-gray-50"><Pencil :size="14" /></button>
                  <button v-if="zahtjev.status !== 'prihvacen'" @click="zatraziBrisanje(zahtjev)" title="Obriši zahtjev" class="rounded-lg border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 :size="14" /></button>
                </div>
              </div>
              <p v-if="zahtjev.opis" class="mt-0.5 text-sm break-words text-gray-600 ">{{ zahtjev.opis }}</p>
              <p v-if="zahtjev.status === 'otvoren'" class="mt-2.5 flex items-center gap-2 text-sm text-gray-500"><span class="h-2 w-2 shrink-0 rounded-full bg-gray-300"></span> Na čekanju</p>
              <template v-else-if="zahtjev.status === 'prihvacen'">
                <div class="mt-2.5 rounded-lg border border-brown/25 bg-brown/10 px-3 py-2 text-sm">
                  <p class="text-gray-900">Pomaže ti <strong>{{ zahtjev.pomagacUsername }}</strong></p>
                  <p class="mt-0.5 break-words"><b>kontakt:</b> {{ zahtjev.kontakt }}</p>
                </div>
                <button @click="promijeniRijeseno(zahtjev._id)" :disabled="obrada" class="mt-2 w-full rounded-lg bg-green-600 py-1.5 text-sm font-medium text-white hover:bg-green-700">Označi kao riješeno</button>
              </template>
              <template v-else>
                <div class="mt-2.5 flex items-center gap-2">
                  <span class="h-2 w-2 shrink-0 rounded-full bg-green-500"></span><p class="flex-1 text-sm text-green-700">Riješeno uz pomoć <strong>{{ zahtjev.pomagacUsername }}</strong>.</p>
                  <button @click="promijeniRijeseno(zahtjev._id)" :disabled="obrada" class="rounded-lg border border-brown/25 bg-brown/10 px-2.5 py-1 text-xs font-medium text-brown hover:bg-brown/25">Vrati u tijek</button>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-if="pomazem.length" class="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
            <p class="font-medium text-gray-900">Pomažem</p>
            <select v-model="filterPomazem" class="input mt-0! w-36! py-1!">
              <option value="">Svi ({{ pomazem.length }})</option>
              <option value="prihvacen">U tijeku</option>
              <option value="rijesen">Riješeno</option>
            </select>
          </div>

          <p v-if="!pomazemFiltrirani.length" class="px-4 py-6 text-center text-sm text-gray-500">Nema zahtjeva s tim statusom</p>
          <div v-for="zahtjev in pomazemFiltrirani" :key="zahtjev._id" class="border-b border-gray-100 px-4 py-3 last:border-b-0">
            <div class="flex items-baseline justify-between gap-2">
              <p class="min-w-0 font-medium break-words text-gray-900">{{ zahtjev.naslov }}</p>
              <p class="shrink-0 text-xs"><strong class="font-medium text-gray-600">{{ zahtjev.autorUsername }}</strong>, <span class="text-brown/70">{{ formatDatum(zahtjev.createdAt) }}</span></p>
            </div>
            <p v-if="zahtjev.opis" class="mt-0.5 text-sm break-words text-gray-600">{{ zahtjev.opis }}</p>

            <div class="mt-2 flex items-center gap-2 text-sm">
              <span class="h-2 w-2 shrink-0 rounded-full" :class="zahtjev.status === 'prihvacen' ? 'bg-amber-400' : 'bg-green-500'"></span>
              <span v-if="zahtjev.status === 'prihvacen'" class="text-gray-700"><strong>{{ zahtjev.autorUsername }}</strong> je dobio tvoj kontakt i javit će ti se</span>
              <span v-else class="text-green-700">Riješeno, pomogao si.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- forma za novi zahtjev -->
    <div v-if="forma.prikazi" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="forma.prikazi = false">
      <form @submit.prevent="spremiZahtjev" novalidate class="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 class="mb-5 text-lg font-bold">{{ forma.id ? 'Uredi zahtjev' : 'Trebam pomoć' }}</h2>

        <label class="text-sm font-medium">Naslov</label>
        <input v-model="forma.naslov" maxlength="100" placeholder="npr. Ne razumijem integrale" class="input" />

        <label class="mt-4 block text-sm font-medium">Opis (neobavezno)</label>
        <textarea v-model="forma.opis" maxlength="300" rows="3" placeholder="Što točno trebaš i do kada..." class="input"></textarea>

        <p v-if="forma.greska" class="mt-3 text-sm text-red-600">{{ forma.greska }}</p>
        <div class="mt-5 flex gap-2">
          <button type="submit" :disabled="obrada" class="btn btn-primary">{{ forma.id ? 'Spremi' : 'Objavi' }}</button>
          <button type="button" @click="forma.prikazi = false" class="btn border border-gray-300 hover:bg-gray-50">Odustani</button>
        </div>
      </form>
    </div>
    <!-- prihvačanje tuđeg zahtjeva -->
    <div v-if="prihvat.zahtjev" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="prihvat.zahtjev = null">
      <form @submit.prevent="potvrdiPrihvat" novalidate class="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 class="text-lg font-bold">Pomoći ću, <span class="text-brown">{{ prihvat.zahtjev.autorUsername }}</span></h2>
        <p class="mt-1 mb-5 text-sm break-words text-gray-600">{{ prihvat.zahtjev.naslov }}</p>

        <label class="text-sm font-medium">Kontakt (neobavezno)</label>
        <input v-model="prihvat.kontakt" maxlength="100" placeholder="npr. Discord ime ili drugi email" class="input" />
        <p class="mt-2 text-xs text-gray-500">Ako ostaviš prazno, šalje se tvoj email. Kontakt vidi samo osoba kojoj pomažeš.</p>

        <p v-if="prihvat.greska" class="mt-3 text-sm text-red-600">{{ prihvat.greska }}</p>
        <div class="mt-5 flex gap-2">
          <button type="submit" :disabled="obrada" class="btn btn-primary">Prihvati</button>
          <button type="button" @click="prihvat.zahtjev = null" class="btn border border-gray-300 hover:bg-gray-50">Odustani</button>
        </div>
      </form>
    </div>
    <ConfirmDelete v-if="potvrda" :poruka="potvrda.poruka" :greska="greskaBrisanja" @potvrdi="potvrdiBrisanje" @odustani="potvrda = null" />
  </div>
</template>