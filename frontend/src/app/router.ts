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
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('@/pages/auth/forgot-password.vue'),
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      component: () => import('@/pages/auth/reset-password.vue'),
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
    {
      path: '/videos/processing',
      name: 'video-processing',
      component: () => import('@/pages/videos/processing.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/search/index.vue')
    },
    // Channel routes
    {
      path: '/channel',
      name: 'channels',
      component: () => import('@/pages/channel/index.vue')
    },
    {
      path: '/channel/create',
      name: 'channel-create',
      component: () => import('@/pages/channel/create.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/channel/:id',
      name: 'channel-detail',
      component: () => import('@/pages/channel/detail.vue')
    }
  ],
})

// Navigation guard to check authentication for protected routes
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // This route requires auth, check if logged in
    if (!authApi.isAuthenticated()) {
      // Not logged in, redirect to login page
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Check if the authentication is valid
    try {
      const isValid = await authApi.checkAuthValidity()
      
      if (!isValid) {
        // Authentication is invalid, redirect to login page
        next({
          path: '/auth/login',
          query: { redirect: to.fullPath }
        })
        return
      }
      
      // Authentication is valid, proceed to the route
      next()
    } catch (error) {
      console.error('Error checking authentication validity:', error)
      // In case of an error, redirect to login page
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    // Route doesn't require authentication, proceed
    next()
  }
})

export default router
