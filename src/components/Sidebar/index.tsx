/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, HelpCircle, FileText, Newspaper, Building, PlayCircle,
  LayoutDashboard, ChevronDown, LogOutIcon, Users, Settings, Network, Loader2, Globe, LayoutTemplate
} from "lucide-react";
import { Icon } from '@iconify/react'; 
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSite } from "@/contexts/SiteContext"; 
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  LayoutDashboard, HelpCircle, FileText, Newspaper, Building, PlayCircle, Users, Settings, Network, Globe, LayoutTemplate
};

export default function Sidebar() {
  const { user, logout, loading: authLoading } = useAuth(); 
  const { currentSite, sites, loadingSites } = useSite(); 

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showSiteSwitcher, setShowSiteSwitcher] = useState(false);
  
  const [manualGroups, setManualGroups] = useState<Record<string, boolean>>({});
  
  const pathname = usePathname();
  const router = useRouter();
  const [year] = useState(() => new Date().getFullYear());
  
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const siteSwitcherRef = useRef<HTMLDivElement>(null);

  // 1. Definição do Menu
  const menuItems = useMemo(() => {
    if (!user) return [];
    
    if (user.role === "ADMIN") {
      return [
        { type: "item", name: "Visão Geral", href: "/", icon: "LayoutDashboard", exact: true, isActive: true },
        { 
          type: "group", 
          title: "Gestão do Sistema", 
          icon: "Settings",
          isActive: true,
          children: [
            { name: "Usuários", href: "/admin/usuarios", icon: "Users", isActive: true },
            { name: "Empresas", href: "/admin/empresas", icon: "Building", isActive: true },
            { name: "Filiais", href: "/admin/subempresas", icon: "Network", isActive: true },
            { name: "Páginas", href: "/admin/paginas", icon: "LayoutTemplate", isActive: true }
          ] 
        }
      ];
    }
    
    const baseMenu = currentSite?.menuItems || [];
    
    const analyticsLink = currentSite ? {
      type: "item", name: "Dashboard", href: `/dashboard/${currentSite.id}`, icon: "LayoutDashboard", exact: true, isActive: true
    } : null;

    const filteredBase = baseMenu.filter((item: any) => item.name !== "Dashboard");
    return analyticsLink ? [analyticsLink, ...filteredBase] : filteredBase;
  }, [user?.role, currentSite?.id, currentSite?.menuItems]);

  // 2. Utilitário de Link Ativo
  const isActiveLink = useCallback((href: string, exact: boolean = false) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    
    const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
    const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;
    
    if (exact) {
      return normalizedPath === normalizedHref;
    }
    
    return normalizedPath === normalizedHref || normalizedPath.startsWith(normalizedHref + '/');
  }, [pathname]);

  const closeSidebar = useCallback(() => { if (isMobile) setIsOpen(false); }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(target) && !toggleButtonRef.current?.contains(target)) {
        setIsOpen(false);
      }
      if (showSiteSwitcher && siteSwitcherRef.current && !siteSwitcherRef.current.contains(target)) {
        setShowSiteSwitcher(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, showSiteSwitcher]);

  if (authLoading && !user) {
    return (
      <aside className={`h-screen z-40 fixed border-r border-[var(--color-border)] bg-[var(--color-aside)] w-64 flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </aside>
    );
  }

  if (!user) return null;

  const sidebarWidth = isMobile ? (isOpen ? "w-80" : "w-0") : "w-64";

  return (
    <>
      {isMobile && !isOpen && (
        <motion.button
          ref={toggleButtonRef}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-4 z-50 p-3 rounded-2xl shadow-lg bg-[var(--color-primary)]/10 text-white"
        >
          <Menu size={24} />
        </motion.button>
      )}

      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSidebar} className="fixed inset-0 bg-black/45 z-30 lg:hidden" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: isMobile ? -320 : 0 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`h-screen shadow-2xl flex flex-col justify-between z-100 fixed border-r border-[var(--color-border)] bg-[var(--color-aside)] ${sidebarWidth} transition-all duration-250`}
          >
            <div className="p-4 border-b border-[var(--color-border)]" ref={siteSwitcherRef}>
              {user.role === "ADMIN" ? (
                <div className="flex items-center gap-3 p-2">
                  <Image src={'/mavellium-logo.png'} width={50} height={50} alt="mavellium logo"></Image>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-secondary)] leading-tight">Mavellium CMS</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Painel Admin</p>
                  </div>
                </div>
              ) : loadingSites ? (
                <div className="p-4 flex items-center justify-center h-12">
                   <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                </div>
              ) : currentSite ? (
                <>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowSiteSwitcher(!showSiteSwitcher)} className="flex items-center gap-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 group flex-1 min-w-0">
                      <div className="relative flex-shrink-0 w-12 h-12 bg-black/5 dark:bg-white/5 border border-[var(--color-border)] rounded-lg flex items-center justify-center overflow-hidden">
                        {currentSite.logoUrl ? (
                          <Image src={currentSite.logoUrl} alt={currentSite.siteName} fill sizes="48px" className="rounded-lg object-contain p-1" />
                        ) : (
                          <Globe className="text-zinc-500 w-6 h-6" />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-[var(--color-secondary)] truncate max-w-[120px]">{currentSite.siteName}</p>
                          <motion.div animate={{ rotate: showSiteSwitcher ? 180 : 0 }}>
                            <ChevronDown size={16} className="text-[var(--color-secondary)]/60" />
                          </motion.div>
                        </div>
                        <p className="text-xs text-[var(--color-secondary)]/70 mb-1 line-clamp-1 truncate">
                          {currentSite.description || "Unidade Atual"}
                        </p>
                      </div>
                    </button>
                    {isMobile && (
                      <button onClick={closeSidebar} className="p-2 ml-2"><X size={20} className="text-[var(--color-secondary)]/80" /></button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showSiteSwitcher && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                        <div className="bg-black/10 dark:bg-white/5 rounded-xl p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar border border-[var(--color-border)]">
                          {sites
                            .filter((s: any) => s.id !== currentSite.id)
                            .map((s: any) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                router.push(`/dashboard/${s.id}`);
                                setShowSiteSwitcher(false);
                                closeSidebar();
                              }}
                              className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 text-left"
                            >
                              <div className="relative w-8 h-8 flex-shrink-0 mt-1 bg-black/5 dark:bg-white/5 border border-[var(--color-border)] rounded flex items-center justify-center">
                                {s.logoUrl ? (
                                  <Image src={s.logoUrl} alt={s.siteName} fill sizes="32px" className="rounded object-contain p-0.5" />
                                ) : (
                                  <Globe className="text-zinc-500 w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--color-secondary)] truncate">{s.siteName}</p>
                                <p className="text-[10px] text-[var(--color-secondary)]/60 line-clamp-1">{s.description || "Acessar unidade"}</p>
                              </div>
                            </button>
                          ))}
                          
                          <div className="pt-2 border-t border-[var(--color-border)]/50 mt-2">
                            <Link 
                              href="/" 
                              onClick={() => { setShowSiteSwitcher(false); closeSidebar(); }}
                              className="block w-full text-center text-[10px] font-bold text-[var(--color-primary)] hover:underline py-1.5 uppercase tracking-wider"
                            >
                              Ver todas as unidades
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-zinc-500 font-medium">Nenhuma filial vinculada.</div>
              )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              {menuItems.map((item: any) => {
                
                // === VERIFICAÇÃO DE VISIBILIDADE (isActive) ===
                if (item.isActive === false) return null;

                // === ITEM SOLTO ===
                if (item.type === "item") {
                  const isActive = isActiveLink(item.href, item.exact);
                  const IconComponent = iconMap[item.icon] || FileText;
                  
                  return (
                    <motion.div key={item.name} whileHover={{ x: 4 }}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative ${isActive ? "bg-[var(--color-primary)]/10 text-white shadow-md shadow-[var(--color-primary)]/20" : "text-[var(--color-secondary)]/80 hover:bg-black/5 dark:hover:bg-white/5"}`}
                      >
                        {item.icon?.includes(':') ? (
                          <Icon icon={item.icon} className="flex-shrink-0 w-[22px] h-[22px]" />
                        ) : (
                          <IconComponent size={22} className="flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                }

                // === GRUPOS E FILHOS ===
                const GroupIcon = item.icon ? iconMap[item.icon] : null;
                const isGroupActive = item.children?.some((child: any) => isActiveLink(child.href, child.exact));
                const isGroupOpen = manualGroups[item.title] ?? isGroupActive;

                // Filtra os filhos para exibir apenas os que têm isActive diferente de false
                const visibleChildren = item.children?.filter((child: any) => child.isActive !== false) || [];

                // Se não sobrar nenhum filho visível no grupo, podemos optar por não exibir o grupo, 
                // mas se quiser exibir vazio, basta remover este if.
                if (visibleChildren.length === 0) return null;

                return (
                  <div key={item.title} className="space-y-1">
                    <button 
                      onClick={() => setManualGroups(p => ({...p, [item.title]: !isGroupOpen}))} 
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isGroupActive ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-secondary)]/80 hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon?.includes(':') ? (
                          <Icon icon={item.icon} className="flex-shrink-0 w-5 h-5" />
                        ) : (
                          GroupIcon ? <GroupIcon size={20} className="flex-shrink-0" /> : <Settings size={20} className="flex-shrink-0" />
                        )}
                        <span className="text-sm font-semibold">{item.title}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${isGroupOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isGroupOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-6 space-y-1 overflow-hidden">
                          {visibleChildren.map((child: any) => {
                            const ChildIcon = iconMap[child.icon] || FileText;
                            const isActive = isActiveLink(child.href, child.exact);
                            
                            return (
                              <Link 
                                key={child.name} 
                                href={child.href} 
                                onClick={closeSidebar} 
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive ? "bg-[var(--color-primary)]/10 text-white" : "text-[var(--color-secondary)]/70 hover:bg-black/5 dark:hover:bg-white/5"}`}
                              >
                                {child.icon?.includes(':') ? (
                                  <Icon icon={child.icon} className="flex-shrink-0 w-4 h-4" />
                                ) : (
                                  <ChildIcon size={16} className="flex-shrink-0" />
                                )}
                                <span className="truncate">{child.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <div className="mt-8 pt-6 border-t border-[var(--color-border)]/50">
                <button 
                  onClick={() => { if(confirm("Deseja encerrar sua sessão?")) logout(); }} 
                  className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-semibold transition-all duration-300 group"
                >
                  <LogOutIcon size={20} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-sm">Encerrar Sessão</span>
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-[var(--color-border)] text-center">
              <p className="text-[11px] text-[var(--color-secondary)]/70 font-semibold uppercase truncate px-2">Olá: {user.name}</p>
              <p className="text-[10px] text-[var(--color-secondary)]/40 mt-1">© {year} Mavellium CMS - 2.0.0</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}