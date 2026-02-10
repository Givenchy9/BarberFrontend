<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="h-screen grid grid-rows-2">
    <RouterLink to="/AfspraakMaken"
      class="bg-gray-400 m-4 flex items-center justify-center text-2xl duration-300 hover:rounded-3xl hover:m-12 hover:bg-gray-600 hover:text-xl">
      Afspraak
      maken
    </RouterLink>
    <RouterLink to="/MijnAfspraken"
      class="bg-gray-400 m-4 flex items-center justify-center text-2xl duration-300 hover:rounded-3xl hover:m-12 hover:bg-gray-600 hover:text-xl">
      Mijn Afspraken Zien
    </RouterLink>
  </div>
</template>

<style scoped></style>
