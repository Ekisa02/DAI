import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Card, Btn, Badge, Progress } from '../components/ui.jsx'
import './Dashboard.css'

const WISDOMS=['Your decisions today are the architecture of tomorrow.','Clarity precedes mastery. Decide once, execute fully.','The secret of getting ahead is getting started.','Focus is the currency of high performance.','Every decision you avoid is a decision made by default.']
const hour=new Date().getHours()
const greeting=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening'
const wisdom=WISDOMS[new Date().getDate()%WISDOMS.length]
const stagger={animate:{transition:{staggerChildren:.06}}}
const fadeUp={initial:{opacity:0,y:18},animate:{opacity:1,y:0},transition:{duration:.35,ease:[.4,0,.2,1]}}

export default function Dashboard({onNavigate}){
  const profile=useStore(s=>s.profile)
  const stats=useStore(s=>s.stats)
  const history=useStore(s=>s.history)
  const isStudent=profile.role==='student'
  const isPro=profile.role==='professional'
  const isBoth=profile.role==='both'
  const recent=history.slice(0,5)
  const modeEmoji={balanced:'⚖️',strict:'💀',zen:'🌿'}[profile.aiPersonality]||'⚖️'
  const planLabel=isStudent?'Timetables Built':isPro?'Action Plans Built':'Plans Built'

  return(
    <motion.div variants={stagger} initial="initial" animate="animate" className="dashboard">
      <motion.div variants={fadeUp} className="wb">
        <div className="wb-grid">
          <div className="wb-content">
            <div className="wb-greeting">{greeting}, {profile.name?.split(' ')[0]||'there'} 👋</div>
            <div className="wb-wisdom">"{wisdom}"</div>
            <div className="wb-role-tag">
              {isStudent&&<span className="role-tag role-student">🎓 Student Mode</span>}
              {isPro&&<span className="role-tag role-pro">💼 Professional Mode</span>}
              {isBoth&&<span className="role-tag role-both">⚡ Student & Professional</span>}
            </div>
            <div className="wb-actions">
              <Btn variant="gold" onClick={()=>onNavigate('decide')}>⚡ Help Me Decide</Btn>
              <Btn variant="ghost" onClick={()=>onNavigate('chat')}>💬 Ask AI</Btn>
            </div>
          </div>
          <div className="wb-deco">
            <div className="wb-ring wb-r1"/><div className="wb-ring wb-r2"/><div className="wb-ring wb-r3"/>
            <div className="wb-d">D</div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="stats-grid">
        {[
          {icon:'⚡',val:stats.decisions,label:'Decisions Made',color:'gold',change:'+12%'},
          {icon:'📅',val:stats.plans,label:planLabel,color:'cyan',change:'+8%'},
          {icon:'⏱',val:`${stats.timeSaved}m`,label:'Time Saved',color:'green',change:'+5m'},
          {icon:'🔥',val:stats.streak||0,label:'Day Streak',color:'orange',change:'+1'},
        ].map(s=>(
          <div key={s.label} className={`stat-card stat-${s.color}`}>
            <div className="sc-icon">{s.icon}</div>
            <div className="sc-val">{s.val}</div>
            <div className="sc-label">{s.label}</div>
            <div className={`sc-change ${s.change.startsWith('+')?'up':'down'}`}>{s.change}</div>
          </div>
        ))}
      </motion.div>

      <div className="dash-grid2">
        <motion.div variants={fadeUp}>
          <Card className="dash-card">
            <div className="dc-header">
              <div><div className="dc-title">Recent Activity</div><div className="dc-sub">Your latest AI decisions & plans</div></div>
              <Btn variant="ghost" size="sm" onClick={()=>onNavigate('history')}>View all →</Btn>
            </div>
            <div className="dc-body">
              {recent.length===0?(
                <div className="dc-empty">
                  <div style={{fontSize:28,opacity:.35}}>📋</div>
                  <div className="dc-empty-text">No activity yet</div>
                  <div className="dc-empty-sub">Start with Help Me Decide</div>
                  <Btn variant="gold" size="sm" onClick={()=>onNavigate('decide')} style={{marginTop:10}}>Get Started</Btn>
                </div>
              ):recent.map((item,i)=>(
                <div key={item.id||i} className="activity-item">
                  <div className="ai-dot" style={{background:item.type==='decision'?'var(--gold)':'var(--cyan)'}}/>
                  <div className="ai-info">
                    <div className="ai-title">{item.title}</div>
                    <div className="ai-meta">{item.type==='decision'?'⚡ Decision':'📅 Plan'} · {new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Badge color={item.type==='decision'?'gold':'cyan'}>{item.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="dash-card">
            <div className="dc-header">
              <div className="dc-title">Your Profile</div>
              <Btn variant="ghost" size="sm" onClick={()=>onNavigate('settings')}>Edit →</Btn>
            </div>
            <div className="dc-body">
              <div className="profile-row">
                <div className="profile-avatar">{profile.name?profile.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase():'AI'}</div>
                <div>
                  <div className="profile-name">{profile.name||'User'}</div>
                  <div className="profile-role" style={{textTransform:'capitalize'}}>{profile.role||'—'}</div>
                  {profile.institution&&<div className="profile-inst">{profile.institution}</div>}
                </div>
              </div>
              <div className="profile-stats">
                <div className="pstat"><div className="pstat-lbl">AI Mode</div><div className="pstat-val">{modeEmoji} {profile.aiPersonality}</div></div>
                <div className="pstat"><div className="pstat-lbl">Peak Hours</div><div className="pstat-val" style={{textTransform:'capitalize'}}>{profile.workStyle||'—'}</div></div>
              </div>
              {profile.goals?.length>0&&(
                <div><div className="mini-label">Goals</div>
                <div className="goal-chips">{profile.goals.slice(0,4).map(g=><span key={g} className="goal-chip">{g}</span>)}</div></div>
              )}
              <Progress value={stats.focusScore||78} color="gold" label={`Focus Score — ${stats.focusScore||78}%`}/>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <div className="tip-card">
          <div className="tip-icon">🧠</div>
          <div>
            <div className="tip-label">Cognitive Tip</div>
            <div className="tip-text">
              {isStudent?<>Your brain consolidates information during <strong>sleep and breaks</strong>. Never study more than 90 min without a break — retention drops 40%. AI schedules around your <strong>{profile.workStyle||'flexible'}</strong> peak hours.</>
              :isPro?<>Professionals make their worst decisions after 3+ hours of continuous work. Schedule critical decisions in the first 90 minutes of your day — when your prefrontal cortex is at peak capacity.</>
              :<>Balance between academic and professional tasks requires <strong>context switching discipline</strong>. Use time-blocking to keep both worlds separate — your AI plans around your <strong>{profile.workStyle||'flexible'}</strong> peak hours.</>}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
