import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { debugAuthStorage } from './utils/authUtils.js'

// Make debug function globally accessible in console
window.debugAuth = debugAuthStorage
console.log('💡 Tip: Run "debugAuth()" in console to check auth storage')
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
