// Sticky blurred header — composes Logo + UserMenu sub-components.

import Logo from './Logo'
import UserMenu from './UserMenu'

interface HeaderProps {
  email: string
}

export default function Header({ email }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 sm:px-8 h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <Logo />
      <UserMenu email={email} />
    </header>
  )
}
