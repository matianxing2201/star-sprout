import { createApp } from 'vue'

import App from './App.vue'
import { createAppPinia } from './app/plugins/pinia'
import { createAppRouter } from './app/router'

import './styles/index.css'

const app = createApp(App)

app.use(createAppPinia())
app.use(createAppRouter())

app.mount('#app')
