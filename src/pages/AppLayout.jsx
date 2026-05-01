import { useState, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Toast } from '../components/ui.jsx'
import Dashboard from './Dashboard.jsx'
import Decide from './Decide.jsx'
import Chat from './Chat.jsx'
import History from './History.jsx'
import Settings from './Settings.jsx'
import './AppLayout.css'

// Toast context
export const ToastCtx = createContext(null)
export function useToast() { return useContext(ToastCtx) }

const MODE_META = {
  balanced:{ emoji:'⚖️', label:'Balanced', color:'var(--gold)' },
  strict:  { emoji:'💀', label:'Strict',   color:'var(--red)' },
  zen:     { emoji:'🌿', label:'Zen',       color:'var(--green)' },
}

export default function AppLayout() {
  const [view, setView]     = useState('dashboard')
  const [sidebar, setSidebar] = useState(false)
  const [toasts, setToasts] = useState([])
  const profile = useStore(s => s.profile)
  const mode    = MODE_META[profile.aiPersonality] || MODE_META.balanced

  const toast = useCallback((message, type='info', icon) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type, icon }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'AI'

  // Role-aware nav items
  const isStudent = profile.role === 'student'
  const isPro     = profile.role === 'professional'

  const PAGE_LABELS = {
    dashboard: ['Dashboard', null],
    decide:    ['Help Me Decide', isStudent ? 'AI decision support & timetable builder' : isPro ? 'AI decision support & action planner' : 'AI decision & planning'],
    chat:      ['AI Assistant', 'Chat with your decision AI'],
    history:   ['History', 'All your AI decisions & plans'],
    settings:  ['Settings', 'Customize your experience'],
  }

  const [title, sub] = PAGE_LABELS[view] || ['', '']

  return (
    <ToastCtx.Provider value={toast}>
      <div className="app">
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebar && (
            <motion.div className="sb-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={()=>setSidebar(false)}/>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebar?'open':''}`}>
          <div className="sb-logo">
            <div className="sb-lmark">D</div>
            <span className="sb-ltext">Decimate<em>AI</em></span>
          </div>

          <nav className="sb-nav">
            <div className="sb-section">Menu</div>
            {[
              { id:'dashboard', icon:'🏠', label:'Dashboard' },
              { id:'decide',    icon:'⚡', label:'Help Me Decide', badge:'AI' },
              { id:'chat',      icon:'💬', label:'AI Chat' },
              { id:'history',   icon:'📋', label:'History' },
              { id:'settings',  icon:'⚙️', label:'Settings' },
            ].map(item => (
              <button key={item.id} className={`sb-item ${view===item.id?'active':''}`}
                onClick={()=>{ setView(item.id); setSidebar(false) }}>
                <span className="sb-icon">{item.icon}</span>
                <span className="sb-label">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
                {view===item.id && <motion.div className="sb-active-bar" layoutId="activeBar"/>}
              </button>
            ))}
          </nav>

          {/* Role badge */}
          <div className="sb-role-badge">
            <div className="sb-role-label">Your Role</div>
            <div className="sb-role-val">
              {profile.role==='student' ? '🎓 Student'
                : profile.role==='professional' ? '💼 Professional'
                : '⚡ Student & Professional'}
            </div>
          </div>

          <div className="sb-mode">
            <div className="sb-mode-lbl">AI Mode</div>
            <div className="sb-mode-val" style={{color:mode.color}}>{mode.emoji} {mode.label}</div>
          </div>

          <div className="sb-user" onClick={()=>{ setView('settings'); setSidebar(false) }}>
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{profile.name||'User'}</div>
              <div className="sb-user-role" style={{textTransform:'capitalize'}}>{profile.role||'—'}</div>
            </div>
            <span className="sb-chevron">›</span>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <header className="topbar">
            <div className="tb-left">
              <button className="mob-menu" onClick={()=>setSidebar(true)}>☰</button>
              <div>
                <div className="tb-title">{title}</div>
                {sub && <div className="tb-sub">{sub}</div>}
              </div>
            </div>
            <div className="tb-right">
              <div className="tb-mode-pill" style={{borderColor:mode.color,color:mode.color}}>
                <span className="tb-mode-dot" style={{background:mode.color}}/>
                {mode.emoji} {mode.label}
              </div>
              <button className="tb-icon-btn" onClick={()=>setView('decide')} title="Help Me Decide">⚡</button>
              <button className="tb-icon-btn" onClick={()=>setView('chat')} title="AI Chat">💬</button>
            </div>
          </header>

          <main className="page-body">
            <AnimatePresence mode="wait">
              <motion.div key={view}
                initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                transition={{duration:.22,ease:[.4,0,.2,1]}} style={{height:'100%'}}>
                {view==='dashboard' && <Dashboard onNavigate={setView}/>}
                {view==='decide'    && <Decide/>}
                {view==='chat'      && <Chat/>}
                {view==='history'   && <History/>}
                {view==='settings'  && <Settings/>}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <Toast toasts={toasts} remove={id=>setToasts(t=>t.filter(x=>x.id!==id))}/>
      </div>
    </ToastCtx.Provider>
  )
}
