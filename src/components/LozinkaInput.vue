<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

defineProps({
  placeholder: { type: String, default: '' },
})
const lozinka = defineModel()
const prikazi = ref(false)
</script>

<template>
  <div class="relative mt-1">
    <input v-model="lozinka" :type="prikazi ? 'text' : 'password'" :placeholder="placeholder" class="input mt-0! pr-10!" />
    <button type="button" @click="prikazi = !prikazi" class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeOff v-if="prikazi" :size="16" /><Eye v-else :size="16" /></button>
  </div>
</template>