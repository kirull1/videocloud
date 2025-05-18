import './styles/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { appConfig } from '../shared/config/app.config'
import { createLogger } from '../shared/lib/logger'
import { userStore } from '../features/auth/model/userStore'

const logger = createLogger('App')

logger.info(`Starting ${appConfig.name} v${appConfig.version} in ${appConfig.environment} mode`)

const app = createApp(App)

app.use(router)

app.mount('#app')

// Initialize user store if user is authenticated
userStore.init()

logger.info('Application mounted')
