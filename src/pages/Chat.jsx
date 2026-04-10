import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useAI } from '../hooks/useAI'
import { Button, Spinner } from '../components/ui.jsx'
import './Chat.css'

const QUICK_PROMPTS = [
  "Create a study plan for today",
  "I'm feeling overwhelmed, help me prioritize",
  "Build a morning routine for me",
  "What should I focus on right now?",
  "Help me overcome procrastination",
  "Plan my coding session",
]

export default function Chat() {
  const messages = useStore(s => s.messages)
  const clearMessages = useStore(s => s.clearMessages)
  const profile = useStore(s => s.profile)
  const { chat, loading } = useAI()

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    await chat(msg, messages.map(m => ({ role: m.role, content: m.content })))
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-ai-avatar">D</div>
        <div>
          <div className="chat-ai-name">Decimate AI</div>
          <div className="chat-ai-status">
            <span className="status-dot" />
            {profile.aiPersonality} mode · Mistral 7B
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearMessages} style={{ marginLeft: 'auto' }}>
          🗑 Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* No API key warning */}
        {!apiKey && (
          <div className="api-warning">
            <div className="aw-icon">⚠️</div>
            <div>
              <div className="aw-title">API Key Not Found</div>
              <div className="aw-text">
                Add <code>VITE_OPENROUTER_API_KEY=your_key</code> to your <code>.env</code> file.<br />
                Get a free key at <a href="https://openrouter.ai" target="_blank" rel="noreferrer">openrouter.ai</a> — it's free!
              </div>
            </div>
          </div>
        )}

        {/* Welcome message */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="chat-welcome">
            <div className="cw-emoji">🧠</div>
            <div className="cw-title">Hey {profile.name?.split(' ')[0] || 'there'}!</div>
            <div className="cw-sub">
              I'm your Decimate AI assistant in <strong>{profile.aiPersonality}</strong> mode.
              Ask me anything — study plans, decision help, productivity tips, or just talk through what's on your mind.
            </div>
            <div className="quick-prompts">
              {QUICK_PROMPTS.map(p => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="qp-btn"
                  onClick={() => send(p)}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`chat-msg ${msg.role}`}
            >
              {msg.role === 'assistant' && (
                <div className="msg-avatar ai-avatar">D</div>
              )}
              <div className="msg-bubble">
                <div className="msg-text">{formatMessage(msg.content)}</div>
                <div className="msg-time">
                  {new Date(msg.ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="msg-avatar user-avatar">
                  {profile.name ? profile.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chat-msg assistant">
            <div className="msg-avatar ai-avatar">D</div>
            <div className="msg-bubble typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={`Message Decimate AI (${profile.aiPersonality} mode)...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
            onClick={() => send()}
            disabled={!input.trim() || loading}
          >
            {loading ? <Spinner size={16} /> : '↑'}
          </button>
        </div>
        <div className="chat-hint">Press Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  )
}

function formatMessage(content) {
  // Strip JSON blocks from display
  const clean = content.replace(/```json[\s\S]*?```/g, '[📅 Schedule generated — check your plans]')
  return clean.split('\n').map((line, i) => (
    <span key={i}>{line}{i < clean.split('\n').length - 1 && <br />}</span>
  ))
}
