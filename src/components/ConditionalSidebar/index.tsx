"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function ConditionalSidebar() {
  const pathname = usePathname();

  // Não mostrar sidebar na página de login
  if (pathname === '/login') {
    return null;
  }
  
  // Só mostrar sidebar quando estiver em um site específico (dashboard/[id])
  // Páginas como /dashboard, /admin, etc não terão sidebar
  const dashboardSitePattern = /^\/dashboard\/[^\/]+/;
  if (!dashboardSitePattern.test(pathname)) {
    return null;
  }
  
  return <Sidebar />;
}