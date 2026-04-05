import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from '@/components/ChatClient'
import Image from 'next/image'
import Link from 'next/link'
import type { Profile, Message } from '@/lib/types'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: matchData } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single()

  if (!matchData) notFound()
  const match = matchData as { id: string; user1_id: string; user2_id: string; created_at: string }

  const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id
  const { data: other } = await supabase.from('profiles').select('*').eq('id', otherId).single()
  if (!other) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#e8c9a5] mb-4">
        <Link href="/matches" className="text-[#4e3629]/60 hover:text-[#4e3629] transition-colors">
          ←
        </Link>
        <div className="relative w-10 h-10 rounded-xl bg-[#f5e6d3] overflow-hidden">
          {(other as Profile).photo_url ? (
            <Image src={(other as Profile).photo_url!} alt={(other as Profile).name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-lg">👤</div>
          )}
        </div>
        <div>
          <Link href={`/profile/${otherId}`} className="font-semibold text-[#2c1e17] hover:text-[#c4853a] transition-colors">
            {(other as Profile).name}
          </Link>
          <p className="text-xs text-[#4e3629]/50">{(other as Profile).school_year}</p>
        </div>
      </div>

      <ChatClient
        matchId={matchId}
        currentUserId={user.id}
        initialMessages={(messages ?? []) as Message[]}
        otherName={(other as Profile).name}
      />
    </div>
  )
}
