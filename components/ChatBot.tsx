'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type Role = 'user' | 'assistant'
type Preset = 'trader' | 'explainer'

interface ChatMessage { role: Role; content: string }

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<Preset>('trader')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [size, setSize] = useState<{ w: number; h: number }>(() => {
    if (typeof window === 'undefined') return { w: 520, h: 680 }
    const saved = window.localStorage.getItem('chatbot:size')
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    return { w: Math.min(520, vw - 40), h: Math.min(680, vh - 120) }
  })
  const minSize = { w: 420, h: 500 }
  const maxSize = { w: 720, h: 880 }
  const [resizing, setResizing] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const mode: 'marketing' | 'app' = useMemo(() => {
    if (!pathname) return 'marketing'
    return pathname.startsWith('/dashboard') || pathname.startsWith('/auth') ? 'app' : 'marketing'
  }, [pathname])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('chatbot:size', JSON.stringify(size))
    }
  }, [size])

  const placeholder = useMemo(() => (
    preset === 'trader' ? 'Ask for an entry/exit plan…' : 'Ask a trading concept…'
  ), [preset])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
  const next: ChatMessage[] = [...messages, { role: 'user' as Role, content: text }]
  setMessages(next)
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset,
          // Only send this widget's conversation – independent from AI coach
          messages: next.map(m => ({ role: m.role, content: m.content })),
          context: { pathname, mode },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chat failed')
      setMessages((curr) => [...curr, { role: 'assistant', content: data.reply }])
      // Scroll to bottom
      requestAnimationFrame(() => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
      })
    } catch (e) {
      setMessages((curr) => [...curr, { role: 'assistant', content: 'Sorry, I could not process that.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Floating button, independent from AI recommendations */}
      <button
        aria-label="Open Chat"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: '#007AFF',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 1100,
          fontSize: '24px',
          display: open ? 'none' : 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        💬
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '96px',
            width: `${size.w}px`,
            maxWidth: 'calc(100vw - 32px)',
            height: `${size.h}px`,
            background: 'white',
            border: '1px solid #E5E5E7',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1200,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #E5E5E7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, color: '#1D1D1F' }}>Chat</span>
              <select
                aria-label="Chat preset"
                value={preset}
                onChange={(e) => setPreset(e.target.value as Preset)}
                style={{
                  border: '1px solid #D1D1D6',
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontSize: 12,
                  color: '#1D1D1F',
                  background: 'white',
                }}
              >
                <option value="trader">Trader</option>
                <option value="explainer">Tutor</option>
              </select>
              <span title="Guardrails enabled: product-scope only; no IP disclosure" style={{
                fontSize: 10,
                color: '#2F855A',
                background: '#E6F7EE',
                border: '1px solid #D1F0DF',
                padding: '2px 6px',
                borderRadius: 8,
                marginLeft: 4,
                whiteSpace: 'nowrap'
              }}>🔒 IP protected</span>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              style={{ border: '1px solid #E5E5E7', background: 'white', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={containerRef} style={{ flex: 1, padding: '12px', overflowY: 'auto', background: '#FAFAFA' }}>
            {messages.length === 0 && (
              <div style={{ color: '#8E8E93', fontSize: 13 }}>
                {preset === 'trader' ? 'Ask for a swing plan (entry, stop, target)…' : 'Ask to clarify a trading concept…'}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                margin: '8px 0',
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 10px',
                  borderRadius: 12,
                  background: m.role === 'user' ? '#007AFF' : 'white',
                  color: m.role === 'user' ? 'white' : '#1D1D1F',
                  border: m.role === 'user' ? 'none' : '1px solid #E5E5E7',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 10, borderTop: '1px solid #E5E5E7', background: 'white' }}>
            <textarea
              ref={inputRef as any}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setOpen(false); return }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
              }}
              placeholder={placeholder}
              rows={1}
              style={{ flex: 1, border: '1px solid #D1D1D6', borderRadius: 10, padding: '10px 12px', fontSize: 14, resize: 'none', maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={busy}
              style={{ border: 'none', background: busy ? '#8E8E93' : '#007AFF', color: 'white', borderRadius: 10, padding: '10px 14px', height: 40, cursor: busy ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >
              Send
            </button>
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setResizing(true)
              const startX = e.clientX
              const startY = e.clientY
              const startW = size.w
              const startH = size.h
              const onMove = (ev: MouseEvent) => {
                const dw = ev.clientX - startX
                const dh = ev.clientY - startY
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
                setSize({
                  w: Math.max(minSize.w, Math.min(maxSize.w, Math.min(startW + dw, vw - 32))),
                  h: Math.max(minSize.h, Math.min(maxSize.h, Math.min(startH + dh, vh - 140)))
                })
              }
              const onUp = () => {
                setResizing(false)
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
            style={{
              position: 'absolute',
              right: 6,
              bottom: 6,
              width: 16,
              height: 16,
              cursor: 'nwse-resize',
              borderBottom: '2px solid #D1D1D6',
              borderRight: '2px solid #D1D1D6',
              borderRadius: 2,
              opacity: resizing ? 1 : 0.7,
              background: 'transparent'
            }}
            aria-label="Resize chat"
          />
        </div>
      )}
    </>
  )
}
