import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import LikeButton from '@/components/LikeButton'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user.id === id

  // Check if current user already liked this profile
  let hasLiked = false
  let isMatch = false
  if (!isOwnProfile) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', user.id)
      .eq('liked_id', id)
      .single()
    hasLiked = !!like

    const { data: match } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`)
      .single()
    isMatch = !!match
  }

  const badges = [
    profile.school_year,
    profile.housing_type === 'GPT' ? 'GPT Housing' : profile.housing_type === 'General' ? 'General Housing' : null,
    profile.gender,
  ].filter(Boolean)

  const lifestyle = [
    profile.sleep_schedule && `🌙 ${profile.sleep_schedule}`,
    profile.cleanliness && `🧹 ${profile.cleanliness}`,
    profile.noise_level && `🔊 ${profile.noise_level}`,
    profile.guests && `👥 Guests: ${profile.guests}`,
  ].filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        {/* Hero photo */}
        <div className="relative h-72 bg-[#f5e6d3]">
          {profile.photo_url ? (
            <Image src={profile.photo_url} alt={profile.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-7xl">👤</div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2c1e17]">{profile.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map(b => (
                  <span key={b} className="px-2.5 py-1 text-xs rounded-full bg-[#f5e6d3] text-[#4e3629] font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            {!isOwnProfile && (
              <LikeButton
                targetId={id}
                currentUserId={user.id}
                initialLiked={hasLiked}
                isMatch={isMatch}
              />
            )}
          </div>

          {profile.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#4e3629]/60 uppercase tracking-wide mb-2">About</h2>
              <p className="text-[#2c1e17] leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {lifestyle.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#4e3629]/60 uppercase tracking-wide mb-3">Lifestyle</h2>
              <div className="grid grid-cols-2 gap-2">
                {lifestyle.map(item => (
                  <div key={item} className="px-3 py-2 rounded-xl bg-[#fdf8f3] border border-[#e8c9a5] text-sm text-[#4e3629]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isMatch && (
            <div className="mt-6 p-4 rounded-xl bg-[#f5e6d3] border border-[#e8c9a5] text-center">
              <p className="text-[#4e3629] font-medium">🎉 You matched with {profile.name}!</p>
              <a href="/matches" className="text-sm text-[#c4853a] hover:underline mt-1 inline-block">Go to matches →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
