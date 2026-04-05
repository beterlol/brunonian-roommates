'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, SchoolYear, HousingType } from '@/lib/types'
import Image from 'next/image'

const SCHOOL_YEARS: SchoolYear[] = ['Freshman', 'Sophomore', 'Junior', 'Senior']
const HOUSING_TYPES: { value: HousingType; label: string }[] = [
  { value: 'General', label: 'General housing' },
  { value: 'GPT', label: 'GPT (Program/Theme/Greek)' },
]
const SLEEP_OPTIONS = ['Early bird (before 10pm)', 'Night owl (after 1am)', 'Flexible']
const CLEANLINESS_OPTIONS = ['Very tidy', 'Moderately clean', 'Relaxed']
const NOISE_OPTIONS = ['Very quiet', 'Some noise OK', 'No preference']
const GUEST_OPTIONS = ['Rarely/never', 'Occasionally', 'Frequently']

interface Props {
  initialData: Profile | null
  userId: string
  email: string
}

export default function ProfileForm({ initialData, userId, email }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    school_year: initialData?.school_year ?? '',
    gender: initialData?.gender ?? '',
    housing_type: initialData?.housing_type ?? '',
    bio: initialData?.bio ?? '',
    sleep_schedule: initialData?.sleep_schedule ?? '',
    cleanliness: initialData?.cleanliness ?? '',
    noise_level: initialData?.noise_level ?? '',
    guests: initialData?.guests ?? '',
  })
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setPhotoUrl(data.publicUrl + `?t=${Date.now()}`)
    }
    setUploading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const payload = {
      id: userId,
      email,
      ...form,
      school_year: form.school_year as SchoolYear || null,
      housing_type: form.housing_type as HousingType || null,
      photo_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('profiles').upsert(payload)
    if (error) { setError(error.message); setSaving(false); return }
    router.push('/discover')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {/* Photo */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-2xl bg-[#f5e6d3] border-2 border-dashed border-[#e8c9a5] flex items-center justify-center cursor-pointer hover:border-[#c4853a] transition-colors overflow-hidden relative"
        >
          {photoUrl ? (
            <Image src={photoUrl} alt="Profile" fill className="object-cover rounded-2xl" unoptimized />
          ) : (
            <span className="text-3xl">📷</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 text-sm rounded-lg border border-[#e8c9a5] text-[#4e3629] hover:bg-[#f5e6d3] transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          <p className="text-xs text-[#4e3629]/50 mt-1">JPG, PNG up to 5MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Full name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
        />
      </div>

      {/* School Year + Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4e3629] mb-1.5">School year</label>
          <select
            value={form.school_year}
            onChange={e => set('school_year', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
          >
            <option value="">Select…</option>
            {SCHOOL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Gender</label>
          <input
            type="text"
            value={form.gender}
            onChange={e => set('gender', e.target.value)}
            placeholder="e.g. Woman, Man, Nonbinary…"
            className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
          />
        </div>
      </div>

      {/* Housing type */}
      <div>
        <label className="block text-sm font-medium text-[#4e3629] mb-2">Housing type</label>
        <div className="flex gap-3">
          {HOUSING_TYPES.map(h => (
            <button
              key={h.value}
              type="button"
              onClick={() => set('housing_type', h.value)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                form.housing_type === h.value
                  ? 'border-[#c4853a] bg-[#f5e6d3] text-[#4e3629]'
                  : 'border-[#e8c9a5] text-[#4e3629]/60 hover:border-[#c4853a]/50'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Bio</label>
        <textarea
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Tell potential roommates a bit about yourself…"
          className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a] resize-none"
        />
        <p className="text-xs text-[#4e3629]/40 mt-1 text-right">{form.bio.length}/500</p>
      </div>

      {/* Lifestyle preferences */}
      <div>
        <p className="text-sm font-medium text-[#4e3629] mb-3">Lifestyle preferences</p>
        <div className="space-y-3">
          {[
            { key: 'sleep_schedule', label: 'Sleep schedule', options: SLEEP_OPTIONS },
            { key: 'cleanliness', label: 'Cleanliness', options: CLEANLINESS_OPTIONS },
            { key: 'noise_level', label: 'Noise level', options: NOISE_OPTIONS },
            { key: 'guests', label: 'Guests', options: GUEST_OPTIONS },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <p className="text-xs text-[#4e3629]/60 mb-1.5">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set(key, form[key as keyof typeof form] === opt ? '' : opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      form[key as keyof typeof form] === opt
                        ? 'border-[#c4853a] bg-[#f5e6d3] text-[#4e3629] font-medium'
                        : 'border-[#e8c9a5] text-[#4e3629]/60 hover:border-[#c4853a]/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-[#4e3629] text-white font-medium hover:bg-[#3d2a20] transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}
