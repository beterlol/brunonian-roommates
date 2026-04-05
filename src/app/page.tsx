import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/discover')

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center overflow-hidden">

      {/* Background "B" watermark */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
      >
        <span
          style={{
            fontSize: 'clamp(320px, 55vw, 700px)',
            lineHeight: 1,
            fontWeight: 900,
            color: 'rgba(78,54,41,0.045)',
            userSelect: 'none',
            letterSpacing: '-0.05em',
          }}
        >
          B
        </span>
      </div>

      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #e8c9a5 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #d4a574 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
      />

      {/* Content */}
      <div className="relative max-w-2xl z-10">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#f5e6d3] border border-[#e8c9a5] text-[#4e3629] text-sm font-medium">
          Brown University &bull; Class of 2025–2029
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-[#2c1e17] leading-tight mb-5">
          Find your perfect<br />
          <span className="text-[#c4853a]">Brunonian roommate</span>
        </h1>
        <p className="text-lg text-[#4e3629]/65 mb-10 max-w-md mx-auto leading-relaxed">
          Browse profiles, match with compatible students, and chat — all in one place built for the Brown community.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 rounded-xl bg-[#4e3629] text-white font-medium hover:bg-[#3d2a20] transition-colors shadow-sm"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 rounded-xl border border-[#e8c9a5] bg-white/60 backdrop-blur-sm text-[#4e3629] font-medium hover:bg-[#f5e6d3] transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Social proof row */}
        <div className="mt-14 flex items-center justify-center gap-8 text-sm text-[#4e3629]/50">
          <span>Dorm matching</span>
          <span className="w-px h-4 bg-[#e8c9a5]" />
          <span>Private chat</span>
          <span className="w-px h-4 bg-[#e8c9a5]" />
          <span>Brown only</span>
        </div>
      </div>
    </div>
  )
}
