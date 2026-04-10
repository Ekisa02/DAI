import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { StatCard, Card, Button, Badge, Progress } from '../components/ui.jsx'
import './Dashboard.css'

const WISDOMS = [
  "Your decisions today are the architecture of tomorrow.",
  "Clarity precedes mastery. Decide once, execute fully.",
  "The secret of getting ahead is getting started.",
  "Focus is the currency of high performance.",
  "Every decision you avoid is a decision made by default.",
]

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
const wisdom = WISDOMS[new Date().getDate() % WISDOMS.length]

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } }
}
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4,0,0.2,1] },
}

export default function Dashboard({ onNavigate }) {
  const profile = useStore(s => s.profile)
  const stats   = useStore(s => s.stats)
  const plans   = useStore(s => s.plans)

  const recentPlans = plans.slice(0, 5)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="dashboard">

      {/* Welcome banner */}
      <motion.div variants={fadeUp} className="welcome-banner">
        <div className="wb-grid">
          <div>
            <div className="wb-greeting">{greeting}, {profile.name?.split(' ')[0] || 'there'} 👋</div>
            <div className="wb-wisdom">"{wisdom}"</div>
            <div className="wb-actions">
              <Button variant="gold" onClick={() => onNavigate('decide')}>⚡ Help Me Decide</Button>
              <Button variant="ghost" onClick={() => onNavigate('chat')}>💬 Ask AI</Button>
            </div>
          </div>
          <div className="wb-visual">
            <div className="wb-circle wb-c1" />
            <div className="wb-circle wb-c2" />
            <div className="wb-circle wb-c3" />
            <div className="wb-d-mark">D</div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="stats-grid">
        <StatCard icon="⚡" value={stats.decisions} label="Decisions Made" change="+12%" color="gold" />
        <StatCard icon="⏱" value={`${stats.timeSaved}m`} label="Time Saved" change="+8m" color="cyan" />
        <StatCard icon="🎯" value={`${stats.focusScore}%`} label="Focus Score" change="-4%" color="green" />
        <StatCard icon="🔥" value={stats.streak || 0} label="Day Streak" change="+1" color="orange" />
      </motion.div>

      {/* Two column */}
      <div className="dash-grid-2">
        {/* Recent plans */}
        <motion.div variants={fadeUp}>
          <Card className="dash-card">
            <div className="card-hdr">
              <div>
                <div className="card-title">Recent Plans</div>
                <div className="card-sub">Your latest AI-generated schedules</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('history')}>View all →</Button>
            </div>
            <div className="card-body">
              {recentPlans.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">No plans yet</div>
                  <div className="empty-sub">Create your first AI plan to get started</div>
                  <Button variant="gold" size="sm" onClick={() => onNavigate('decide')} style={{ marginTop: 12 }}>
                    ⚡ Create Plan
                  </Button>
                </div>
              ) : recentPlans.map((plan, i) => (
                <div key={i} className="plan-item">
                  <div className="plan-dot" style={{ background: typeColor(plan.type) }} />
                  <div className="plan-info">
                    <div className="plan-title">{plan.title}</div>
                    <div className="plan-meta">{plan.blocks?.length || 0} blocks · {new Date(plan.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Badge color={typeBadge(plan.type)}>{plan.type}</Badge>
                </div>
              ))}

              {/* Placeholder items if empty */}
              {recentPlans.length === 0 && null}
            </div>
          </Card>
        </motion.div>

        {/* Profile snapshot */}
        <motion.div variants={fadeUp}>
          <Card className="dash-card">
            <div className="card-hdr">
              <div className="card-title">Your Profile</div>
            </div>
            <div className="card-body">
              <div className="profile-avatar-row">
                <div className="profile-avatar">
                  {profile.name ? profile.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'AI'}
                </div>
                <div>
                  <div className="profile-name">{profile.name || 'User'}</div>
                  <div className="profile-role" style={{ textTransform: 'capitalize' }}>{profile.role || '—'}</div>
                  {profile.institution && <div className="profile-inst">{profile.institution}</div>}
                </div>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="ps-label">AI Personality</div>
                  <div className="ps-val" style={{ textTransform: 'capitalize' }}>
                    {modeEmoji(profile.aiPersonality)} {profile.aiPersonality}
                  </div>
                </div>
                <div className="profile-stat">
                  <div className="ps-label">Peak Hours</div>
                  <div className="ps-val" style={{ textTransform: 'capitalize' }}>{profile.workStyle || '—'}</div>
                </div>
              </div>

              {profile.goals?.length > 0 && (
                <div>
                  <div className="mini-label">Goals</div>
                  <div className="goal-chips">
                    {profile.goals.slice(0,4).map(g => (
                      <span key={g} className="goal-chip">{g}</span>
                    ))}
                  </div>
                </div>
              )}

              <Progress value={stats.focusScore} color="gold" label={[`Focus Score`, `${stats.focusScore}%`]} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI tip card */}
      <motion.div variants={fadeUp}>
        <div className="tip-card">
          <div className="tip-icon">🧠</div>
          <div>
            <div className="tip-label">Cognitive Tip of the Day</div>
            <div className="tip-text">
              Your brain operates in <strong>90-minute ultradian cycles</strong>. Schedule your hardest tasks
              in the first block of your peak hours — that's when your prefrontal cortex fires at full power.
              Decimate AI automatically schedules around your peak time: <strong>{profile.workStyle || 'flexible'}</strong>.
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}

function typeColor(type) {
  return { study: 'var(--cyan)', health: 'var(--green)', work: 'var(--orange)', mixed: 'var(--gold)' }[type] || 'var(--gold)'
}
function typeBadge(type) {
  return { study: 'cyan', health: 'green', work: 'orange', mixed: 'gold' }[type] || 'gold'
}
function modeEmoji(mode) {
  return { balanced: '⚖️', strict: '💀', zen: '🌿' }[mode] || '⚖️'
}
