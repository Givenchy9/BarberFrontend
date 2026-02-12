<template>
  <div class="page h-screen bg-gray-100 p-8 flex flex-col overflow-hidden">
    <h1 class="text-2xl font-bold mb-6 text-center">Afspraken</h1>
    <button @click="showBottomPanel = true" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">
      Gesloten Dagen
    </button>

    <div v-if="authError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ authError }}
    </div>

    <div v-if="loading" class="text-center">Laden…</div>

    <div v-else-if="!authError" class="flex-1 overflow-y-auto">

      <div v-for="(dayAppointments, date) in groupedAppointments" :key="date" class="mb-6">

        <!-- Klikbare dag -->
        <h2 @click="toggleDay(date)" class="text-xl text-center font-semibold mb-2 cursor-pointer"
          :class="{ 'text-green-600 underline': isToday(date) }">
          {{ formatDate(date) }}
        </h2>

        <!-- Afspraken dropdown -->
        <div v-if="openDays[date]">

          <div v-for="a in dayAppointments" :key="a.id" class="bg-white p-4 rounded shadow mb-2">
            <p class="font-semibold text-center">{{ a.time }}</p>
            <p class="text-sm text-gray-600">Naam: <strong>{{ a.name }}</strong></p>
            <p class="text-sm text-gray-600">Telefoonnummer: <strong>{{ a.phone }}</strong></p>
            <p class="text-sm text-gray-600">Service type: <strong>{{ a.service }}</strong></p>
            <hr>
            <p class="text-sm text-center text-gray-500 bg-gray-200">
              <strong>Opmerkingen:</strong><br>
              {{ a.notes || 'Geen opmerkingen' }}
            </p>
            <br>

            <div class="flex gap-2">
              <button @click="openEdit(a)"
                class="text-green-600 w-full border-2 border-green-600 hover:bg-green-500 hover:text-white">
                Edit
              </button>

              <button @click="remove(a.id)"
                class="text-red-600 w-full border-2 border-red-600 hover:bg-red-500 hover:text-white">
                Delete
              </button>
            </div>

          </div>

        </div>

        <hr>
      </div>

    </div>
  </div>
  <div v-if="showEditModal" class="p-8 fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow w-96">

      <h2 class="text-xl font-bold mb-4 text-center">Afspraak Bewerken</h2>

      <div class="grid gap-3">
        <input type="date" v-model="editForm.date" class="border p-2" />

        <select v-model="editForm.time" class="border p-2">
          <option v-for="t in ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']"
            :key="t" :value="t">
            {{ t }}
          </option>
        </select>

        <select v-model="editForm.service" class="border p-2">
          <option value="haar">Haar</option>
          <option value="baard">Baard</option>
          <option value="haar_baard">Haar & Baard</option>
        </select>

        <textarea v-model="editForm.notes" class="border p-2"></textarea>
      </div>

      <div class="flex gap-2 mt-4">
        <button @click="showEditModal = false" class="bg-gray-300 px-3 py-1 rounded">
          Annuleren
        </button>

        <button @click="updateAppointment" class="bg-green-600 text-white px-3 py-1 rounded">
          Opslaan
        </button>
      </div>

    </div>
  </div>

  <!-- Overlay -->
  <div v-if="showBottomPanel" class="fixed inset-0 bg-black/40 z-40" @click="showBottomPanel = false"></div>

  <!-- Bottom Slide Panel -->
  <div
    class="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300"
    :class="showBottomPanel ? 'translate-y-0' : 'translate-y-full'">
    <div class="p-6 max-h-[70vh] overflow-y-auto">

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-center">Gesloten Dagen</h2>
        <button @click="showBottomPanel = false" class="text-gray-500">✕</button>
      </div>

      <div class="flex gap-2 mb-4">
        <input type="date" v-model="newClosedDate" class="border p-2 flex-1" />
        <button @click="closeDay" class="bg-red-600 text-white px-3 py-1 rounded">
          Sluit
        </button>
      </div>

      <div class="grid gap-2">
        <div v-for="day in closedDays" :key="day.id" class="flex justify-between items-center bg-gray-100 p-2 rounded">
          <span>{{ day.date }}</span>
          <button @click="openDay(day.date)" class="bg-green-600 text-white px-2 py-1 rounded">
            Open
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .page {
    width: 90% !important;

  }
}
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const showBottomPanel = ref(false)
const route = useRoute()
const router = useRouter()

