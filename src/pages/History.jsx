import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Badge, Modal, AiText } from '../components/ui.jsx'
import './History.css'

const TYPE_CFG={decision:{icon:'⚡',color:'var(--gold)',badge:'gold',label:'Decision'},plan:{icon:'📅',color:'var(--cyan)',badge:'cyan',label:'Plan'}}
const DEMO=[
  {id:1,type:'decision',title:'Decision: Study vs Gym',choices:['Study Data Structures','Go to the gym','Take a power nap'],result:'BEST CHOICE: Study Data Structures\nWHY: Given your upcoming exam and the energy you have right now, studying is the highest ROI activity. The exam is time-sensitive and gym can be rescheduled.\nTRADE-OFF: You miss the physical reset a gym session would provide.',createdAt:new Date(Date.now()-3600000).toISOString()},
  {id:2,type:'plan',title:'Student Timetable — Monday',result:'TIMETABLE TITLE: Monday Study Plan\nDATE: Today\n\nTIME BLOCKS:\n07:00 – 07:30 | Morning Routine | 30 mins | Light exercise, breakfast\n08:00 – 09:30 | Data Structures | 90 mins | Peak focus block\n09:30 – 09:45 | Break | 15 mins | Step away from screen\n09:45 – 11:30 | Physics Revision | 105 mins | Chapter 4 and 5\n\nSTUDY TIPS:\n- Take a 10-min walk between sessions\n- Silence notifications during focus blocks',createdAt:new Date(Date.now()-86400000).toISOString()},
]
function rel(iso){const d=Date.now()-new Date(iso).getTime(),m=Math.floor(d/60000);if(m<60)return m+'m ago';const h=Math.floor(m/60);if(h<24)return h+'h ago';return Math.floor(h/24)+'d ago'}

export default function History(){
  const history=useStore(s=>s.history)
  const [filter,setFilter]=useState('all')
  const [sel,setSel]=useState(null)
  const all=history.length>0?history:DEMO
  const filtered=filter==='all'?all:all.filter(h=>h.type===filter)
  return(
    <div className="history-page">
      <div className="history-top">
        <div><h2 className="history-title">History</h2><p className="history-sub">{all.length} saved item{all.length!==1?'s':''}</p></div>
        <div className="hfilters">
          {[['all','All'],['decision','Decisions'],['plan','Plans']].map(([v,l])=>(
            <button key={v} className={`hfbtn ${filter===v?'hfbtn-on':''}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      {filtered.length===0?(<div className="history-empty"><div style={{fontSize:36,opacity:.4}}>📋</div><div className="he-title">No {filter==='all'?'items':filter+'s'} yet</div><div className="he-sub">Use Help Me Decide to create decisions and plans</div></div>):(
        <div className="history-list">
          {filtered.map((item,i)=>{
            const cfg=TYPE_CFG[item.type]||TYPE_CFG.decision
            return(
              <motion.div key={item.id||i} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}
                className="history-card" onClick={()=>setSel(item)}>
                <div className="hc-icon" style={{background:`${cfg.color}14`,border:`1px solid ${cfg.color}28`}}>{cfg.icon}</div>
                <div className="hc-body">
                  <div className="hc-title">{item.title}</div>
                  {item.choices&&<div className="hc-choices">Options: {item.choices.join(' · ')}</div>}
                  <div className="hc-meta">{rel(item.createdAt)}</div>
                </div>
                <div className="hc-right"><Badge color={cfg.badge}>{cfg.label}</Badge><div className="hc-arrow">›</div></div>
              </motion.div>
            )
          })}
        </div>
      )}
      {history.length===0&&<div className="demo-note">📌 Showing demo data. Real items appear after using Help Me Decide.</div>}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.type==='decision'?'⚡ Decision Detail':'📅 Plan Detail'} wide>
        {sel&&(
          <div className="detail-modal">
            <div className="dm-meta"><Badge color={TYPE_CFG[sel.type]?.badge||'gold'}>{TYPE_CFG[sel.type]?.label}</Badge><span className="dm-time">{new Date(sel.createdAt).toLocaleString('en-KE')}</span></div>
            <div className="dm-title">{sel.title}</div>
            {sel.choices&&sel.choices.length>0&&(<div className="dm-section"><div className="dm-section-lbl">Options considered</div><div className="dm-chips">{sel.choices.map((c,i)=><span key={i} className="dm-chip">{c}</span>)}</div></div>)}
            {sel.context&&(<div className="dm-section"><div className="dm-section-lbl">Context provided</div><div className="dm-context">{sel.context}</div></div>)}
            <div className="dm-section"><div className="dm-section-lbl">{sel.type==='decision'?'AI Recommendation':'AI Generated Plan'}</div><div className="dm-result"><AiText text={sel.result}/></div></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
