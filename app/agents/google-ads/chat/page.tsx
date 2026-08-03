'use client'

import React, { useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Card } from '@/components/agents/ui/Card'
import { ChatMessage } from '@/lib/agents/types'
import { answerQuestion } from '@/lib/agents/aiAssistant'
import { CAMPAIGNS, KEYWORDS, SEARCH_TERMS } from '@/lib/agents/data/mockGoogleAds'
import { useSettings } from '@/components/agents/providers/SettingsProvider'

const SUGGESTIONS = [
  'Hoeveel budget raad je aan?',
  'Waarom is deze campagne slecht?',
  'Welke zoekwoorden moet ik toevoegen?',
  'Waarom is mijn CPC hoog?',
  'Welke campagne levert het meeste geld op?',
]

export default function AiChat() {
  const { settings } = useSettings()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ik ben je Google Ads specialist voor dit account. Vraag me over budget, campagneperformance, zoekwoorden of CPC — ik onderbouw elk antwoord met de actuele cijfers uit je account.',
      timestamp: now(),
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  function send(text: string) {
    if (!text.trim()) return
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const reply = answerQuestion(text, CAMPAIGNS, KEYWORDS, SEARCH_TERMS, settings)
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: now() }])
      setThinking(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }, 500)
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-260px)] min-h-[420px]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                m.role === 'user' ? 'bg-agentice-500 text-agentbase-950 font-medium' : 'bg-white/5 border border-white/8 text-white/85'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-xs text-white/35">
            <Sparkles size={13} className="animate-pulse" /> Analyseert accountdata…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 my-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="text-[11px] rounded-full border border-white/10 text-white/45 px-3 py-1 hover:text-white/80 hover:border-white/20 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stel een vraag over je Google Ads account…"
          className="flex-1 rounded-xl bg-agentbase-700/60 border border-agentbase-border px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-agentice-400/50"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-xl bg-agentice-500 text-agentbase-950 flex items-center justify-center hover:bg-agentice-400 transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </Card>
  )
}

function now() {
  return new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}