let ADMIN_TOKEN = localStorage.getItem('adminToken') || ''

const appointments = ref([])
const loading = ref(true)
const showEditModal = ref(false)
const editForm = ref(null)
const closedDays = ref([])
const newClosedDate = ref('')
const authError = ref('')
const openDays = ref({})

const toggleDay = (date) => {
  openDays.value[date] = !openDays.value[date]
}
// Check token in URL
if (route.query.token) {
  ADMIN_TOKEN = route.query.token
  localStorage.setItem('adminToken', ADMIN_TOKEN)
  // Remove token from URL
  router.replace('/admin')
}

onMounted(async () => {
  if (!ADMIN_TOKEN) {
    authError.value = 'Geen toegang!'
    loading.value = false
    return
  }

  try {
    const res = await fetch('http://localhost:8000/api/admin/appointments', {
      headers: {
        'X-ADMIN-TOKEN': ADMIN_TOKEN
      }
    })

    if (!res.ok) {
      authError.value = 'Token ongeldig!'
      localStorage.removeItem('adminToken')
      console.error(`Error ${res.status}:`, await res.text())
      return
    }

    appointments.value = await res.json()
    await fetchClosedDays()
  } catch (err) {
    authError.value = 'Connection error!'
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
})

const groupedAppointments = computed(() => {
  const groups = {}

  for (const a of appointments.value) {
    if (!groups[a.date]) {
      groups[a.date] = []
    }
    groups[a.date].push(a)
  }

  return groups
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const fetchAppointments = async () => {
  const res = await fetch('http://localhost:8000/api/admin/appointments', {
    headers: {
      'X-ADMIN-TOKEN': ADMIN_TOKEN
    }
  })
  appointments.value = await res.json()
}

const remove = async (id) => {
  if (!confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) return

  try {
    await fetch(`http://localhost:8000/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'X-ADMIN-TOKEN': ADMIN_TOKEN
      }
    })

    // Herlaad afspraken
    await fetchAppointments()
  } catch (err) {
    alert('Verwijderen mislukt')
  }
}

const updateAppointment = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/api/admin/appointments/${editForm.value.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-ADMIN-TOKEN': ADMIN_TOKEN
        },
        body: JSON.stringify(editForm.value)
      }
    )

    if (!res.ok) {
      const data = await res.json()
      alert(data.message)
      return
    }

    showEditModal.value = false
    await fetchAppointments()

  } catch (err) {
    alert('Opslaan mislukt')
  }
}

const openEdit = (appointment) => {
  editForm.value = { ...appointment }
  showEditModal.value = true
}
const fetchClosedDays = async () => {
  const res = await fetch('http://localhost:8000/api/admin/closed-days', {
    headers: {
      'X-ADMIN-TOKEN': ADMIN_TOKEN
    }
  })
  closedDays.value = await res.json()
}
const closeDay = async () => {
  const res = await fetch('http://localhost:8000/api/admin/closed-days', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ADMIN-TOKEN': ADMIN_TOKEN
    },
    body: JSON.stringify({ date: newClosedDate.value })
  })

  if (!res.ok) {
    const data = await res.json()
    alert(data.message)
    return
  }

  newClosedDate.value = ''
  await fetchClosedDays()
}
const openDay = async (date) => {
  await fetch(`http://localhost:8000/api/admin/closed-days/${date}`, {
    method: 'DELETE',
    headers: {
      'X-ADMIN-TOKEN': ADMIN_TOKEN
    }
  })

  await fetchClosedDays()
}

const isToday = (date) => {
  const today = new Date()
  const d = new Date(date)

  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}
watch(groupedAppointments, (groups) => {
  for (const date in groups) {
    if (isToday(date)) {
      openDays.value[date] = true
    }
  }
})
</script>
