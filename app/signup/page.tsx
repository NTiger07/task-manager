// Signup page — Server Component.

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Logo from '@/components/header/Logo'
import AuthForm from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account — TaskFlow',
  description: 'Create a free TaskFlow account to start managing your tasks.',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/25 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Logo />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Start organizing your tasks with TaskFlow
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-3xl p-8 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <AuthForm view="sign_up" />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-slate-900 font-bold hover:text-[#00c853] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
