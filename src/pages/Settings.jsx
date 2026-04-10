import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Button, Toggle, Textarea, Input, Progress } from '../components/ui.jsx'
import './Settings.css'

const PERSONALITIES = [
  { id: 'balanced', emoji: '⚖️', title: 'Balanced', desc: 'Smart, practical, and encouraging.' },
  { id: 'strict',   emoji: '💀', title: 'Strict',   desc: 'No-nonsense. Maximum pressure.' },
  { id: 'zen',      emoji: '🌿', title: 'Zen',      desc: 'Calm, mindful, compassionate.' },
]

export default function Settings() {
  const profile       = useStore(s => s.profile)
  const stats         = useStore(s => s.stats)
  const updateProfile = useStore(s => s.updateProfile)
  const resetAll      = useStore(s => s.resetAll)

  const [saved, setSaved]   = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [local, setLocal]   = useState({ ...profile })
  const [notifs, setNotifs] = useState(true)
  const [tracking, setTracking] = useState(true)

  const set = (k, v) => setLocal(s => ({ ...s, [k]: v }))

  const save = () => {
    updateProfile(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const doReset = () => {
    resetAll()
    setConfirm(false)
    window.location.reload()
  }

  return (
    <div className="settings-page">

      {/* Stats row */}
      <div className="settings-stats">
        {[
          { icon: '⚡', val: stats.decisions, label: 'Decisions Made', color: 'var(--gold)' },
          { icon: '⏱', val: `${stats.timeSaved}m`, label: 'Time Saved', color: 'var(--cyan)' },
          { icon: '🎯', val: `${stats.focusScore}%`, label: 'Focus Score', color: 'var(--green)' },
          { icon: '🔥', val: `${stats.streak || 0}d`, label: 'Streak', color: 'var(--orange)' },
        ].map(s => (
          <div key={s.label} className="ss-card">
            <div className="ss-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="ss-val" style={{ color: s.color }}>{s.val}</div>
            <div className="ss-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-section">
          <div className="section-title">👤 Profile</div>
          <div className="section-body">
            <Input
              label="Your Name"
              value={local.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Ekisa Joseph"
            />
            <Input
              label="Institution / Company"
              value={local.institution}
              onChange={e => set('institution', e.target.value)}
              placeholder="e.g. University of Eldoret"
            />
            <div className="field-row">
              <div className="input-wrap">
                <label className="input-label">Role</label>
                <select
                  className="input-field"
                  value={local.role}
                  onChange={e => set('role', e.target.value)}
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="input-wrap">
                <label className="input-label">Peak Hours</label>
                <select
                  className="input-field"
                  value={local.workStyle}
                  onChange={e => set('workStyle', e.target.value)}
                >
                  <option value="">Select style</option>
                  <option value="morning">Morning Person</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night Owl</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* AI Personality */}
        <div className="settings-section">
          <div className="section-title">🤖 AI Personality</div>
          <div className="section-body">
            <div className="personality-list">
              {PERSONALITIES.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`personality-card ${local.aiPersonality === p.id ? 'active' : ''}`}
                  onClick={() => set('aiPersonality', p.id)}
                >
                  <span className="p-emoji">{p.emoji}</span>
                  <div className="p-info">
                    <div className="p-title">{p.title}</div>
                    <div className="p-desc">{p.desc}</div>
                  </div>
                  <div className={`p-radio ${local.aiPersonality === p.id ? 'checked' : ''}`}>
                    {local.aiPersonality === p.id && '✓'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom instructions */}
        <div className="settings-section settings-span-2">
          <div className="section-title">✏️ AI Custom Instructions</div>
          <div className="section-body">
            <p className="section-desc">
              Tell your AI anything personal — preferences, constraints, working style, or things to avoid.
              This is sent with every AI request to deeply personalize your experience.
            </p>
            <Textarea
              value={local.customInstructions}
              onChange={e => set('customInstructions', e.target.value)}
              placeholder={`e.g. "I hate mornings before 9am. I prefer 25-min Pomodoro blocks. I'm introverted. Never schedule meetings before noon. I work best with music."`}
            />
            <div className="progress-preview">
              <Progress
                value={Math.min((local.customInstructions?.length / 300) * 100, 100)}
                color="gold"
                label={[`${local.customInstructions?.length || 0} / 300 chars`, '']}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <div className="section-title">🔧 Preferences</div>
          <div className="section-body">
            <div className="pref-list">
              <div className="pref-item">
                <div className="pref-info">
                  <div className="pref-name">🔔 Notifications</div>
                  <div className="pref-desc">Daily wisdom and reminders</div>
                </div>
                <Toggle checked={notifs} onChange={setNotifs} />
              </div>
              <div className="pref-item">
                <div className="pref-info">
                  <div className="pref-name">📊 Behavior Tracking</div>
                  <div className="pref-desc">Allow AI to learn your patterns</div>
                </div>
                <Toggle checked={tracking} onChange={setTracking} />
              </div>
              <div className="pref-item">
                <div className="pref-info">
                  <div className="pref-name">🌙 Dark Mode</div>
                  <div className="pref-desc">Always on — optimized for focus</div>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="settings-section">
          <div className="section-title">ℹ️ About</div>
          <div className="section-body">
            <div className="about-rows">
              {[
                ['Version', 'v1.0.0'],
                ['AI Model', 'Mistral 7B Instruct (Free)'],
                ['Provider', 'OpenRouter.ai'],
                ['Event', 'Hult Prize 2026'],
                ['Venue', 'Strathmore University, Nairobi'],
                ['Team', 'Ekisa Joseph & Davine Othiambo'],
                ['Institution', 'University of Eldoret'],
              ].map(([k, v]) => (
                <div key={k} className="about-row">
                  <span className="about-key">{k}</span>
                  <span className="about-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="settings-actions">
        <Button variant="gold" size="lg" onClick={save}>
          {saved ? '✅ Saved!' : '💾 Save Changes'}
        </Button>
      </div>

      {/* Danger zone */}
      <div className="danger-zone">
        <div className="dz-info">
          <div className="dz-title">⚠️ Reset All Data</div>
          <div className="dz-desc">This permanently deletes all your preferences, history, and conversation. Cannot be undone.</div>
        </div>
        {!confirm ? (
          <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>Reset Everything</Button>
        ) : (
          <div className="confirm-row">
            <span className="confirm-text">Are you sure?</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={doReset}>Yes, Reset</Button>
          </div>
        )}
      </div>

    </div>
  )
}
