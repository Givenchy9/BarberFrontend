import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/AfspraakMaken',
      name: 'AfspraakMaken',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AfspraakMaken.vue'),
    },
    {
      path: '/MijnAfspraken',
      name: 'MijnAfspraken',
      component: () => import('../views/MijnAfspraken.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/views/AdminAppointments.vue')
    }
  ],
})

export default router
