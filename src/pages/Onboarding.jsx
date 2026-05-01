import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Btn, Chip, Input, Textarea } from '../components/ui.jsx'
import './Onboarding.css'

const ROLES=[
  {id:'student',emoji:'🎓',title:'Student',desc:'Academic workloads & future goals'},
  {id:'professional',emoji:'💼',title:'Professional',desc:'Career growth & work decisions'},
  {id:'both',emoji:'⚡',title:'Both',desc:'Juggling studies and work'},
]
const GOALS=[
  {id:'productivity',emoji:'🚀',label:'Boost Productivity'},
  {id:'focus',emoji:'🎯',label:'Improve Focus'},
  {id:'planning',emoji:'📅',label:'Better Planning'},
  {id:'wellness',emoji:'🌿',label:'Mental Wellness'},
  {id:'decisions',emoji:'⚡',label:'Faster Decisions'},
  {id:'habits',emoji:'🔥',label:'Build Habits'},
]
const CHALLENGES=[
  {id:'overload',emoji:'🌊',label:'Decision Overload'},
  {id:'fatigue',emoji:'😴',label:'Mental Fatigue'},
  {id:'procrastination',emoji:'⏳',label:'Procrastination'},
  {id:'prioritization',emoji:'🗂',label:'Poor Prioritization'},
  {id:'consistency',emoji:'📉',label:'Inconsistency'},
  {id:'balance',emoji:'⚖️',label:'Work-Life Balance'},
]
const WORK_STYLES=[
  {id:'morning',emoji:'🌅',label:'Morning Person',desc:'5am–12pm peak'},
  {id:'afternoon',emoji:'☀️',label:'Afternoon Grinder',desc:'12pm–6pm peak'},
  {id:'night',emoji:'🌙',label:'Night Owl',desc:'8pm–2am peak'},
  {id:'flexible',emoji:'🔄',label:'Flexible',desc:'Varies daily'},
]
const PERSONALITIES=[
  {id:'balanced',emoji:'⚖️',title:'Balanced',desc:'Smart, practical, encouraging.'},
  {id:'strict',emoji:'💀',title:'Strict',desc:'No excuses. Maximum pressure.'},
  {id:'zen',emoji:'🌿',title:'Zen',desc:'Calm, mindful, compassionate.'},
]

const slide={initial:{opacity:0,x:40},animate:{opacity:1,x:0},exit:{opacity:0,x:-40},transition:{duration:.28,ease:[.4,0,.2,1]}}

