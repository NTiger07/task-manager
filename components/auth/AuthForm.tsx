'use client'

// AuthForm — handles Supabase Auth UI + post-auth redirect with user feedback.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  view: 'sign_in' | 'sign_up'
}

const authAppearance = {
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: '#00e676',
        brandAccent: '#00c853',
        brandButtonText: '#0f172a',
        inputBackground: '#ffffff',
        inputBorder: '#e2e8f0',
        inputBorderFocus: '#00e676',
        inputText: '#0f172a',
        inputPlaceholder: '#94a3b8',
        messageText: '#334151',
        messageBackground: '#f8fafc',
        messageBorder: '#e2e8f0',
      },
      borderWidths: { buttonBorderWidth: '1px', inputBorderWidth: '1px' },
      radii: { borderRadiusButton: '8px', inputBorderRadius: '8px' },
      fontSizes: { baseBodySize: '14px' },
      space: { inputPadding: '10px 14px', buttonPadding: '11px 16px' },
    },
  },
  style: {
    button: {
      fontWeight: '600',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    input: {
      borderRadius: '8px',
      fontSize: '14px',
    },
    anchor: { color: '#0f172a', fontWeight: '600', textDecoration: 'none' },
    label: { color: '#334155', fontSize: '13px', fontWeight: '600', marginBottom: '6px' },
    message: { fontSize: '13px', padding: '10px 14px', borderRadius: '8px' },
  },
} as const

export default function AuthForm({ view }: AuthFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN') {
        setRedirecting(true)
        router.push('/')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="relative">
      {/* ── Redirecting overlay ── */}
      {redirecting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/95 backdrop-blur-xs rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#00e676] animate-spin" />
          <p className="text-sm font-semibold text-slate-800">
            {view === 'sign_up' ? 'Account created! Redirecting…' : 'Signed in! Redirecting…'}
          </p>
        </div>
      )}

      <Auth
        supabaseClient={supabase}
        appearance={authAppearance}
        providers={[]}
        view={view}
        showLinks={false}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email address',
              password_label: 'Password',
              button_label: 'Sign in to TaskFlow',
              loading_button_label: 'Signing in…',
              email_input_placeholder: 'you@example.com',
              password_input_placeholder: '••••••••',
            },
            sign_up: {
              email_label: 'Email address',
              password_label: 'Password',
              button_label: 'Create free account',
              loading_button_label: 'Creating account…',
              email_input_placeholder: 'you@example.com',
              password_input_placeholder: 'Min. 6 characters',
              confirmation_text: 'Check your email to confirm your account',
            },
          },
        }}
      />
    </div>
  )
}
