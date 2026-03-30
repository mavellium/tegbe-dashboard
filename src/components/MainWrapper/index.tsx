'use client'

import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isLogin = pathname === '/login'
  
  // Verificar se está em um site específico (dashboard/[id])
  const hasSidebar = /^\/dashboard\/[^\/]+/.test(pathname)

  return (
    <main
      className={clsx(
        'min-h-screen',
        isLogin && 'login-page',
        hasSidebar && 'with-sidebar'
      )}
    >
      {children}
    </main>
  )
}
