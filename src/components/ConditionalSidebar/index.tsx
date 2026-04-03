"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';

export default function ConditionalSidebar() {
  const pathname = usePathname();

  // Não mostrar sidebar na página de login
  if (pathname === '/login') {
    return null;
  }
  
  // Mostrar sidebar para páginas de admin e dashboard sites específicos
  const dashboardSitePattern = /^\/dashboard\/[^\/]+/;
  const adminPattern = /^\/admin/;
  
  if (!dashboardSitePattern.test(pathname) && !adminPattern.test(pathname)) {
    return null;
  }
  
  return <Sidebar />;
}