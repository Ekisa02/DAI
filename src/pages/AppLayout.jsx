import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Dashboard from './Dashboard.jsx'
import Decide from './Decide.jsx'
import History from './History.jsx'
import Settings from './Settings.jsx'
import Chat from './Chat.jsx'
import './AppLayout.css'

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'decide',    icon: '⚡', label: 'Help Me Decide', badge: 'AI' },
  { id: 'chat',      icon: '💬', label: 'AI Chat' },
  { id: 'history',   icon: '📋', label: 'History' },
  { id: 'settings',  icon: '⚙️', label: 'Settings' },
]

const PAGE_TITLES = {
  dashboard: ['Dashboard', null],
  decide:    ['Help Me Decide', 'Let AI build your perfect plan'],
  chat:      ['AI Assistant', 'Chat with your decision intelligence AI'],
  history:   ['Decision History', 'All your AI-assisted plans'],
  settings:  ['Settings', 'Customize your experience'],
}

const MODE_META = {
  balanced: { emoji: '⚖️', label: 'Balanced', color: 'var(--gold)' },
  strict:   { emoji: '💀', label: 'Strict',   color: 'var(--red)' },
  zen:      { emoji: '🌿', label: 'Zen',      color: 'var(--green)' },
}

export default function AppLayout() {
  const [view, setView]         = useState('dashboard')
  const [sidebarOpen, setSidebar] = useState(false)
  const profile = useStore(s => s.profile)
  const stats   = useStore(s => s.stats)
  const mode    = MODE_META[profile.aiPersonality] || MODE_META.balanced
  const [title, sub] = PAGE_TITLES[view]

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'AI'

  return (
    <div className="app-layout">
      {/* Orbs */}
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">D</div>
          <span className="logo-text">Decimate<span>AI</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-lbl">Menu</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => { setView(item.id); setSidebar(false) }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {view === item.id && (
                <motion.div className="nav-active-bar" layoutId="activeBar" />
              )}
            </button>
          ))}
        </nav>

        {/* Mode indicator */}
        <div className="sidebar-mode">
          <div className="sidebar-mode-label">AI Mode</div>
          <div className="sidebar-mode-val" style={{ color: mode.color }}>
            {mode.emoji} {mode.label} Mode
          </div>
        </div>

        <div className="sidebar-user" onClick={() => { setView('settings'); setSidebar(false) }}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{profile.name || 'User'}</div>
            <div className="user-role">{profile.role || 'Decimate AI'}</div>
          </div>
          <div className="user-chevron">›</div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebar(true)}>☰</button>
            <div>
              <div className="topbar-title">{title}</div>
              {sub && <div className="topbar-sub">{sub}</div>}
            </div>
          </div>
          <div className="topbar-right">
            <div className="mode-pill" style={{ borderColor: mode.color, color: mode.color }}>
              <span className="mode-dot" style={{ background: mode.color }} />
              {mode.emoji} {mode.label}
            </div>
            <button className="icon-btn" onClick={() => setView('decide')} title="New decision">⚡</button>
            <button className="icon-btn" onClick={() => setView('chat')} title="AI Chat">💬</button>
          </div>
        </header>

        {/* Page */}
        <main className="page-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4,0,0.2,1] }}
              style={{ height: '100%' }}
            >
              {view === 'dashboard' && <Dashboard onNavigate={setView} />}
              {view === 'decide'    && <Decide />}
              {view === 'chat'      && <Chat />}
              {view === 'history'   && <History />}
              {view === 'settings'  && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
