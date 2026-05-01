import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useAI } from '../hooks/useAI'
import { useToast } from './AppLayout.jsx'
import { Btn, Chip, Spinner, AiText, Modal } from '../components/ui.jsx'
import './Decide.css'

// Role-aware task categories
const STUDENT_TASKS = {
  '📚 Academics': ['Study / Learn','Revise Notes','Homework','Group Project','Coding','Read a Book','Online Course','Research Paper','Past Papers','Thesis Work'],
  '💪 Wellness':  ['Gym','Power Nap','Meditate','Morning Run','Meal Prep','Sleep Early'],
  '🎯 Personal':  ['Career Planning','Side Project','Networking','Journaling','Financial Planning'],
}
const PRO_TASKS = {
  '💼 Work':       ['Deep Work','Client Presentation','Strategy Session','Project Review','Deadline Task','Report Writing'],
  '🤝 Collaboration': ['Team Meeting','Client Call','Email Triage','Networking','Mentoring'],
  '📈 Growth':     ['Online Course','Industry Reading','Skill Development','Workout','Meditation'],
}
const BOTH_TASKS = { ...STUDENT_TASKS, ...PRO_TASKS }

function exportToText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = filename + '.txt'; a.click()
}

export default function Decide() {
  const profile  = useStore(s => s.profile)
  const addHist  = useStore(s => s.addHistory)
  const toast    = useToast()
  const { analyseDecision, reanalyseDecision, createPlan, loading } = useAI()

  const isStudent = profile.role === 'student'
  const isPro     = profile.role === 'professional'
  const isBoth    = profile.role === 'both'

  const tasks = isStudent ? STUDENT_TASKS : isPro ? PRO_TASKS : BOTH_TASKS
  const planLabel = isStudent ? 'Build My Timetable' : isPro ? 'Build My Action Plan' : 'Build My Plan'
  const planDesc  = isStudent ? 'Upload or enter your tasks — AI builds a smart timetable'
    : isPro ? 'Upload or enter your tasks — AI builds a professional action plan'
    : 'Upload or enter your tasks — AI builds a combined plan'

  // ── Decision state ─────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState('decision') // 'decision' | 'plan'
  const [selected, setSelected]     = useState([])
  const [context, setContext]       = useState('')
  const [decResult, setDecResult]   = useState(null)  // { text, choice }
  const [decLoading, setDecLoading] = useState(false)
  const [previousChoice, setPrevChoice] = useState(null)

  // ── Plan state ─────────────────────────────────────────────
  const [planTasks, setPlanTasks]   = useState('')
  const [uploadedText, setUploaded] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [planResult, setPlanResult] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const fileRef = useRef()

  const toggleChip = t => setSelected(s => s.includes(t) ? s.filter(x=>x!==t) : [...s, t])

  // ── MAKE DECISION ──────────────────────────────────────────
  const makeDecision = async () => {
    if (selected.length < 2) { toast('Select at least 2 options to decide between', 'error', '⚠️'); return }
    setDecLoading(true); setDecResult(null)
    const { ok, text } = await analyseDecision(selected, context)
    if (ok) {
      const choiceMatch = text.match(/BEST CHOICE:\s*(.+)/i)
      const choice = choiceMatch ? choiceMatch[1].trim() : selected[0]
      setDecResult({ text, choice })
      setPrevChoice(choice)
    } else {
      toast(text, 'error', '❌')
    }
    setDecLoading(false)
  }

  // ── ACCEPT DECISION ───────────────────────────────────────
  const acceptDecision = () => {
    addHist({ type:'decision', title:`Decision: ${decResult.choice.slice(0,50)}`, choices: selected, result: decResult.text, context })
    toast('Decision saved to history!', 'success', '✅')
    setDecResult(null); setSelected([]); setContext(''); setPrevChoice(null)
  }

  // ── REJECT / REGENERATE DECISION ──────────────────────────
  const rejectDecision = async () => {
    setDecLoading(true)
    const { ok, text } = await reanalyseDecision(selected, context, previousChoice)
    if (ok) {
      const choiceMatch = text.match(/BEST CHOICE:\s*(.+)/i)
      const choice = choiceMatch ? choiceMatch[1].trim() : selected[0]
      setDecResult({ text, choice })
      setPrevChoice(choice)
      toast('New recommendation generated!', 'info', '🔄')
    } else {
      toast(text, 'error', '❌')
    }
    setDecLoading(false)
  }

  // ── FILE UPLOAD ────────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploadName(file.name)
    const text = await file.text()
    setUploaded(text.slice(0, 3000)) // cap at 3000 chars
    toast(`Uploaded: ${file.name}`, 'success', '📎')
  }

  // ── CREATE PLAN ────────────────────────────────────────────
  const buildPlan = async () => {
    const taskList = planTasks.trim().split('\n').filter(Boolean)
    if (!taskList.length && !uploadedText) { toast('Enter some tasks or upload a file first', 'error', '⚠️'); return }
    setPlanLoading(true); setPlanResult(null)
    const { ok, text } = await createPlan(taskList, uploadedText)
    if (ok) {
      setPlanResult(text)
    } else {
      toast(text, 'error', '❌')
    }
    setPlanLoading(false)
  }

  // ── SAVE & EXPORT PLAN ─────────────────────────────────────
  const savePlan = () => {
    if (!planResult) return
    const title = isStudent ? 'Timetable' : isPro ? 'Action Plan' : 'Plan'
    addHist({ type:'plan', title:`${title} — ${new Date().toLocaleDateString()}`, result: planResult, tasks: planTasks })
    toast('Plan saved to history!', 'success', '✅')
  }

  const exportPlan = () => {
    if (!planResult) return
    const fname = isStudent ? 'MyTimetable' : 'MyActionPlan'
    exportToText(planResult, fname + '_' + new Date().toISOString().slice(0,10))
    toast('Exported as .txt file!', 'success', '📥')
  }

  return (
    <div className="decide-page">

      {/* Tab selector */}
      <div className="decide-tabs">
        <button className={`dtab ${activeTab==='decision'?'dtab-on':''}`} onClick={()=>setActiveTab('decision')}>
          <span className="dtab-icon">⚡</span>
          <div>
            <div className="dtab-title">Make a Decision</div>
            <div className="dtab-desc">AI picks the best choice for you</div>
          </div>
        </button>
        <button className={`dtab ${activeTab==='plan'?'dtab-on':''}`} onClick={()=>setActiveTab('plan')}>
          <span className="dtab-icon">{isStudent?'📅':'📋'}</span>
          <div>
            <div className="dtab-title">{planLabel}</div>
            <div className="dtab-desc">{planDesc}</div>
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── DECISION TAB ──────────────────────────────────── */}
        {activeTab==='decision' && (
          <motion.div key="decision" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            className="decide-content">

            <div className="decide-split">
              {/* Left: options */}
              <div className="decide-left">
                <div className="dleft-head">
                  <div className="dleft-title">Select your options</div>
                  <div className="dleft-sub">Pick the choices you're deciding between (min. 2)</div>
                </div>

                {Object.entries(tasks).map(([section, items]) => (
                  <div key={section} className="task-section">
                    <div className="task-section-lbl">{section}</div>
                    <div className="chip-grid">
                      {items.map(t => <Chip key={t} selected={selected.includes(t)} onClick={()=>toggleChip(t)}>{t}</Chip>)}
                    </div>
                  </div>
                ))}

                {/* Custom option input */}
                <div className="custom-option">
                  <div className="task-section-lbl">✏️ Add Custom Option</div>
                  <div className="custom-row">
                    <input className="custom-input" placeholder="Type your own option..." id="customOpt"
                      onKeyDown={e=>{ if(e.key==='Enter'&&e.target.value.trim()){ toggleChip(e.target.value.trim()); e.target.value='' }}}/>
                    <Btn variant="ghost" size="sm" onClick={()=>{ const el=document.getElementById('customOpt'); if(el.value.trim()){toggleChip(el.value.trim());el.value=''} }}>Add</Btn>
                  </div>
                </div>

                {/* Context */}
                <div className="task-section">
                  <div className="task-section-lbl">📝 Context (optional)</div>
                  <textarea className="context-input" rows={3}
                    placeholder={`Give the AI more context. E.g. "I have 3 hours available and I'm tired from morning class."`}
                    value={context} onChange={e=>setContext(e.target.value)}/>
                </div>

                <div className="decide-action-row">
                  <span className="sel-count">{selected.length} option{selected.length!==1?'s':''} selected</span>
                  <div style={{display:'flex',gap:10}}>
                    <Btn variant="ghost" size="sm" onClick={()=>{setSelected([]);setDecResult(null);setContext('')}}>Clear</Btn>
                    <Btn variant="gold" size="md" onClick={makeDecision} loading={decLoading} disabled={selected.length<2||decLoading}>
                      ⚡ Analyse & Decide
                    </Btn>
                  </div>
                </div>
              </div>

              {/* Right: result */}
              <div className="decide-right">
                <AnimatePresence mode="wait">
                  {!decResult && !decLoading && (
                    <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} className="result-empty">
                      <div className="re-icon">🧠</div>
                      <div className="re-title">AI Decision Engine</div>
                      <div className="re-sub">Select your options on the left, add context if needed, then hit "Analyse & Decide". The AI will pick the single best choice and explain why.</div>
                      <div className="re-pills">
                        <div className="re-pill">🤖 {profile.aiPersonality} mode</div>
                        <div className="re-pill">{isStudent?'🎓 Student context':isPro?'💼 Professional context':'⚡ Full context'}</div>
                      </div>
                    </motion.div>
                  )}

                  {decLoading && (
                    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} className="result-loading">
                      <Spinner size={40}/>
                      <div className="rl-title">Analysing your options...</div>
                      <div className="rl-sub">AI is weighing your choices based on your {profile.aiPersonality} mode and {profile.role} context.</div>
                    </motion.div>
                  )}

                  {decResult && !decLoading && (
                    <motion.div key="result" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="result-decision">
                      <div className="rd-header">
                        <div className="rd-label">AI Recommendation</div>
                        <div className="rd-meta">{isStudent?'Student mode':isPro?'Professional mode':'Dual mode'} · {profile.aiPersonality}</div>
                      </div>

                      <AiText text={decResult.text}/>

                      {/* Human-centric accept/reject */}
                      <div className="rd-verdict">
                        <div className="rd-verdict-label">Does this work for you?</div>
                        <div className="rd-verdict-btns">
                          <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}}
                            className="verdict-btn verdict-yes" onClick={acceptDecision}>
                            <span className="verdict-icon">✓</span>
                            <span>Yes, I agree</span>
                          </motion.button>
                          <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}}
                            className="verdict-btn verdict-no" onClick={rejectDecision} disabled={decLoading}>
                            <span className="verdict-icon">✕</span>
                            <span>No, try again</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PLAN TAB ──────────────────────────────────────── */}
        {activeTab==='plan' && (
          <motion.div key="plan" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            className="decide-content">

            <div className="decide-split">
              {/* Left: input */}
              <div className="decide-left">
                <div className="dleft-head">
                  <div className="dleft-title">{isStudent?'Your Tasks & Subjects':isPro?'Your Work Tasks':'Your Tasks'}</div>
                  <div className="dleft-sub">
                    {isStudent ? 'Enter your subjects/tasks — AI builds a structured timetable'
                      : isPro ? 'Enter your tasks/projects — AI builds a professional action plan'
                      : 'Enter your tasks — AI builds a balanced plan'}
                  </div>
                </div>

                <div className="task-section">
                  <div className="task-section-lbl">{isStudent?'📚 Enter subjects or tasks (one per line)':'💼 Enter tasks or projects (one per line)'}</div>
                  <textarea className="context-input" rows={6}
                    placeholder={isStudent
                      ? `e.g.\nMathematics – Chapter 5\nPhysics revision\nEnglish essay draft\nGroup project meeting`
                      : `e.g.\nQ3 report finalization\nClient presentation prep\nTeam standup\nCode review`}
                    value={planTasks} onChange={e=>setPlanTasks(e.target.value)}/>
                </div>

                {/* Upload */}
                <div className="task-section">
                  <div className="task-section-lbl">📤 Or upload your {isStudent?'timetable/task list':'task list/project doc'}</div>
                  <div className="upload-zone" onClick={()=>fileRef.current.click()}>
                    <input ref={fileRef} type="file" accept=".txt,.csv,.md" style={{display:'none'}} onChange={handleFile}/>
                    {uploadName
                      ? <><div className="uz-done">✅ {uploadName}</div><div className="uz-sub">Click to replace</div></>
                      : <><div className="uz-icon">📁</div><div className="uz-text">Click to upload (.txt, .csv, .md)</div><div className="uz-sub">AI will read and plan around your file</div></>
                    }
                  </div>
                </div>

                <div className="decide-action-row">
                  <span className="sel-count">{isStudent?'🎓 Student timetable':isPro?'💼 Professional plan':'⚡ Combined plan'}</span>
                  <div style={{display:'flex',gap:10}}>
                    <Btn variant="ghost" size="sm" onClick={()=>{setPlanTasks('');setUploaded('');setUploadName('');setPlanResult(null)}}>Clear</Btn>
                    <Btn variant="gold" size="md" onClick={buildPlan} loading={planLoading}
                      disabled={(!planTasks.trim() && !uploadedText) || planLoading}>
                      {isStudent?'📅 Build Timetable':isPro?'📋 Build Action Plan':'📋 Build Plan'}
                    </Btn>
                  </div>
                </div>
              </div>

              {/* Right: plan result */}
              <div className="decide-right plan-result-panel">
                <AnimatePresence mode="wait">
                  {!planResult && !planLoading && (
                    <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} className="result-empty">
                      <div className="re-icon">{isStudent?'📅':'📋'}</div>
                      <div className="re-title">{isStudent?'AI Timetable Builder':isPro?'AI Action Planner':'AI Plan Builder'}</div>
                      <div className="re-sub">
                        {isStudent ? 'Enter your subjects and tasks on the left. AI will create a structured timetable with time blocks, breaks, and study tips — tailored to your peak hours.'
                          : isPro ? 'Enter your work tasks on the left. AI will build a prioritized action plan with execution schedule and milestones.'
                          : 'Enter your tasks. AI will build a balanced plan covering both academic and professional needs.'}
                      </div>
                      <div className="re-pills">
                        <div className="re-pill">🤖 {profile.aiPersonality} mode</div>
                        <div className="re-pill">⏰ {profile.workStyle || 'flexible'} schedule</div>
                      </div>
                    </motion.div>
                  )}

                  {planLoading && (
                    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} className="result-loading">
                      <Spinner size={40}/>
                      <div className="rl-title">{isStudent?'Building your timetable...':isPro?'Building your action plan...':'Building your plan...'}</div>
                      <div className="rl-sub">AI is organizing your tasks around your {profile.workStyle||'flexible'} peak hours.</div>
                    </motion.div>
                  )}

                  {planResult && !planLoading && (
                    <motion.div key="plan" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="result-plan-content">
                      <div className="rp-header">
                        <div className="rp-label">{isStudent?'📅 Your Timetable':isPro?'📋 Your Action Plan':'📋 Your Plan'}</div>
                        <div className="rp-meta">Generated {new Date().toLocaleTimeString()} · {profile.aiPersonality} mode</div>
                      </div>

                      <div className="plan-scroll">
                        <AiText text={planResult}/>
                      </div>

                      <div className="rp-actions">
                        <Btn variant="ghost" size="sm" onClick={buildPlan} loading={planLoading}>🔄 Regenerate</Btn>
                        <Btn variant="navy" size="sm" onClick={savePlan}>💾 Save</Btn>
                        <Btn variant="gold" size="sm" onClick={exportPlan}>📥 Export</Btn>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
