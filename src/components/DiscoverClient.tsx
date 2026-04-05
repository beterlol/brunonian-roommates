'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Profile, FeedFilters } from '@/lib/types'

interface Props {
  profiles: Profile[]
  likedIds: string[]
  currentUserId: string
}

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior']

export default function DiscoverClient({ profiles, likedIds: initialLikedIds, currentUserId }: Props) {
  const [filters, setFilters] = useState<FeedFilters>({ gender: '', school_year: '', housing_type: '' })
  const [likedIds, setLikedIds] = useState(new Set(initialLikedIds))
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const supabase = createClient()

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      if (filters.gender && p.gender?.toLowerCase() !== filters.gender.toLowerCase()) return false
      if (filters.school_year && p.school_year !== filters.school_year) return false
      if (filters.housing_type && p.housing_type !== filters.housing_type) return false
      return true
    })
  }, [profiles, filters])

  const genders = useMemo(() => {
    const gs = profiles.map(p => p.gender).filter(Boolean) as string[]
    return Array.from(new Set(gs))
  }, [profiles])

  const toggleLike = async (targetId: string) => {
    if (loadingId) return
    setLoadingId(targetId)
    const isLiked = likedIds.has(targetId)
    if (isLiked) {
      await supabase.from('likes').delete()
        .eq('liker_id', currentUserId).eq('liked_id', targetId)
      setLikedIds(prev => { const s = new Set(prev); s.delete(targetId); return s })
    } else {
      await supabase.from('likes').insert({ liker_id: currentUserId, liked_id: targetId })
      setLikedIds(prev => new Set([...prev, targetId]))
      // Check for match
      const { data: mutual } = await supabase
        .from('likes').select('id')
        .eq('liker_id', targetId).eq('liked_id', currentUserId).single()
      if (mutual) {
        const [a, b] = [currentUserId, targetId].sort()
        await supabase.from('matches').upsert({ user1_id: a, user2_id: b })
      }
    }
    setLoadingId(null)
  }

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#4e3629] text-white border-[#4e3629]'
          : 'border-[#e8c9a5] text-[#4e3629]/70 hover:border-[#4e3629] hover:text-[#4e3629]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2c1e17] mb-4">Discover roommates</h1>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[#4e3629]/50 font-medium mr-1">Year:</span>
          {YEARS.map(y => chip(y, filters.school_year === y, () =>
            setFilters(f => ({ ...f, school_year: f.school_year === y ? '' : y }))
          ))}
          <span className="text-sm text-[#4e3629]/50 font-medium ml-3 mr-1">Housing:</span>
          {chip('General', filters.housing_type === 'General', () =>
            setFilters(f => ({ ...f, housing_type: f.housing_type === 'General' ? '' : 'General' }))
          )}
          {chip('GPT', filters.housing_type === 'GPT', () =>
            setFilters(f => ({ ...f, housing_type: f.housing_type === 'GPT' ? '' : 'GPT' }))
          )}
          {genders.length > 0 && <>
            <span className="text-sm text-[#4e3629]/50 font-medium ml-3 mr-1">Gender:</span>
            {genders.map(g => chip(g, filters.gender === g, () =>
              setFilters(f => ({ ...f, gender: f.gender === g ? '' : g }))
            ))}
          </>}
          {(filters.school_year || filters.housing_type || filters.gender) && (
            <button
              onClick={() => setFilters({ gender: '', school_year: '', housing_type: '' })}
              className="ml-2 text-sm text-[#c4853a] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#4e3629]/40">
          <p>No profiles match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              liked={likedIds.has(profile.id)}
              loading={loadingId === profile.id}
              onLike={() => toggleLike(profile.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileCard({
  profile,
  liked,
  loading,
  onLike,
}: {
  profile: Profile
  liked: boolean
  loading: boolean
  onLike: () => void
}) {
  return (
    <div className="bg-white rounded-2xl card-shadow card-shadow-hover overflow-hidden transition-shadow">
      <Link href={`/profile/${profile.id}`}>
        <div className="relative h-52 bg-[#f5e6d3]">
          {profile.photo_url ? (
            <Image src={profile.photo_url} alt={profile.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl font-semibold text-[#4e3629]/30">{profile.name.charAt(0).toUpperCase()}</div>
          )}
          {profile.school_year && (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-xs rounded-full bg-white/90 text-[#4e3629] font-medium backdrop-blur-sm">
              {profile.school_year}
            </span>
          )}
          {profile.housing_type && (
            <span className="absolute top-3 right-3 px-2.5 py-1 text-xs rounded-full bg-white/90 text-[#4e3629] font-medium backdrop-blur-sm">
              {profile.housing_type}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/profile/${profile.id}`}>
          <h3 className="font-semibold text-[#2c1e17] hover:text-[#c4853a] transition-colors">{profile.name}</h3>
          {profile.gender && <p className="text-xs text-[#4e3629]/50 mt-0.5">{profile.gender}</p>}
          {profile.bio && (
            <p className="text-sm text-[#4e3629]/70 mt-2 line-clamp-2 leading-relaxed">{profile.bio}</p>
          )}
        </Link>
        <button
          onClick={onLike}
          disabled={loading}
          className={`mt-3 w-full py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
            liked
              ? 'bg-[#f5e6d3] text-[#c4853a] border border-[#e8c9a5]'
              : 'bg-[#4e3629] text-white hover:bg-[#3d2a20]'
          }`}
        >
          {loading ? '…' : liked ? 'Liked' : 'Connect'}
        </button>
      </div>
    </div>
  )
}
