<script setup>
const koraci = [
  { broj: 1, naslov: 'Dodaj akademsku godinu', opis: 'Na stranici Kolegiji. Svaka godina ima dva semestra.' },
  { broj: 2, naslov: 'Upiši kolegije u semestre', opis: 'S ECTS bodovima, ocjenom i ispitnim rokom kad ih budeš imao.' },
  { broj: 3, naslov: 'Zapiši obveze i rokove', opis: 'Seminari, kolokviji, zadaće. Grupiraju se po hitnosti.' },
  { broj: 4, naslov: 'Pokreni timer kad kreneš učiti', opis: 'Vrijeme se zbraja po kolegijima i ulazi na tjednu ljestvicu.' },
]
</script>

<template>
  <div class="mx-auto max-w-2xl p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">O aplikaciji</h1>
    </div>
    <div class="mb-4 rounded-xl border border-gray-200 bg-white">
      <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Kako početi</p>

      <div v-for="korak in koraci" :key="korak.broj" class="flex gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brown/15 text-xs font-bold text-brown">{{ korak.broj }}</span>
        <div>
          <p class="text-gray-900">{{ korak.naslov }}</p>
          <p class="text-sm text-gray-600">{{ korak.opis }}</p>
        </div>
      </div>
    </div>
    <div class="mb-4 rounded-xl border border-gray-200 bg-white">
      <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Što gdje nađeš</p>
      <div class="space-y-1.5 px-4 py-3 text-sm text-gray-700">
        <p><strong class="font-medium text-gray-900">Pregled</strong> - prosjek, ECTS, rokovi ovog tjedna i koliko si učio.</p>
        <p><strong class="font-medium text-gray-900">Kolegiji</strong> - godine, semestri, ocjene i ispitni rokovi.</p>
        <p><strong class="font-medium text-gray-900">Obveze</strong> - zadaci s rokovima, poredani po hitnosti.</p>
        <p><strong class="font-medium text-gray-900">Učenje</strong> - timer, tvoje sesije i tjedna ljestvica.</p>
        <p><strong class="font-medium text-gray-900">Pomoć</strong> - zatraži pomoć od kolega ili pomogni nekome.</p>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white">
      <p class="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Privatnost</p>
      <div class="space-y-1.5 px-4 py-3 text-sm text-gray-700">
        <p>Kolegiji, ocjene i obveze vidiš samo ti.</p>
        <p>Na ljestvici se dijeli samo vrijeme učenja, nikad ocjene. Možeš se sakriti u Profilu.</p>
        <p>Kod Pomoći kontakt daje onaj tko nudi pomoć, i vidi ga samo osoba koja je pomoć tražila.</p>
      </div>
    </div>

    <RouterLink to="/" class="btn btn-primary mt-6 inline-block">Kreni</RouterLink>
  </div>
</template>
