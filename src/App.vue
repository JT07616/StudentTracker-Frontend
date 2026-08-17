<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="flex min-h-screen bg-[#fffefc]">
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>