import React from 'react'
import ReactDOM from 'react-dom/client'
import LandingPage from './App.jsx'
import WaitlistPage from './WaitlistPage.jsx'
import './design-system/tokens.css'
import './design-system/primitives.css'
import './redesign.css'
import './waitlist.css'

const CurrentPage = window.location.pathname.replace(/\/$/, '') === '/waitlist' ? WaitlistPage : LandingPage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrentPage />
  </React.StrictMode>,
)
