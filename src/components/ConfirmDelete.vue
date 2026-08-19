<script setup>
defineProps({
  poruka: { type: String, required: true },
  greska: { type: String, default: '' },
})
defineEmits(['potvrdi', 'odustani'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="$emit('odustani')">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
      <p class="font-medium text-gray-900">{{ poruka }}</p>
      <p class="mt-1 text-sm text-gray-700">Ova radnja se ne može poništiti.</p>
      <p v-if="greska" class="mt-2 text-sm text-red-600">{{ greska }}</p>
      <div class="mt-5 flex  justify-center gap-2">
        <button @click="$emit('potvrdi')" class="btn bg-red-600 text-white hover:bg-red-700">Obriši</button>
        <button @click="$emit('odustani')" class="btn border border-gray-300 hover:bg-gray-50">Odustani</button>
      </div>
    </div>
  </div>
</template>