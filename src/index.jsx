import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import 'normalize.css/normalize.css'
import './styles/index.css'

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)