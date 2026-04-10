import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useAI } from '../hooks/useAI'
import { Button, Chip, Spinner } from '../components/ui.jsx'
import './Decide.css'

const STUDENT_TASKS = {
  'Academics & Growth': ['Study / Learn', 'Revise Notes', 'Homework', 'Group Project', 'Coding', 'Read a Book', 'Online Course', 'Research Paper'],
  'Health & Wellness':  ['Gym', 'Power Nap', 'Meditate', 'Morning Run', 'Meal Prep', 'Sleep Schedule'],
}
const PRO_TASKS = {
  'Deep Work':         ['Focus Block', 'Client Work', 'Strategy', 'Analysis', 'Writing'],
  'Collaboration':     ['Meetings', 'Email Triage', 'Networking', 'Presentations'],
  'Personal Growth':   ['Online Course', 'Reading', 'Gym', 'Meditate', 'Planning'],
}

const BLOCK_COLORS = ['#F5A623','#00D4FF','#00E5A0','#FF7043','#A78BFA','#F472B6']

export default function Decide() {
  const [mode, setMode]       = useState('student')
  const [selected, setSelected] = useState([])
  const [plan, setPlan]       = useState(null)
  const { generateSchedule, loading } = useAI()
  const addPlan = useStore(s => s.addPlan)
  const profile = useStore(s => s.profile)
  const [saved, setSaved]     = useState(false)

  const tasks = mode === 'student' ? STUDENT_TASKS : PRO_TASKS

  const toggle = (task) =>
    setSelected(s => s.includes(task) ? s.filter(t => t !== task) : [...s, task])

  const generate = async () => {
    if (selected.length === 0) return
    setPlan(null)
    setSaved(false)
    const { plan: generated, text } = await generateSchedule(selected, mode)
    if (generated) {
      // assign colors
      const colored = generated.blocks?.map((b, i) => ({
        ...b, color: b.color || BLOCK_COLORS[i % BLOCK_COLORS.length]
      }))
      setPlan({ ...generated, blocks: colored })
    } else {
      // fallback plan
      setPlan(buildFallback(selected, mode, profile.aiPersonality))
    }
  }

  const save = () => {
    if (!plan) return
    addPlan({ ...plan, createdAt: new Date().toISOString() })
    setSaved(true)
  }

  return (
    <div className="decide-page">
      <div className="decide-left">
        {/* Mode toggle */}
        <div className="mode-toggle">
          <button className={`mt-btn ${mode==='student'?'active':''}`} onClick={() => { setMode('student'); setSelected([]) }}>
            🎓 Student
          </button>
          <button className={`mt-btn ${mode==='professional'?'active':''}`} onClick={() => { setMode('professional'); setSelected([]) }}>
            💼 Professional
          </button>
        </div>

        {/* Task sections */}
        <div className="task-sections">
          {Object.entries(tasks).map(([section, items]) => (
            <div key={section} className="task-section">
              <div className="task-section-label">{section}</div>
              <div className="chip-grid">
                {items.map(task => (
                  <Chip
                    key={task}
                    selected={selected.includes(task)}
                    onClick={() => toggle(task)}
                  >
                    {task}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div className="upload-zone">
          <div className="uz-icon">📤</div>
          <div className="uz-text">Upload Timetable / Plan</div>
          <div className="uz-sub">Coming soon — PDF, CSV, or text</div>
        </div>

        {/* Actions */}
        <div className="decide-actions">
          <Button variant="ghost" size="sm" onClick={() => { setSelected([]); setPlan(null) }}>
            Clear All
          </Button>
          <div className="da-right">
            <span className="selected-count">{selected.length} selected</span>
            <Button variant="gold" size="md" onClick={generate} loading={loading} disabled={selected.length === 0}>
              ⚡ Create Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Result panel */}
      <div className="decide-right">
        <AnimatePresence mode="wait">
          {!plan && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="result-empty">
              <div className="re-icon">⚡</div>
              <div className="re-title">Your AI Plan</div>
              <div className="re-sub">Select tasks on the left and hit "Create Plan" to generate your personalized, time-blocked schedule.</div>
              <div className="re-pills">
                <div className="re-pill">🤖 Powered by Mistral AI</div>
                <div className="re-pill">🧠 Adapts to your {profile.aiPersonality} mode</div>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="result-loading">
              <Spinner size={36} />
              <div className="rl-text">Generating your plan...</div>
              <div className="rl-sub">AI is analyzing your tasks and building a time-blocked schedule tailored to your {profile.aiPersonality} mode.</div>
            </motion.div>
          )}

          {plan && !loading && (
            <motion.div key="plan" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="result-plan">
              <div className="rp-header">
                <div>
                  <div className="rp-title">{plan.title}</div>
                  <div className="rp-meta">
                    {new Date().toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
                    {plan.blocks?.length || 0} blocks · {profile.aiPersonality} mode
                  </div>
                </div>
                <div className="rp-type-badge">{plan.type || mode}</div>
              </div>

              <div className="schedule-list">
                {plan.blocks?.map((block, i) => (
                  <motion.div
                    key={i}
                    className="schedule-block"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="sb-dot" style={{ background: block.color }} />
                    <div className="sb-time">{block.time}</div>
                    <div className="sb-content">
                      <div className="sb-label">{block.label}</div>
                      <div className="sb-desc">{block.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="rp-actions">
                <Button variant="ghost" size="sm" onClick={generate} loading={loading}>🔄 Regenerate</Button>
                <Button
                  variant={saved ? 'ghost' : 'gold'}
                  size="sm"
                  onClick={save}
                  disabled={saved}
                >
                  {saved ? '✅ Saved!' : '💾 Save Plan'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function buildFallback(tasks, mode, personality) {
  const hasHealth = tasks.some(t => ['Gym','Meditate','Morning Run','Power Nap','Sleep Schedule','Meal Prep'].includes(t))
  const hasStudy  = tasks.some(t => ['Study / Learn','Revise Notes','Homework','Coding','Research Paper','Online Course'].includes(t))
  const hasWork   = tasks.some(t => ['Focus Block','Client Work','Meetings','Email Triage'].includes(t))

  const blocks = []
  let hour = 7

  const add = (label, desc, color, mins = 90) => {
    const end = hour + Math.round(mins / 60)
    blocks.push({ time: `${pad(hour)}:00 – ${pad(end)}:00`, label, desc, color })
    hour = end
  }

  if (hasHealth) add('Morning Routine 🌅', 'Gym, meditate, and energize', '#00E5A0', 60)
  if (hasStudy)  add('Focus Study Block 📚', tasks.filter(t=>t).join(', '), '#00D4FF')
  if (hasHealth) add('Break + Nap 😴', 'Power nap & hydration reset', '#A78BFA', 30)
  if (hasStudy)  add('Revision Block 🔁', 'Review & practice problems', '#F5A623')
  if (hasWork)   add('Deep Work Block 💼', 'Most important professional tasks', '#FF7043')

  add('Wind Down 🌙', 'Reflect, plan tomorrow, rest', '#F472B6', 45)

  return { title: `${mode === 'student' ? 'Study' : 'Work'} Plan — ${new Date().toLocaleDateString()}`, type: hasStudy ? 'study' : hasWork ? 'work' : 'health', blocks }
}

function pad(n) { return String(n).padStart(2, '0') }
