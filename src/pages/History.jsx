import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Button, Badge } from '../components/ui.jsx'
import './History.css'

const FILTERS = ['All', 'Study', 'Work', 'Health', 'Mixed']

const TYPE_CONFIG = {
  study:  { icon: '📚', color: 'var(--cyan)',   badge: 'cyan'   },
  work:   { icon: '💼', color: 'var(--orange)', badge: 'orange' },
  health: { icon: '💪', color: 'var(--green)',  badge: 'green'  },
  mixed:  { icon: '⚡', color: 'var(--gold)',   badge: 'gold'   },
}

// Demo plans shown when store is empty
const DEMO_PLANS = [
  {
    title: 'Study Plan — Data Structures', type: 'study',
    blocks: [{},{},{},{}],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    title: 'Morning Wellness Routine', type: 'health',
    blocks: [{},{},{}],
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    title: 'Deep Work — Decimate AI', type: 'work',
    blocks: [{},{},{},{},{}],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: 'Full Day Plan', type: 'mixed',
    blocks: [{},{},{},{},{},{}],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
]

export default function History() {
  const plans = useStore(s => s.plans)
  const [filter, setFilter] = useState('All')

  const allPlans = plans.length > 0 ? plans : DEMO_PLANS
  const filtered = filter === 'All'
    ? allPlans
    : allPlans.filter(p => p.type?.toLowerCase() === filter.toLowerCase())

  return (
    <div className="history-page">
      <div className="history-top">
        <div>
          <h2 className="history-title">Decision History</h2>
          <p className="history-sub">{allPlans.length} AI-generated plan{allPlans.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="history-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`hf-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="history-empty">
          <div className="he-icon">📋</div>
          <div className="he-title">No plans found</div>
          <div className="he-sub">No {filter.toLowerCase()} plans yet. Create one with Help Me Decide!</div>
        </div>
      ) : (
        <div className="history-grid">
          {filtered.map((plan, i) => {
            const cfg = TYPE_CONFIG[plan.type] || TYPE_CONFIG.mixed
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="history-card"
              >
                <div className="hc-icon" style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}30` }}>
                  {cfg.icon}
                </div>
                <div className="hc-body">
                  <div className="hc-title">{plan.title}</div>
                  <div className="hc-meta">
                    {plan.blocks?.length || 0} time blocks ·{' '}
                    {new Date(plan.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                  </div>
                  <div className="hc-time">
                    {formatRelative(plan.createdAt)}
                  </div>
                </div>
                <Badge color={cfg.badge}>{plan.type || 'plan'}</Badge>
              </motion.div>
            )
          })}
        </div>
      )}

      {plans.length === 0 && (
        <div className="demo-note">
          📌 These are demo plans. Create real plans using the <strong>Help Me Decide</strong> page.
        </div>
      )}
    </div>
  )
}

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
