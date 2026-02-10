<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <RouterLink to="/" class="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition">
      &larr; Terug
    </RouterLink>
    <h1 class="absolute top-4 right-4">Afspraak Maken</h1>
    <div class="from flex flex-col w-1/2 h-5/6">
      <div class="grid gap-8 overflow-auto">
        <div>
          <label class="block text-sm font-medium mb-1">Naam</label>
          <input v-model="form.name" placeholder="Jouw naam" class="w-full p-1">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Telefoonnummer</label>
          <input v-model="form.phone" placeholder="06..." class="w-full p-1">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Datum</label>
          <input v-model="form.date" type="date" class="w-full p-1" :min="minDate" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Tijd</label>
          <select v-model="form.time" class="w-full p-1" required>
            <option value="" disabled>Kies een tijd</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Behandeling</label>
          <select v-model="form.service" class="w-full p-1" required>
            <option disabled value="">Kies een behandeling</option>
            <option value="haar">Haar</option>
            <option value="baard">Baard</option>
            <option value="haar_baard">Haar & Baard</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Opmerkingen</label>
          <textarea v-model="form.notes" rows="3" placeholder="Extra wensen..." class="w-full p-1"></textarea>
        </div>
      </div>
      <button type="submit" @click="submitForm"
        class="w-full bg-black text-white py-3 mt-8 rounded-lg font-semibold hover:bg-gray-800 transition flex-shrink-0">
        Afspraak maken
      </button>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-gray-100 shadow-lg p-6 max-w-sm w-5/6">
      <h2 class="text-xl font-bold mb-4 text-center">Belangerijk!</h2>
      <p>Kan de afspraak niet doorgaan? Bel: ...</p><br>
      <!-- <p><strong>Naam:</strong> {{ submittedData.name }}</p> -->
      <!-- <p><strong>Telefoon:</strong> {{ submittedData.phone }}</p> -->
      <p><strong>Datum:</strong> {{ formatDate(submittedData.date) }}</p>
      <p><strong>Tijd:</strong> {{ submittedData.time }}</p>
      <p><strong>Behandeling:</strong> {{ submittedData.service }}</p>
      <p><strong>Opmerkingen:</strong> {{ submittedData.notes || 'Geen' }}</p>

      <button @click="showModal = false"
        class="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
        Sluiten
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const submittedData = ref({})
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const minDate = tomorrow.toISOString().split('T')[0]

const form = ref({
  name: '',
  phone: '',
  date: '',
  time: '',
  service: '',
  notes: ''
})

const formatDate = (dateString: string) => {
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
  const [year, month, day] = dateString.split('-')
  const monthName = months[parseInt(month) - 1]
  return `${day} ${monthName}`
}

const submitForm = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.message)
      return
    }

    submittedData.value = await res.json()
    showModal.value = true
  } catch (e) {
    alert('Er ging iets mis')
  }
}
</script>

<style>
@media (max-width: 768px) {
  .from {
    width: 90% !important;
  }
}
</style>
