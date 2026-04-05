'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/discover')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2c1e17]">Welcome back</h1>
          <p className="text-[#4e3629]/60 mt-2">Sign in to find your roommate</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 card-shadow space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@brown.edu"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4e3629] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8c9a5] bg-[#fdf8f3] text-[#2c1e17] placeholder:text-[#4e3629]/40 focus:outline-none focus:ring-2 focus:ring-[#c4853a]/40 focus:border-[#c4853a]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#4e3629] text-white font-medium hover:bg-[#3d2a20] transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-[#4e3629]/60">
          No account?{' '}
          <Link href="/auth/signup" className="text-[#c4853a] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
