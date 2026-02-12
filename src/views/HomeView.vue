<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="h-screen overflow-hidden grid grid-rows-6 gap-4">
    <!-- <RouterLink to="/MijnAfspraken"
      class="bg-gray-400 m-4 flex items-center justify-center text-2xl duration-300 hover:rounded-3xl hover:m-2 hover:bg-gray-600 hover:text-xl">
      Mijn Afspraken Zien
    </RouterLink> -->
    <div class="row-span-5 m-4">
      <!-- <p>csadw</p> -->
    </div>
    <RouterLink to="/AfspraakMaken"
      class="bg-gray-400 m-4 flex items-center justify-center text-2xl duration-300 hover:rounded-3xl hover:m-2 hover:bg-gray-600 hover:text-xl">
      Afspraak
      maken
    </RouterLink>
  </div>
</template>

<style scoped></style>
