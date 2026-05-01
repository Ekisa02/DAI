import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import './ui.css'

export function Btn({ children, variant='gold', size='md', className, loading, disabled, ...p }) {
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale:1.02, y:-1 } : {}}
      whileTap={!disabled && !loading ? { scale:0.97 } : {}}
      className={clsx('ui-btn', `ui-btn-${variant}`, `ui-btn-${size}`, className)}
      disabled={disabled || loading}
      {...p}
    >
      {loading ? <span className="ui-spin"/> : children}
    </motion.button>
  )
}

export function Card({ children, className, glow, onClick, ...p }) {
  return (
    <motion.div
      className={clsx('ui-card', glow && 'ui-card-glow', onClick && 'ui-card-click', className)}
      whileHover={onClick ? { y:-3 } : {}}
      onClick={onClick} {...p}
    >{children}</motion.div>
  )
}

export function Chip({ children, selected, onClick, color='default' }) {
  return (
    <motion.button
      whileHover={{ scale:1.03 }} whileTap={{ scale:0.96 }}
      className={clsx('ui-chip', selected && 'ui-chip-on', `ui-chip-${color}`)}
      onClick={onClick}
    >{children}</motion.button>
  )
}

export function Input({ label, error, ...p }) {
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      <input className={clsx('ui-input', error && 'ui-input-err')} {...p}/>
      {error && <span className="ui-err">{error}</span>}
    </div>
  )
}

export function Textarea({ label, ...p }) {
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      <textarea className="ui-input ui-textarea" {...p}/>
    </div>
  )
}

export function Select({ label, children, ...p }) {
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      <select className="ui-input" {...p}>{children}</select>
    </div>
  )
}

export function Toggle({ checked, onChange }) {
  return (
    <div className={clsx('ui-toggle', checked && 'ui-toggle-on')} onClick={() => onChange(!checked)}>
      <div className="ui-toggle-thumb"/>
    </div>
  )
}

export function Spinner({ size=24, color }) {
  return <div className="ui-spin" style={{ width:size, height:size, borderTopColor: color || 'var(--gold)' }}/>
}

export function Badge({ children, color='gold' }) {
  return <span className={clsx('ui-badge', `ui-badge-${color}`)}>{children}</span>
}

export function Modal({ open, onClose, title, children, wide }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          onClick={e => e.target===e.currentTarget && onClose()}>
          <motion.div className={clsx('modal-box', wide && 'modal-wide')}
            initial={{opacity:0,scale:0.94,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94,y:10}}>
            <div className="modal-header">
              <div className="modal-title">{title}</div>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Toast({ toasts, remove }) {
  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} className={clsx('toast', `toast-${t.type||'info'}`)}
            initial={{x:100,opacity:0}} animate={{x:0,opacity:1}} exit={{x:100,opacity:0}}>
            <span>{t.icon||'💬'}</span> {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function Progress({ value, color='gold', label }) {
  return (
    <div className="ui-progress-wrap">
      {label && <div className="ui-progress-label">{label}</div>}
      <div className="ui-progress-track">
        <motion.div className={clsx('ui-progress-fill', `ui-progress-${color}`)}
          initial={{width:0}} animate={{width:`${Math.min(value,100)}%`}} transition={{duration:0.8}}/>
      </div>
    </div>
  )
}

// AI response bubble formatter
export function AiText({ text }) {
  if (!text) return null
  return (
    <div className="ai-text">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('BEST CHOICE:')) return <div key={i} className="ai-best-choice">{line.replace('BEST CHOICE:','').trim()}</div>
        if (line.startsWith('WHY:')) return <div key={i} className="ai-why"><strong>Why:</strong> {line.replace('WHY:','').trim()}</div>
        if (line.startsWith('TRADE-OFF:')) return <div key={i} className="ai-tradeoff"><strong>Trade-off:</strong> {line.replace('TRADE-OFF:','').trim()}</div>
        if (line.startsWith('TIMETABLE TITLE:') || line.startsWith('PLAN TITLE:')) return <div key={i} className="ai-plan-title">{line.split(':')[1]?.trim()}</div>
        if (line.startsWith('TIME BLOCKS:') || line.startsWith('PRIORITY TASKS:') || line.startsWith('EXECUTION SCHEDULE:') || line.startsWith('STUDY TIPS:') || line.startsWith('KEY MILESTONES:') || line.startsWith('MORNING') || line.startsWith('AFTERNOON') || line.startsWith('EVENING') || line.startsWith('BALANCE TIPS:')) return <div key={i} className="ai-section-head">{line}</div>
        if (line.includes('|')) {
          const parts = line.split('|').map(p => p.trim())
          return (
            <div key={i} className="ai-table-row">
              {parts.map((p, j) => <span key={j} className={j===0 ? 'ai-time' : j===1 ? 'ai-task' : 'ai-note'}>{p}</span>)}
            </div>
          )
        }
        if (line.startsWith('-') || line.startsWith('•')) return <div key={i} className="ai-bullet">{line}</div>
        if (line.trim() === '') return <div key={i} className="ai-spacer"/>
        return <div key={i} className="ai-line">{line}</div>
      })}
    </div>
  )
}
