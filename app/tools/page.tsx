'use client'
type ToolMode = 'emi' | 'roi' | 'salary' | 'unit' | 'percent' | 'age' | 'gpa' | 'cgpa'


import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { StickyBottomBar } from '@/components/LeadCapture'
import { formatINR, formatNumber } from '@/lib/format'

// ── EMI Calculator ──────────────────────────────────────────────
function EMICalc() {
  const [fees, setFees] = useState(150000)
  const [months, setMonths] = useState(12)
  const [rate, setRate] = useState(0)
  const emi = rate === 0 ? Math.round(fees/months)
    : Math.round((fees*(rate/100/12)*Math.pow(1+rate/100/12,months))/(Math.pow(1+rate/100/12,months)-1))
  const total = emi * months
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">Total Fees (₹)</span>
          <input type="number" value={fees} onChange={e=>setFees(+e.target.value)} min={10000} max={3000000} step={5000}
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">Tenure</span>
          <select value={months} onChange={e=>setMonths(+e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold">
            {[4,6,8,12,18,24,36].map(m=><option key={m} value={m}>{m} months</option>)}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-[5px]">
        <span className="text-[11px] font-bold text-ink-3 uppercase">Interest Rate — {rate===0?'No-cost EMI':rate+'% p.a.'}</span>
        <input type="range" min={0} max={18} step={0.5} value={rate} onChange={e=>setRate(+e.target.value)} className="accent-amber"/>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {[{l:'Monthly EMI',v:formatINR(emi),hi:true},{l:'Total Cost',v:formatINR(total),hi:false},{l:'Interest',v:rate===0?'₹0':` ${formatINR(total-fees)}`,hi:false}].map(s=>(
          <div key={s.l} style={{padding:14,borderRadius:'var(--r-sm)',textAlign:'center',background:s.hi?'linear-gradient(135deg,#c9922a,#e0a93a)':'var(--surface-2)',border:`1px solid ${s.hi?'transparent':'var(--border)'}`}}>
            <div suppressHydrationWarning style={{fontSize:16,fontWeight:800,color:s.hi?'#fff':'var(--ink)',marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:10,color:s.hi?'rgba(255,255,255,0.8)':'var(--ink-3)',fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MBA ROI Calculator ──────────────────────────────────────────
function ROICalc() {
  const [cur, setCur] = useState(600000)
  const [exp, setExp] = useState(1000000)
  const [fee, setFee] = useState(150000)
  const gain = exp - cur
  const payback = gain > 0 ? Math.round((fee/gain)*12) : null
  const roi5 = gain > 0 ? Math.round(((gain*5-fee)/fee)*100) : 0
  return (
    <div className="flex flex-col gap-3.5">
      {[{l:'Current Annual Salary (₹)',v:cur,s:setCur},{l:'Expected After Degree (₹)',v:exp,s:setExp},{l:'Total Degree Fee (₹)',v:fee,s:setFee}].map(f=>(
        <label key={f.l} className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">{f.l}</span>
          <div className="flex items-center gap-2.5">
            <input type="range" min={100000} max={5000000} step={25000} value={f.v} onChange={e=>f.s(+e.target.value)} style={{flex:1,accentColor:'var(--amber-text)'}}/>
            <span style={{fontSize:14,fontWeight:700,color:'var(--ink)',minWidth:70,textAlign:'right'}}>₹{(f.v/100000).toFixed(1)}L</span>
          </div>
        </label>
      ))}
      <div className="grid grid-cols-3 gap-2">
        {[{l:'Annual Hike',v:`₹${(gain/100000).toFixed(1)}L`,g:gain>0},{l:'Payback',v:payback?`${payback}mo`:'—',g:(payback||99)<36},{l:'5yr ROI',v:`${roi5}%`,g:roi5>100}].map(s=>(
          <div key={s.l} style={{padding:14,borderRadius:'var(--r-sm)',textAlign:'center',background:s.g?'rgba(31,107,82,0.06)':'var(--surface-2)',border:`1px solid ${s.g?'rgba(31,107,82,0.2)':'var(--border)'}`}}>
            <div style={{fontSize:16,fontWeight:800,color:s.g?'var(--sage)':'var(--ink-2)',marginBottom:3}}>{s.v}</div>
            <div className="text-[10px] text-ink-3 font-semibold">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Salary Hike Estimator ───────────────────────────────────────
function SalaryCalc() {
  const [salary, setSalary] = useState(600000)
  const [yoe, setYoe] = useState(3)
  const [prog, setProg] = useState('MBA')
  const hikeMap: Record<string,Record<string,number>> = {
    MBA:{'0-2':35,'3-5':45,'6-10':30,'10+':20},
    MCA:{'0-2':40,'3-5':50,'6-10':35,'10+':25},
    BBA:{'0-2':20,'3-5':25,'6-10':15,'10+':10},
    BCA:{'0-2':30,'3-5':40,'6-10':25,'10+':15},
  }
  const bucket = yoe<=2?'0-2':yoe<=5?'3-5':yoe<=10?'6-10':'10+'
  const pct = hikeMap[prog]?.[bucket]||30
  const newSal = Math.round(salary*(1+pct/100))
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">Program</span>
          <select value={prog} onChange={e=>setProg(e.target.value)} className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold">
            {['MBA','MCA','BBA','BCA'].map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">Years of Experience</span>
          <input type="number" value={yoe} onChange={e=>setYoe(+e.target.value)} min={0} max={20}
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
      </div>
      <label className="flex flex-col gap-[5px]">
        <span className="text-[11px] font-bold text-ink-3 uppercase">Current Salary — ₹{(salary/100000).toFixed(1)}L/yr</span>
        <input type="range" min={200000} max={3000000} step={25000} value={salary} onChange={e=>setSalary(+e.target.value)} className="accent-amber"/>
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <div style={{padding:16,borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',textAlign:'center'}}>
          <div className="text-[11px] text-ink-3 mb-1">CURRENT</div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--ink-3)'}}>₹{(salary/100000).toFixed(1)}L</div>
        </div>
        <div style={{padding:16,borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',textAlign:'center'}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginBottom:4}}>AFTER {prog}</div>
          <div style={{fontSize:22,fontWeight:800,color:'#fff'}}>₹{(newSal/100000).toFixed(1)}L</div>
        </div>
      </div>
      <div style={{padding:'10px 14px',background:'rgba(31,107,82,0.06)',borderRadius:'var(--r-xs)',fontSize:12,color:'var(--sage)',fontWeight:600,textAlign:'center'}}>
        Estimated {pct}% hike → +₹{((newSal-salary)/100000).toFixed(1)}L per year
      </div>
    </div>
  )
}

// ── Unit Converter (length, weight, temp, currency) ─────────────
function UnitConverter() {
  const [category, setCategory] = useState('length')
  const [from, setFrom] = useState('')
  const [fromUnit, setFromUnit] = useState('km')
  const [toUnit, setToUnit] = useState('miles')

  const CATS: Record<string, { units: string[]; convert: (v: number, f: string, t: string) => number }> = {
    length: {
      units: ['km','miles','meters','feet','inches','cm'],
      convert: (v,f,t) => {
        const toM: Record<string,number> = {km:1000,miles:1609.34,meters:1,feet:0.3048,inches:0.0254,cm:0.01}
        return v * toM[f] / toM[t]
      }
    },
    weight: {
      units: ['kg','lbs','grams','ounces','tonnes'],
      convert: (v,f,t) => {
        const toG: Record<string,number> = {kg:1000,lbs:453.592,grams:1,ounces:28.3495,tonnes:1000000}
        return v * toG[f] / toG[t]
      }
    },
    temperature: {
      units: ['Celsius','Fahrenheit','Kelvin'],
      convert: (v,f,t) => {
        let c = f==='Fahrenheit'?(v-32)*5/9:f==='Kelvin'?v-273.15:v
        return t==='Fahrenheit'?c*9/5+32:t==='Kelvin'?c+273.15:c
      }
    },
    data: {
      units: ['bytes','KB','MB','GB','TB'],
      convert: (v,f,t) => {
        const pow: Record<string,number> = {bytes:0,KB:1,MB:2,GB:3,TB:4}
        return v * Math.pow(1024, pow[f]-pow[t])
      }
    }
  }

  const cat = CATS[category]
  const result = from && !isNaN(+from) ? cat.convert(+from, fromUnit, toUnit) : null
  const fmt = (n: number) => n < 0.001 ? n.toExponential(4) : n > 1000000 ? n.toExponential(4) : parseFloat(n.toPrecision(6)).toString()

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(CATS).map(c=>(
          <button key={c} onClick={()=>{setCategory(c);setFrom('');setFromUnit(CATS[c].units[0]);setToUnit(CATS[c].units[1])}}
            style={{padding:'6px 14px',borderRadius:'var(--r-lg)',fontSize:12,fontWeight:600,cursor:'pointer',border:'none',background:category===c?'var(--ink)':'var(--surface-3)',color:category===c?'#fff':'var(--ink-2)'}}>
            {c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,alignItems:'end'}}>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">From</span>
          <select value={fromUnit} onChange={e=>setFromUnit(e.target.value)} className="px-2.5 py-2 rounded-lg border border-border text-[13px] mb-1.5">
            {cat.units.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
          <input type="number" value={from} onChange={e=>setFrom(e.target.value)} placeholder="Enter value"
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
        <div style={{fontSize:20,color:'var(--ink-4)',paddingBottom:4,textAlign:'center'}}>→</div>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">To</span>
          <select value={toUnit} onChange={e=>setToUnit(e.target.value)} className="px-2.5 py-2 rounded-lg border border-border text-[13px] mb-1.5">
            {cat.units.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
          <div style={{padding:'10px 12px',borderRadius:'var(--r-xs)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',fontSize:14,fontWeight:800,color:'#fff',minHeight:44,display:'flex',alignItems:'center'}}>
            {result !== null ? fmt(result) : '—'}
          </div>
        </label>
      </div>
    </div>
  )
}

// ── Percentage Calculator ───────────────────────────────────────
function PercentCalc() {
  const [mode, setMode] = useState<'pct_of'|'what_pct'|'pct_change'>('pct_of')
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  const compute = () => {
    const x = +a, y = +b
    if (!a || !b || isNaN(x) || isNaN(y)) return null
    if (mode==='pct_of') return (x/100)*y
    if (mode==='what_pct') return (x/y)*100
    if (mode==='pct_change') return ((y-x)/Math.abs(x))*100
    return null
  }
  const res = compute()

  const MODES = [
    {id:'pct_of',l:'% of a number',q:`What is ${a||'X'}% of ${b||'Y'}?`},
    {id:'what_pct',l:'X is what % of Y',q:`${a||'X'} is what % of ${b||'Y'}?`},
    {id:'pct_change',l:'% change',q:`From ${a||'X'} to ${b||'Y'} — what % change?`},
  ]

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-1.5">
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id as any)}
            style={{padding:'6px 14px',borderRadius:'var(--r-lg)',fontSize:12,fontWeight:600,cursor:'pointer',border:'none',background:mode===m.id?'var(--ink)':'var(--surface-3)',color:mode===m.id?'#fff':'var(--ink-2)'}}>
            {m.l}
          </button>
        ))}
      </div>
      <div className="text-[13px] text-ink-3">{MODES.find(m=>m.id===mode)?.q}</div>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">{mode==='pct_of'?'Percentage':mode==='pct_change'?'From Value':'Value (X)'}</span>
          <input type="number" value={a} onChange={e=>setA(e.target.value)} placeholder="Enter number"
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">{mode==='pct_of'?'Of Number':mode==='pct_change'?'To Value':'Total (Y)'}</span>
          <input type="number" value={b} onChange={e=>setB(e.target.value)} placeholder="Enter number"
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
      </div>
      {res !== null && (
        <div style={{padding:'16px',background:'linear-gradient(135deg,#0B1D35,#142540)',borderRadius:'var(--r-sm)',textAlign:'center'}}>
          <div style={{fontSize:28,fontWeight:800,color:'var(--amber-vivid)',marginBottom:4}}>{parseFloat(res.toPrecision(6))}
            {mode!=='pct_of'?'%':''}</div>
          <div className="text-xs text-slate-400">
            {mode==='pct_of'?`${a}% of ${b} = ${parseFloat(res.toPrecision(6))}`
             :mode==='what_pct'?`${a} is ${parseFloat(res.toPrecision(4))}% of ${b}`
             :`Change from ${a} to ${b}: ${res>=0?'+':''}${parseFloat(res.toPrecision(4))}%`}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Age Calculator ──────────────────────────────────────────────
function AgeCalc() {
  const [dob, setDob] = useState('')
  const calc = () => {
    if (!dob) return null
    const d = new Date(dob), now = new Date()
    let y = now.getFullYear()-d.getFullYear(), m = now.getMonth()-d.getMonth()
    let days = now.getDate()-d.getDate()
    if (days<0){m--;days+=new Date(now.getFullYear(),now.getMonth(),0).getDate()}
    if (m<0){y--;m+=12}
    const totalDays = Math.floor((now.getTime()-d.getTime())/(1000*60*60*24))
    return {y,m,days,totalDays}
  }
  
  const getNextBirthday = () => {
    if (!dob) return '—'
    const d = new Date(dob)
    const now = new Date()
    d.setFullYear(now.getFullYear())
    if (d.getTime() < now.getTime()) d.setFullYear(now.getFullYear() + 1)
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff <= 0 ? 'Today! 🎂' : `${diff} days away`
  }
  
  const getStarSign = () => {
    if (!dob) return '—'
    const m = new Date(dob).getMonth() + 1
    const d = new Date(dob).getDate()
    const signs: Array<[string, number, number]> = [
      ['Capricorn', 12, 22], ['Aquarius', 1, 20], ['Pisces', 2, 19],
      ['Aries', 3, 21], ['Taurus', 4, 20], ['Gemini', 5, 21],
      ['Cancer', 6, 21], ['Leo', 7, 23], ['Virgo', 8, 23],
      ['Libra', 9, 23], ['Scorpio', 10, 23], ['Sagittarius', 11, 22],
      ['Capricorn', 12, 31]
    ]
    for (const [name, sm, sd] of signs) {
      if ((m === sm && d >= sd) || (m === (sm % 12) + 1 && d < 20)) return name
    }
    return '—'
  }
  
  const res = calc()
  const stats = res ? [
    { l: 'Age', v: `${res.y} years, ${res.m} months` },
    { l: 'Total Days Lived', v: formatNumber(res.totalDays) + '+ days' },
    { l: 'Next Birthday', v: getNextBirthday() },
    { l: 'Star Sign', v: getStarSign() }
  ] : []
  
  return (
    <div className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-[5px]">
        <span className="text-[11px] font-bold text-ink-3 uppercase">Date of Birth</span>
        <input type="date" value={dob} onChange={e=>setDob(e.target.value)} max={new Date().toISOString().split('T')[0]}
          style={{padding:'10px 12px',borderRadius:'var(--r-xs)',border:'1px solid var(--border)',fontSize:14}}/>
      </label>
      {res && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {stats.map(s=>(
            <div key={s.l} style={{padding:'12px 14px',background:'var(--surface-2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,color:'var(--ink-3)',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>{s.l}</div>
              <div suppressHydrationWarning className="text-sm font-bold text-navy">{s.v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── GPA / Percentage Converter ──────────────────────────────────
function GPACalc() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'pct_to_gpa'|'gpa_to_pct'|'cgpa_to_pct'>('pct_to_gpa')
  const compute = () => {
    const v = +input
    if (!input || isNaN(v)) return null
    if (mode==='pct_to_gpa') return v>=40?Math.min(10,(v-40)/6+4).toFixed(2):'Below passing'
    if (mode==='gpa_to_pct') return v>0&&v<=10?((v-4)*6+40).toFixed(1)+'%':'Invalid GPA'
    if (mode==='cgpa_to_pct') return v>0&&v<=10?(v*9.5).toFixed(1)+'% (approx)':'Invalid CGPA'
    return null
  }
  const res = compute()
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-1.5">
        {[{id:'pct_to_gpa',l:'% → GPA (10)'},{id:'gpa_to_pct',l:'GPA → %'},{id:'cgpa_to_pct',l:'CGPA → % (Anna/VTU)'}].map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id as any);setInput('')}}
            style={{padding:'6px 12px',borderRadius:'var(--r-lg)',fontSize:11,fontWeight:600,cursor:'pointer',border:'none',background:mode===m.id?'var(--ink)':'var(--surface-3)',color:mode===m.id?'#fff':'var(--ink-2)'}}>
            {m.l}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-[5px]">
        <span className="text-[11px] font-bold text-ink-3 uppercase">
          {mode==='pct_to_gpa'?'Percentage (%)':'GPA / CGPA'}
        </span>
        <input type="number" value={input} onChange={e=>setInput(e.target.value)}
          placeholder={mode==='pct_to_gpa'?'e.g. 75':'e.g. 7.5'}
          step={0.1} className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
      </label>
      {res && (
        <div style={{padding:16,background:'linear-gradient(135deg,#0B1D35,#142540)',borderRadius:'var(--r-sm)',textAlign:'center'}}>
          <div style={{fontSize:26,fontWeight:800,color:'var(--amber-vivid)'}}>{res}</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on common Indian university grading scales</div>
        </div>
      )}
    </div>
  )
}

// ── CGPA Quick Calc (inline preview; full tool at /tools/cgpa-calculator) ──
function CGPAQuickCalc() {
  const [cgpa, setCgpa] = useState('')
  const [pct, setPct] = useState('')
  const cgpaResult = cgpa && !isNaN(+cgpa) && +cgpa > 0 && +cgpa <= 10 ? (+cgpa * 9.5).toFixed(2) : null
  const pctResult  = pct  && !isNaN(+pct)  && +pct  > 0 && +pct  <= 100 ? (+pct  / 9.5).toFixed(2) : null
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">CGPA (out of 10)</span>
          <input type="number" value={cgpa} onChange={e=>setCgpa(e.target.value)} min={0} max={10} step={0.01} placeholder="e.g. 8.75"
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold text-ink-3 uppercase">Percentage (%)</span>
          <input type="number" value={pct} onChange={e=>setPct(e.target.value)} min={0} max={100} step={0.01} placeholder="e.g. 75.5"
            className="px-3 py-2.5 rounded-lg border border-border text-sm font-semibold"/>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div style={{padding:14,borderRadius:'var(--r-sm)',textAlign:'center',background:'linear-gradient(135deg,#c9922a,#e0a93a)'}}>
          <div suppressHydrationWarning style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:3}}>{cgpaResult ? cgpaResult+'%' : '—'}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.8)',fontWeight:600}}>CGPA → Percentage</div>
        </div>
        <div style={{padding:14,borderRadius:'var(--r-sm)',textAlign:'center',background:'var(--surface-2)',border:'1px solid var(--border)'}}>
          <div suppressHydrationWarning style={{fontSize:18,fontWeight:800,color:'var(--ink)',marginBottom:3}}>{pctResult ? pctResult+' / 10' : '—'}</div>
          <div style={{fontSize:10,color:'var(--ink-3)',fontWeight:600}}>% → CGPA</div>
        </div>
      </div>
      <div style={{fontSize:11,color:'var(--ink-3)',textAlign:'center'}}>Formula: Percentage = CGPA × 9.5 (UGC standard)</div>
      <Link href="/tools/cgpa-calculator" style={{display:'block',textAlign:'center',padding:'8px 16px',borderRadius:'var(--r-sm)',background:'var(--ink)',color:'#fff',fontSize:12,fontWeight:700,textDecoration:'none'}}>
        Full CGPA Calculator + Table →
      </Link>
    </div>
  )
}

const TOOLS = [
  {id:'emi',icon:'📊',label:'EMI Calculator',desc:'Monthly payment for any fee',component:<EMICalc/>},
  {id:'roi',icon:'📈',label:'MBA ROI',desc:'Is your degree worth it?',component:<ROICalc/>},
  {id:'salary',icon:'💰',label:'Salary Estimator',desc:'Expected hike after degree',component:<SalaryCalc/>},
  {id:'unit',icon:'🔄',label:'Unit Converter',desc:'Length, weight, temp, data',component:<UnitConverter/>},
  {id:'pct',icon:'%',label:'Percentage Calc',desc:'% of, % change, what %',component:<PercentCalc/>},
  {id:'age',icon:'🎂',label:'Age Calculator',desc:'Age, days lived, birthday',component:<AgeCalc/>},
  {id:'gpa',icon:'🎓',label:'GPA ↔ Percentage',desc:'Convert GPA/CGPA/marks',component:<GPACalc/>},
  {id:'cgpa',icon:'📐',label:'CGPA Calculator',desc:'CGPA ↔ % · Full table',component:<CGPAQuickCalc/>},
]

export default function ToolsPage() {
  const [active, setActive] = useState('emi')
  const tool = TOOLS.find(t=>t.id===active)!

  return (
    <>
      <StickyBottomBar label="Free University Counselling — 2 min"/>
      <div className="page-shell">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
              <Link href="/" className="text-ink-2 no-underline">Home</Link>
              <ChevronRight size={12}/>
              <span className="text-amber font-semibold">Free Tools</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white border-b border-border py-7">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2">Free Tools</div>
            <h1 style={{fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:800,color:'var(--ink)',margin:'0 0 8px',lineHeight:1.2}}>Daily Calculators & Converters</h1>
            <p className="body-sm m-0">8 free tools — EMI, ROI, salary, unit converter, percentage, age, GPA & CGPA calculator.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-5 items-start flex-wrap">

            {/* Tool list sidebar */}
            <div style={{width:180,flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
              {TOOLS.map(t=>(
                <button key={t.id} onClick={()=>setActive(t.id)} style={{ padding:'10px 14px',borderRadius:'var(--r-sm)',border:'none',cursor:'pointer',textAlign:'left', background:active===t.id?'rgba(200,129,26,0.1)':'transparent', borderLeft:active===t.id?'3px solid #C8811A':'3px solid transparent', transition:'all 0.15s' }}>
                  <div style={{fontSize:14,marginBottom:2}}>{t.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:active===t.id?'var(--amber-text)':'var(--ink)'}}>{t.label}</div>
                  <div className="text-[10px] text-slate-400">{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Active tool */}
            <div style={{flex:1,minWidth:0,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',overflow:'hidden'}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',background:'rgba(200,129,26,0.04)'}}>
                <div className="text-base font-extrabold text-navy">{tool.icon} {tool.label}</div>
                <div className="text-xs text-ink-3 mt-0.5">{tool.desc}</div>
              </div>
              <div style={{padding:'20px'}}>{tool.component}</div>
            </div>
          </div>

          {/* CTA */}
          <div style={{marginTop:24,padding:'20px 24px',background:'linear-gradient(135deg,#0B1D35,#142540)',borderRadius:'var(--r-md)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
            <div>
              <div className="text-sm font-bold text-white mb-1">Need help choosing the right university?</div>
              <div className="text-xs text-slate-400">Free counselling — Edify evaluates 3–4 stages before recommending. Zero paid rankings.</div>
            </div>
            <Link href="/universities" style={{padding:'11px 20px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap'}}>
              Browse Universities →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
