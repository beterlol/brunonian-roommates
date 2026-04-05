'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'

interface Props {
  matchId: string
  currentUserId: string
  initialMessages: Message[]
  otherName: string
}

export default function ChatClient({ matchId, currentUserId, initialMessages, otherName }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText('')
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: currentUserId,
      content,
    })
    setSending(false)
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#4e3629]/40 text-sm">Send a message to start the conversation with {otherName}</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-[#4e3629] text-white rounded-br-sm'
                    : 'bg-white text-[#2c1e17] card-shadow rounded-bl-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-white/50' : 'text-[#4e3629]/40'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-[#e8c9a5]">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message…"
          maxLength={1000}
          className="flex-1 px-4 py-3 rounded-xl border border-[#e8c9a5] bg-white text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="px-5 py-3 rounded-xl bg-[#4e3629] text-white font-medium hover:bg-[#3d2a20] transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </>
  )
}
