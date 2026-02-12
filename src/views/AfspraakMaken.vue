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
          <input v-model="form.name" placeholder="Jouw naam" maxlength="30" class="w-full p-1">
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Telefoonnummer</label>
          <input v-model="form.phone" placeholder="06..." class="w-full p-1" maxlength="30" @input="formatPhoneNumber">
          <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Datum</label>
          <input v-model="form.date" type="date" class="w-full p-1" :min="minDate" :max="maxDate">
          <p v-if="errors.date" class="text-red-500 text-sm mt-1">{{ errors.date }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Tijd</label>
          <select v-model="form.time" class="w-full p-1">
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
          <p v-if="errors.time" class="text-red-500 text-sm mt-1">{{ errors.time }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Behandeling</label>
          <select v-model="form.service" class="w-full p-1">
            <option disabled value="">Kies een behandeling</option>
            <option value="haar">Haar</option>
            <option value="baard">Baard</option>
            <option value="haar_baard">Haar & Baard</option>
          </select>
          <p v-if="errors.service" class="text-red-500 text-sm mt-1">{{ errors.service }}</p>
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
      <h2 class="text-xl font-bold mb-4 text-center">Afspraak Succesvol gemaakt! ✅<br>
        <hr>Maak hier een Foto van!📸
        <hr>
      </h2>
      <p><strong>⚠️Belangerijk: </strong>Kan de afspraak niet doorgaan? Bel: ...</p><br>
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
import { ref, reactive } from 'vue'

const showModal = ref(false)
const submittedData = ref({})
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const minDate = tomorrow.toISOString().split('T')[0]

const form = reactive({
  name: '',
  phone: '',
  date: '',
  time: '',
  service: '',
  notes: ''
})
const errors = reactive({
  name: '',
  phone: '',
  date: '',
  time: '',
  service: ''
})

const phoneError = ref('')

// Formatteer het telefoonnummer tijdens het typen
function formatPhoneNumber(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value
  // Alleen cijfers en +
  value = value.replace(/[^\d+]/g, '')
  // Alleen eerste + behouden
  const plusCount = (value.match(/\+/g) || []).length
  if (plusCount > 1) {
    value = value.replace(/\+/g, '')
    value = '+' + value
  }
  form.phone = value
  phoneError.value = '' // reset foutmelding tijdens typen
}

// Simpele telefoonnummer-validatie
function isValidPhone(phone: string) {
  // Minimaal 6 cijfers, kan + aan het begin hebben
  return /^(\+)?\d{6,15}$/.test(phone.replace(/\s+/g, ''))
}

const formatDate = (dateString: string) => {
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
  const [year, month, day] = dateString.split('-')
  const monthName = months[parseInt(month) - 1]
  return `${day} ${monthName}`
}

const submitForm = async () => {
  const selectedDate = new Date(form.date)
  const min = new Date(minDate)
  const max = new Date(maxDate)

  if (selectedDate < min || selectedDate > max) {
    errors.date = 'Je kunt alleen binnen 2 weken een afspraak maken'
    valid = false
  }
  if (!form.date) {
    errors.date = 'Datum is verplicht'
    valid = false
  }
  // Reset alle errors
  errors.name = ''
  errors.phone = ''
  errors.date = ''
  errors.time = ''
  errors.service = ''
  phoneError.value = ''

  let valid = true

  if (!form.name.trim()) {
    errors.name = 'Naam is verplicht'
    valid = false
  }

  if (!form.phone.trim()) {
    errors.phone = 'Telefoonnummer is verplicht'
    valid = false
  } else if (!isValidPhone(form.phone)) {
    errors.phone = 'Voer een geldig telefoonnummer in'
    valid = false
  }

  if (!form.date) {
    errors.date = 'Datum is verplicht'
    valid = false
  }

  if (!form.time) {
    errors.time = 'Tijd is verplicht'
    valid = false
  }

  if (!form.service) {
    errors.service = 'Behandeling is verplicht'
    valid = false
  }

  if (!valid) return // stop submit als niet geldig

  try {
    const res = await fetch('http://localhost:8000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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

const maxDateObj = new Date()
maxDateObj.setDate(maxDateObj.getDate() + 14)

const maxDate = maxDateObj.toISOString().split('T')[0]
</script>

<style>
@media (max-width: 768px) {
  .from {
    width: 90% !important;
  }
}
</style>
