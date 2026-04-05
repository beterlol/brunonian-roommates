import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiscoverClient from '@/components/DiscoverClient'
import type { Profile } from '@/lib/types'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)
    .order('created_at', { ascending: false })

  // Get current user's liked IDs
  const { data: likes } = await supabase
    .from('likes')
    .select('liked_id')
    .eq('liker_id', user.id)

  const likedIds = new Set((likes ?? []).map((l: { liked_id: string }) => l.liked_id))

  return (
    <DiscoverClient
      profiles={(profiles ?? []) as Profile[]}
      likedIds={Array.from(likedIds)}
      currentUserId={user.id}
    />
  )
}
