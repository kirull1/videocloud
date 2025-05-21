import { createRouter, createWebHistory } from 'vue-router'
import { authApi } from '@/features/auth/api/authApi'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home'),
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/pages/auth/login.vue'),
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/pages/auth/register.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/profile/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/videos/upload',
      name: 'video-upload',
      component: () => import('@/pages/videos/upload.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/videos/:id',
      name: 'video',
      component: () => import('@/pages/videos/[id].vue')
    },
    {
      path: '/videos/watch',
      name: 'video-watch',
      component: () => import('@/pages/videos/watch.vue')
    },
  ],
})

// Navigation guard to check authentication for protected routes
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // This route requires auth, check if logged in
    if (!authApi.isAuthenticated()) {
      // Not logged in, redirect to login page
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
