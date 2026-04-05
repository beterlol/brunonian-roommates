'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.toLowerCase().endsWith('@brown.edu')) {
      setError('Only @brown.edu email addresses can sign up.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.session) {
      router.push('/profile/edit?onboarding=true')
      router.refresh()
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-2xl font-bold text-[#2c1e17] mb-2">Check your email</h2>
          <p className="text-[#4e3629]/60">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2c1e17]">Join Brunonian</h1>
          <p className="text-[#4e3629]/60 mt-2">Find your perfect dorm roommate</p>
        </div>
        <form onSubmit={handleSignup} className="bg-white rounded-2xl p-8 card-shadow space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Brown email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@brown.edu"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
            />
            <p className="text-xs text-[#4e3629]/40 mt-1">Must be a @brown.edu address</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#4e3629] text-white font-medium hover:bg-[#3d2a20] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-[#4e3629]/60">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#c4853a] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
