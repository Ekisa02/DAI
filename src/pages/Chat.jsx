import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useAI } from '../hooks/useAI'
import { useToast } from './AppLayout.jsx'
import { Btn, Spinner } from '../components/ui.jsx'
import './Chat.css'

const STUDENT_PROMPTS = ['Create a study plan for my exams','Help me prioritize 3 assignments','Build me a morning study routine','How do I stop procrastinating?','I\'m overwhelmed with coursework','Help me balance study and personal life']
const PRO_PROMPTS     = ['Help me prioritize tasks for today','Create a deep work schedule','How do I stay focused in meetings?','Structure my project planning','I\'m burned out — what should I do?','How do I manage decision fatigue?']
const BOTH_PROMPTS    = ['Balance work and studies today','I have a deadline and an exam tomorrow','Build a daily schedule for a working student','Prioritize my mixed work-study tasks','How do I manage energy for both work and study?','Plan my week efficiently']

export default function Chat() {
  const profile       = useStore(s => s.profile)
  const messages      = useStore(s => s.messages)
  const addMessage    = useStore(s => s.addMessage)
  const clearMessages = useStore(s => s.clearMessages)
  const { chat, loading } = useAI()
  const toast = useToast()

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const isStudent = profile.role === 'student'
  const isPro     = profile.role === 'professional'
  const quickPrompts = isStudent ? STUDENT_PROMPTS : isPro ? PRO_PROMPTS : BOTH_PROMPTS

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    addMessage({ role: 'user', content: msg, ts: Date.now() })
    const history = messages.slice(-10)
    const { ok, text: reply } = await chat(msg, history)
    addMessage({ role: 'assistant', content: reply, ts: Date.now() })
    if (!ok) toast('Check your API key in .env', 'error', '⚠️')
  }

  const handleKey = (e) => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); send() } }
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  return (
    <div className="chat-page">
      <div className="chat-head">
        <div className="chat-avatar">D</div>
        <div className="chat-head-info">
          <div className="chat-name">Decimate AI</div>
          <div className="chat-status"><span className="chat-dot"/>
            {profile.aiPersonality} · {isStudent?'Student':isPro?'Professional':'Student & Pro'}
          </div>
        </div>
        <Btn variant="ghost" size="sm" onClick={()=>{clearMessages();toast('Cleared','info','🗑️')}} style={{marginLeft:'auto'}}>🗑 Clear</Btn>
      </div>

      <div className="chat-messages">
        {!apiKey && (
          <div className="api-warn">
            <span>⚠️</span>
            <div><strong>API key missing.</strong> Add <code>VITE_OPENROUTER_API_KEY</code> to your <code>.env</code> file.
              Get a free key at <a href="https://openrouter.ai" target="_blank" rel="noreferrer">openrouter.ai</a></div>
          </div>
        )}

        {messages.length===0 && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="chat-welcome">
            <div className="cw-emoji">🧠</div>
            <div className="cw-title">Hey {profile.name?.split(' ')[0]||'there'}!</div>
            <div className="cw-sub">
              I'm your AI in <strong>{profile.aiPersonality}</strong> mode.
              {isStudent && ' I know you\'re a student — ask me anything about studying, timetables or decisions.'}
              {isPro    && ' I know you\'re a professional — ask me about work, priorities or career decisions.'}
              {!isStudent&&!isPro && ' Ask me about planning, decisions, or productivity.'}
            </div>
            <div className="quick-prompts">
              {quickPrompts.map(p=>(
                <motion.button key={p} whileHover={{scale:1.02}} whileTap={{scale:.97}} className="qp-btn" onClick={()=>send(p)}>{p}</motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg,i)=>(
            <motion.div key={msg.id||i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.22}}
              className={`chat-msg ${msg.role}`}>
              {msg.role==='assistant'&&<div className="msg-av ai-av">D</div>}
              <div className="msg-bubble">
                <div className="msg-text">{msg.content.split('\n').map((l,j)=><span key={j}>{l}{j<msg.content.split('\n').length-1&&<br/>}</span>)}</div>
                <div className="msg-time">{new Date(msg.ts).toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              {msg.role==='user'&&<div className="msg-av user-av">{profile.name?profile.name[0].toUpperCase():'U'}</div>}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="chat-msg assistant">
            <div className="msg-av ai-av">D</div>
            <div className="msg-bubble typing-bubble">
              <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea ref={inputRef} className="chat-input"
            placeholder={`Message Decimate AI (${profile.aiPersonality} · ${isStudent?'student':isPro?'professional':'dual'})...`}
            value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} rows={1}/>
          <button className={`chat-send ${input.trim()?'active':''}`} onClick={()=>send()} disabled={!input.trim()||loading}>
            {loading?<Spinner size={14}/>:'↑'}
          </button>
        </div>
        <div className="chat-hint">Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  )
}
