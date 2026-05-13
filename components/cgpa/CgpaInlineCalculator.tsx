'use client'
import { useState } from 'react'

interface Props {
  defaultValue?: string
}

export default function CgpaInlineCalculator({ defaultValue = '' }: Props) {
  const [input, setInput] = useState(defaultValue)

  const num = parseFloat(input)
  const valid = !isNaN(num) && num > 0 && num <= 10
  const result = valid ? (num * 9.5).toFixed(2) : null

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <label className="text-sm font-semibold text-ink-2 block mb-2">
        Enter any CGPA (out of 10)
      </label>
      <div className="flex gap-3 flex-wrap sm:flex-nowrap">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          max="10"
          step="0.01"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. 7.5"
          className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-border text-navy font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
        <button
          type="button"
          onClick={() => setInput(input)}
          className="px-6 py-3 rounded-xl bg-navy text-white font-bold text-sm hover:bg-[#142540] transition-colors whitespace-nowrap"
        >
          Convert
        </button>
      </div>
      <p className="text-xs text-ink-3 mt-1.5">Enter a value between 0.1 and 10.0</p>

      {result && (
        <div className="mt-5 p-5 bg-gradient-to-br from-navy to-[#142540] rounded-xl text-white">
          <div className="text-xs text-white/60 mb-1">Your percentage</div>
          <div className="text-3xl font-bold mb-1">{result}%</div>
          <div className="text-xs text-white/70">{input} × 9.5 = {result}%</div>
        </div>
      )}
      {input && !result && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          Enter a valid CGPA between 0.1 and 10.0.
        </div>
      )}
    </div>
  )
}
