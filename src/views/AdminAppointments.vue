<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-2xl font-bold mb-6">Admin – Afspraken</h1>

    <div v-if="loading">Laden…</div>

    <div v-else>
      <div v-for="(dayAppointments, date) in groupedAppointments" :key="date" class="mb-6">
        <h2 class="text-xl font-semibold mb-2">
          📅 {{ formatDate(date) }}
        </h2>

        <div v-for="a in dayAppointments" :key="a.id" class="bg-white p-4 rounded shadow mb-2 flex justify-between">
          <div>
            <p class="font-semibold">{{ a.time }} – {{ a.name }}</p>
            <p class="text-sm text-gray-600">
              {{ a.service }} · {{ a.phone }}
            </p>
            <p class="text-sm text-gray-500">
              {{ a.notes || 'Geen opmerkingen' }}
            </p>
          </div>
          <button @click="openEdit(a)" class="text-blue-600">✏️</button>
          <button @click="remove(a.id)" class="text-red-600 ml-2">🗑</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow w-96">

      <h2 class="text-xl font-bold mb-4">Afspraak Bewerken</h2>

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

      <div class="flex justify-end gap-2 mt-4">
        <button @click="showEditModal = false" class="bg-gray-300 px-3 py-1 rounded">
          Annuleren
        </button>

        <button @click="updateAppointment" class="bg-green-600 text-white px-3 py-1 rounded">
          Opslaan
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const appointments = ref([])
const loading = ref(true)
const showEditModal = ref(false)
const editForm = ref(null)

onMounted(async () => {
  const res = await fetch('http://localhost:8000/api/admin/appointments')
  appointments.value = await res.json()
  loading.value = false
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
  const res = await fetch('http://localhost:8000/api/admin/appointments')
  appointments.value = await res.json()
}

const remove = async (id) => {
  if (!confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) return

  try {
    await fetch(`http://localhost:8000/api/admin/appointments/${id}`, {
      method: 'DELETE'
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
        headers: { 'Content-Type': 'application/json' },
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
</script>
