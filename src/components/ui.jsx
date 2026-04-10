import { motion } from 'framer-motion'
import clsx from 'clsx'
import './ui.css'

/* ── Button ─────────────────────────────────────────── */
export function Button({ children, variant = 'gold', size = 'md', className, loading, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </motion.button>
  )
}

/* ── Badge ──────────────────────────────────────────── */
export function Badge({ children, color = 'gold', className }) {
  return <span className={clsx('badge', `badge-${color}`, className)}>{children}</span>
}

/* ── Card ───────────────────────────────────────────── */
export function Card({ children, className, glow, onClick, ...props }) {
  return (
    <motion.div
      className={clsx('card', glow && 'card-glow', onClick && 'card-clickable', className)}
      whileHover={onClick ? { y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ── Chip ───────────────────────────────────────────── */
export function Chip({ children, selected, onClick, color = 'default' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={clsx('chip', selected && 'chip-selected', `chip-${color}`)}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

/* ── Input ──────────────────────────────────────────── */
export function Input({ label, ...props }) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}</label>}
      <input className="input-field" {...props} />
    </div>
  )
}

/* ── Textarea ───────────────────────────────────────── */
export function Textarea({ label, ...props }) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}</label>}
      <textarea className="input-field input-textarea" {...props} />
    </div>
  )
}

/* ── Toggle ─────────────────────────────────────────── */
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle-wrap">
      {label && <span className="toggle-label">{label}</span>}
      <div className={clsx('toggle', checked && 'toggle-on')} onClick={() => onChange(!checked)}>
        <div className="toggle-thumb" />
      </div>
    </label>
  )
}

/* ── Spinner ────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />
}

/* ── Stat Card ──────────────────────────────────────── */
export function StatCard({ icon, value, label, change, color = 'gold' }) {
  return (
    <Card className={clsx('stat-card', `stat-card-${color}`)}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={clsx('stat-change', change.startsWith('+') ? 'change-up' : 'change-down')}>
          {change}
        </div>
      )}
    </Card>
  )
}

/* ── Progress Bar ───────────────────────────────────── */
export function Progress({ value, color = 'gold', label }) {
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <motion.div
          className={clsx('progress-fill', `progress-${color}`)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* ── Toast ──────────────────────────────────────────── */
export function Toast({ message, icon = '✅', onDone }) {
  return (
    <motion.div
      className="toast"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      onAnimationComplete={() => setTimeout(onDone, 2800)}
    >
      <span>{icon}</span> {message}
    </motion.div>
  )
}
