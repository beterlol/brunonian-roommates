import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Profile, Match } from '@/lib/types'

type MatchWithProfile = Match & { other: Profile }

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const enriched: MatchWithProfile[] = []
  for (const match of (matches ?? []) as Match[]) {
    const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', otherId).single()
    if (profile) enriched.push({ ...match, other: profile as Profile })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2c1e17] mb-6">Your matches</h1>

      {enriched.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#4e3629]/60 font-medium">No matches yet</p>
          <p className="text-sm text-[#4e3629]/40 mt-2">Start connecting with people in the discover feed</p>
          <Link href="/discover" className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-[#4e3629] text-white text-sm font-medium hover:bg-[#3d2a20] transition-colors">
            Browse profiles
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map(match => (
            <Link
              key={match.id}
              href={`/chat/${match.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl card-shadow card-shadow-hover transition-shadow"
            >
              <div className="relative w-14 h-14 rounded-xl bg-[#f5e6d3] flex-shrink-0 overflow-hidden">
                {match.other.photo_url ? (
                  <Image src={match.other.photo_url} alt={match.other.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm font-semibold text-[#4e3629]/30">{match.other.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2c1e17]">{match.other.name}</p>
                <p className="text-sm text-[#4e3629]/50 truncate">
                  {[match.other.school_year, match.other.housing_type].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="text-[#c4853a] text-sm font-medium">Chat →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
