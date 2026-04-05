'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  targetId: string
  currentUserId: string
  initialLiked: boolean
  isMatch: boolean
}

export default function LikeButton({ targetId, currentUserId, initialLiked, isMatch }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    const supabase = createClient()

    if (liked) {
      // Unlike
      await supabase.from('likes').delete()
        .eq('liker_id', currentUserId).eq('liked_id', targetId)
      setLiked(false)
    } else {
      // Like
      await supabase.from('likes').insert({ liker_id: currentUserId, liked_id: targetId })
      setLiked(true)
      // Check for mutual like → create match
      const { data: mutualLike } = await supabase
        .from('likes')
        .select('id')
        .eq('liker_id', targetId)
        .eq('liked_id', currentUserId)
        .single()

      if (mutualLike) {
        const [a, b] = [currentUserId, targetId].sort()
        await supabase.from('matches').upsert({ user1_id: a, user2_id: b })
        router.refresh()
      }
    }
    setLoading(false)
    router.refresh()
  }

  if (isMatch) return null

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 ${
        liked
          ? 'bg-[#f5e6d3] text-[#c4853a] border border-[#e8c9a5]'
          : 'bg-[#4e3629] text-white hover:bg-[#3d2a20]'
      }`}
    >
      {liked ? 'Liked' : 'Connect'}
    </button>
  )
}