export default function Onboarding(){
  const complete=useStore(s=>s.completeOnboarding)
  const [step,setStep]=useState(0)
  const [d,setD]=useState({name:'',role:'',institution:'',goals:[],challenges:[],workStyle:'',aiPersonality:'balanced',customInstructions:''})
  const set=(k,v)=>setD(p=>({...p,[k]:v}))
  const tog=(k,id)=>setD(p=>({...p,[k]:p[k].includes(id)?p[k].filter(x=>x!==id):[...p[k],id]}))
  const canNext=()=>{
    if(step===1)return d.name.trim()&&d.role
    if(step===2)return d.goals.length>0
    if(step===3)return d.challenges.length>0
    if(step===4)return d.workStyle
    if(step===5)return d.aiPersonality
    return true
  }
  const next=()=>canNext()&&setStep(s=>s+1)
  const back=()=>setStep(s=>s-1)
  const finish=()=>complete(d)
  const prog=step===0?0:(step/(6))*100

  return(
    <div className="ob-wrap">
      <div className="ob-orb ob-orb1"/><div className="ob-orb ob-orb2"/>
      <div className="ob-inner">
        {/* logo */}
        <div className="ob-top">
          <div className="ob-logo"><div className="ob-lmark">D</div><span className="ob-ltext">Decimate<em>AI</em></span></div>
          {step>0&&<div className="ob-prog-row">
            <div className="ob-prog-track"><motion.div className="ob-prog-fill" animate={{width:`${prog}%`}}/></div>
            <span className="ob-prog-num">Step {step}/6</span>
          </div>}
        </div>

        <div className="ob-card">
          <AnimatePresence mode="wait">
            {step===0&&<motion.div key="s0" {...slide} className="ob-step">
              <div className="ob-badge"><span className="ob-dot"/>Hult Prize 2026 · Kenya Nationals</div>
              <h1 className="ob-h1">Stop <em>surviving</em> your<br/>decisions.<br/>Start <em>owning</em> them.</h1>
              <p className="ob-p">Your personal AI decision intelligence layer — eliminating cognitive overload so you can think faster, decide better, and act smarter.</p>
              <div className="ob-pills">{['⚡ AI Decision Engine','📅 Smart Planner','🤖 3 AI Modes','💬 AI Chat'].map(f=><div key={f} className="ob-pill">{f}</div>)}</div>
              <Btn variant="gold" size="xl" onClick={next}>Get Started →</Btn>
              <p style={{fontSize:13,color:'var(--text-dim)',textAlign:'center'}}>Takes 2 minutes · Your data stays on your device</p>
            </motion.div>}

            {step===1&&<motion.div key="s1" {...slide} className="ob-step">
              <div className="ob-step-n">01 / 06</div>
              <h2 className="ob-h2">Tell us about yourself</h2>
              <p className="ob-sub">This personalizes every AI response you get.</p>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <Input label="Your Name" placeholder="e.g. Amina Wanjiku" value={d.name} onChange={e=>set('name',e.target.value)} autoFocus/>
                <Input label="Institution / Company (optional)" placeholder="e.g. University of Nairobi" value={d.institution} onChange={e=>set('institution',e.target.value)}/>
              </div>
              <div className="ob-label">I am primarily a...</div>
              <div className="ob-role-grid">
                {ROLES.map(r=>(
                  <motion.div key={r.id} whileHover={{scale:1.02}} whileTap={{scale:.97}}
                    className={`ob-role ${d.role===r.id?'ob-role-on':''}`} onClick={()=>set('role',r.id)}>
                    <div className="ob-role-emoji">{r.emoji}</div>
                    <div className="ob-role-title">{r.title}</div>
                    <div className="ob-role-desc">{r.desc}</div>
                    {d.role===r.id&&<div className="ob-role-check">✓</div>}
                  </motion.div>
                ))}
              </div>
            </motion.div>}

            {step===2&&<motion.div key="s2" {...slide} className="ob-step">
              <div className="ob-step-n">02 / 06</div>
              <h2 className="ob-h2">What are your main goals?</h2>
              <p className="ob-sub">Select all that apply — your AI will prioritise these.</p>
              <div className="ob-chips">{GOALS.map(g=><Chip key={g.id} selected={d.goals.includes(g.id)} onClick={()=>tog('goals',g.id)}>{g.emoji} {g.label}</Chip>)}</div>
            </motion.div>}

            {step===3&&<motion.div key="s3" {...slide} className="ob-step">
              <div className="ob-step-n">03 / 06</div>
              <h2 className="ob-h2">What holds you back?</h2>
              <p className="ob-sub">Be honest — your AI proactively addresses these.</p>
              <div className="ob-chips">{CHALLENGES.map(c=><Chip key={c.id} selected={d.challenges.includes(c.id)} onClick={()=>tog('challenges',c.id)}>{c.emoji} {c.label}</Chip>)}</div>
            </motion.div>}

            {step===4&&<motion.div key="s4" {...slide} className="ob-step">
              <div className="ob-step-n">04 / 06</div>
              <h2 className="ob-h2">When do you work best?</h2>
              <p className="ob-sub">Your AI schedules hardest tasks during your peak hours.</p>
              <div className="ob-style-grid">
                {WORK_STYLES.map(w=>(
                  <motion.div key={w.id} whileHover={{scale:1.02}} whileTap={{scale:.97}}
                    className={`ob-style ${d.workStyle===w.id?'ob-style-on':''}`} onClick={()=>set('workStyle',w.id)}>
                    <div className="ob-style-emoji">{w.emoji}</div>
                    <div className="ob-style-title">{w.label}</div>
                    <div className="ob-style-desc">{w.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>}

            {step===5&&<motion.div key="s5" {...slide} className="ob-step">
              <div className="ob-step-n">05 / 06</div>
              <h2 className="ob-h2">Choose your AI personality</h2>
              <p className="ob-sub">You can always switch in Settings.</p>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {PERSONALITIES.map(p=>(
                  <motion.div key={p.id} whileHover={{scale:1.01}} whileTap={{scale:.98}}
                    className={`ob-personality ${d.aiPersonality===p.id?'ob-personality-on':''}`} onClick={()=>set('aiPersonality',p.id)}>
                    <span className="ob-p-emoji">{p.emoji}</span>
                    <div><div className="ob-p-title">{p.title}</div><div className="ob-p-desc">{p.desc}</div></div>
                    {d.aiPersonality===p.id&&<div className="ob-p-check">✓</div>}
                  </motion.div>
                ))}
              </div>
            </motion.div>}

            {step===6&&<motion.div key="s6" {...slide} className="ob-step">
              <div className="ob-step-n">06 / 06</div>
              <h2 className="ob-h2">Any custom instructions?</h2>
              <p className="ob-sub">Optional — deeply personalises every AI response.</p>
              <Textarea placeholder={`e.g. "I hate mornings. I prefer 25-min Pomodoro blocks. Never schedule meetings back-to-back."`}
                value={d.customInstructions} onChange={e=>set('customInstructions',e.target.value)}/>
              <div className="ob-summary">
                <div className="ob-sum-title">📋 Your profile</div>
                {[['Name',d.name],['Role',d.role],d.institution&&['Institution',d.institution],['AI Mode',d.aiPersonality],['Peak Hours',d.workStyle]].filter(Boolean).map(([k,v])=>(
                  <div key={k} className="ob-sum-row"><span>{k}</span><strong style={{textTransform:'capitalize'}}>{v||'—'}</strong></div>
                ))}
              </div>
              <Btn variant="gold" size="xl" onClick={finish} style={{width:'100%'}}>🚀 Launch Decimate AI</Btn>
            </motion.div>}
          </AnimatePresence>

          {step>0&&step<6&&<div className="ob-nav">
            <Btn variant="ghost" size="sm" onClick={back}>← Back</Btn>
            <Btn variant="gold" size="md" onClick={next} disabled={!canNext()}>Next →</Btn>
          </div>}
          {step===6&&<div className="ob-nav"><Btn variant="ghost" size="sm" onClick={back}>← Back</Btn></div>}
        </div>
      </div>
    </div>
  )
}
