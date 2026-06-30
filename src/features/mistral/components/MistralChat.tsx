'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

export function MistralChat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/mistral-chat' }),
  })
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isBusy = status === 'submitted' || status === 'streaming'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isBusy) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-white/50">Ask Mistral anything…</p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2',
                message.role === 'user' ? 'bg-[#fa520f] text-white' : 'bg-black/40 text-white',
              )}
            >
              {message.parts.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-black/40 p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="max-h-32 flex-1 resize-none rounded-md border border-black/40 bg-black/20 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none"
        />
        {isBusy ? (
          <Button type="button" onClick={() => stop()} className="bg-black hover:bg-black/70">
            Stop
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim()} className="bg-[#fa520f] hover:bg-[#fa520f]/80">
            Send
          </Button>
        )}
      </form>
    </div>
  )
}
