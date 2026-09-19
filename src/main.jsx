import React from 'react'
import ReactDOM from 'react-dom/client'
import LandingPage from './App.jsx'
import WaitlistPage from './WaitlistPage.jsx'
import BoostPage from './BoostPage.jsx'
import './design-system/tokens.css'
import './design-system/primitives.css'
import './redesign.css'
import './waitlist.css'
import './boost.css'

const currentPath = window.location.pathname.replace(/\/$/, '')
const CurrentPage = currentPath.endsWith('/waitlist/boost') ? BoostPage : currentPath.endsWith('/waitlist') ? WaitlistPage : LandingPage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrentPage />
  </React.StrictMode>,
)
