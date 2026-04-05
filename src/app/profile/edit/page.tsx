import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/ProfileForm'

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { onboarding } = await searchParams

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {onboarding && (
        <div className="mb-8 p-4 rounded-xl bg-[#f5e6d3] border border-[#e8c9a5]">
          <p className="text-[#4e3629] font-medium">Welcome to Brunonian! 🎉</p>
          <p className="text-[#4e3629]/70 text-sm mt-1">Complete your profile so others can discover you.</p>
        </div>
      )}
      <h1 className="text-2xl font-bold text-[#2c1e17] mb-6">
        {onboarding ? 'Create your profile' : 'Edit profile'}
      </h1>
      <ProfileForm initialData={profile} userId={user.id} email={user.email ?? ''} />
    </div>
  )
}
