import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Btn, Toggle, Textarea, Input, Progress } from '../components/ui.jsx'
import { useToast } from './AppLayout.jsx'
import './Settings.css'
const PERSONALITIES=[{id:'balanced',emoji:'⚖️',title:'Balanced',desc:'Smart, practical, and encouraging.'},{id:'strict',emoji:'💀',title:'Strict',desc:'No excuses. Maximum pressure.'},{id:'zen',emoji:'🌿',title:'Zen',desc:'Calm, mindful, compassionate.'}]
export default function Settings(){
  const profile=useStore(s=>s.profile),stats=useStore(s=>s.stats),updateProfile=useStore(s=>s.updateProfile),resetAll=useStore(s=>s.resetAll),toast=useToast()
  const [local,setLocal]=useState({...profile}),set=(k,v)=>setLocal(s=>({...s,[k]:v}))
  const [notifs,setNotifs]=useState(true),[tracking,setTracking]=useState(true),[confirm,setConfirm]=useState(false)
  const isStudent=local.role==='student',isPro=local.role==='professional'
  const save=()=>{updateProfile(local);toast('Settings saved!','success','✅')}
  const doReset=()=>{resetAll();window.location.reload()}
  return(
    <div className="settings-page">
      <div className="s-stats">
        {[{icon:'⚡',val:stats.decisions,label:'Decisions',color:'var(--gold)'},{icon:'📅',val:stats.plans,label:isStudent?'Timetables':isPro?'Action Plans':'Plans',color:'var(--cyan)'},{icon:'⏱',val:`${stats.timeSaved}m`,label:'Time Saved',color:'var(--green)'},{icon:'🔥',val:`${stats.streak||0}d`,label:'Streak',color:'var(--orange)'}].map(s=>(
          <div key={s.label} className="ss-card"><div className="ss-icon" style={{color:s.color}}>{s.icon}</div><div className="ss-val" style={{color:s.color}}>{s.val}</div><div className="ss-lbl">{s.label}</div></div>
        ))}
      </div>
      <div className="s-grid">
        <div className="s-section">
          <div className="s-sec-title">👤 Profile</div>
          <div className="s-sec-body">
            <Input label="Your Name" value={local.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Amina Wanjiku"/>
            <Input label="Institution / Company" value={local.institution} onChange={e=>set('institution',e.target.value)} placeholder="e.g. University of Nairobi"/>
            <div className="s-row2">
              <div className="s-field"><label className="s-label">Role</label>
                <select className="s-select" value={local.role} onChange={e=>set('role',e.target.value)}>
                  <option value="">Select role</option><option value="student">🎓 Student</option><option value="professional">💼 Professional</option><option value="both">⚡ Both</option>
                </select>
              </div>
              <div className="s-field"><label className="s-label">Peak Hours</label>
                <select className="s-select" value={local.workStyle} onChange={e=>set('workStyle',e.target.value)}>
                  <option value="">Select style</option><option value="morning">🌅 Morning Person</option><option value="afternoon">☀️ Afternoon</option><option value="night">🌙 Night Owl</option><option value="flexible">🔄 Flexible</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="s-section">
          <div className="s-sec-title">🤖 AI Personality</div>
          <div className="s-sec-body">
            {PERSONALITIES.map(p=>(
              <motion.div key={p.id} whileHover={{scale:1.01}} whileTap={{scale:.99}} className={`s-personality ${local.aiPersonality===p.id?'s-personality-on':''}`} onClick={()=>set('aiPersonality',p.id)}>
                <span style={{fontSize:22}}>{p.emoji}</span>
                <div style={{flex:1}}><div className="sp-title">{p.title}</div><div className="sp-desc">{p.desc}</div></div>
                <div className={`sp-radio ${local.aiPersonality===p.id?'sp-radio-on':''}`}>{local.aiPersonality===p.id&&'✓'}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="s-section s-span2">
          <div className="s-sec-title">✏️ AI Custom Instructions</div>
          <div className="s-sec-body">
            <p className="s-desc">{isStudent?'Tell the AI about your studies — subjects, exam dates, study preferences.':isPro?'Tell the AI about your work — projects, priorities, working style.':'Tell the AI about both your academic and professional context.'}</p>
            <Textarea value={local.customInstructions} onChange={e=>set('customInstructions',e.target.value)}
              placeholder={isStudent?`e.g. "I struggle with maths. Exams start May 5th. Prefer visual learning."`:isPro?`e.g. "I work best alone. Team standup every Monday 10am."`:``}/>
            <Progress value={Math.min((local.customInstructions?.length||0)/300*100,100)} color="gold" label={`${local.customInstructions?.length||0} / 300 chars`}/>
          </div>
        </div>
        <div className="s-section">
          <div className="s-sec-title">🔧 Preferences</div>
          <div className="s-sec-body">
            {[{icon:'🔔',name:'Notifications',desc:'Daily wisdom and reminders',val:notifs,fn:setNotifs},{icon:'📊',name:'Behavior Tracking',desc:'Let AI learn your patterns',val:tracking,fn:setTracking},{icon:'🌙',name:'Dark Mode',desc:'Always on — optimized for focus',val:true,fn:()=>{}}].map(item=>(
              <div key={item.name} className="s-pref"><span style={{fontSize:18}}>{item.icon}</span><div style={{flex:1}}><div className="sp-title">{item.name}</div><div className="sp-desc">{item.desc}</div></div><Toggle checked={item.val} onChange={item.fn}/></div>
            ))}
          </div>
        </div>
        <div className="s-section">
          <div className="s-sec-title">ℹ️ About</div>
          <div className="s-sec-body">
            {[['Version','v2.0.0'],['AI Model','arcee-ai/trinity-large-preview:free'],['Provider','OpenRouter.ai'],['Event','Hult Prize 2026'],['Venue','Strathmore University, Nairobi'],['Team','Ekisa Joseph & Davine Othiambo'],['Institution','University of Eldoret']].map(([k,v])=>(
              <div key={k} className="s-about-row"><span className="s-about-k">{k}</span><span className="s-about-v">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="s-save-row"><Btn variant="gold" size="lg" onClick={save}>💾 Save Changes</Btn></div>
      <div className="s-danger">
        <div><div className="s-danger-title">⚠️ Reset All Data</div><div className="s-danger-desc">Permanently deletes preferences, history and conversations.</div></div>
        {!confirm?<Btn variant="danger" size="sm" onClick={()=>setConfirm(true)}>Reset Everything</Btn>:
          <div className="s-confirm"><span style={{fontSize:13,color:'var(--red)',fontWeight:600}}>Are you sure?</span><Btn variant="ghost" size="sm" onClick={()=>setConfirm(false)}>Cancel</Btn><Btn variant="danger" size="sm" onClick={doReset}>Yes, Reset</Btn></div>}
      </div>
    </div>
  )
}
