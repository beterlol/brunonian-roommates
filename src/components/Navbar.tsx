'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/discover', label: 'Discover' },
    { href: '/matches', label: 'Matches' },
  ]

  // Always render nav shell to avoid layout shift
  const isAuthPage = pathname === '/' || pathname.startsWith('/auth')

  if (!mounted || (!userId && isAuthPage)) {
    return (
      <nav className="h-16 border-b border-[#e8c9a5] bg-[#fdf8f3]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#4e3629]">
            Brunonian<span className="text-[#c4853a]">.</span>
          </Link>
          {!userId && (
            <div className="flex gap-3">
              <Link href="/auth/login" className="px-4 py-2 text-sm text-[#4e3629] hover:text-[#c4853a] transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="px-4 py-2 text-sm rounded-lg bg-[#4e3629] text-white hover:bg-[#3d2a20] transition-colors">Sign up</Link>
            </div>
          )}
        </div>
      </nav>
    )
  }

  if (!userId) {
    return (
      <nav className="h-16 border-b border-[#e8c9a5] bg-[#fdf8f3]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#4e3629]">
            Brunonian<span className="text-[#c4853a]">.</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-sm text-[#4e3629] hover:text-[#c4853a] transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="px-4 py-2 text-sm rounded-lg bg-[#4e3629] text-white hover:bg-[#3d2a20] transition-colors">Sign up</Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="h-16 border-b border-[#e8c9a5] bg-[#fdf8f3]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/discover" className="text-xl font-bold text-[#4e3629]">
          Brunonian<span className="text-[#c4853a]">.</span>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-[#f5e6d3] text-[#4e3629] font-medium'
                  : 'text-[#4e3629]/70 hover:text-[#4e3629] hover:bg-[#f5e6d3]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/profile/edit"
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              pathname === '/profile/edit'
                ? 'bg-[#f5e6d3] text-[#4e3629] font-medium'
                : 'text-[#4e3629]/70 hover:text-[#4e3629] hover:bg-[#f5e6d3]'
            }`}
          >
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="ml-2 px-4 py-2 text-sm rounded-lg text-[#4e3629]/70 hover:text-[#4e3629] hover:bg-[#f5e6d3] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
