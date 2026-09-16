// Dashboard layout — server component that validates session and provides header & toast.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/header/Header'
import Toast from '@/components/Toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header email={user.email ?? ''} />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Toast />
    </div>
  )
}
