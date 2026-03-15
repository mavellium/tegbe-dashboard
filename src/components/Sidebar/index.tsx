/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, HelpCircle, FileText, Newspaper, Building, PlayCircle,
  LayoutDashboard, ChevronDown, LogOutIcon, Users, Settings, Network, Loader2, Globe, LayoutTemplate
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSite } from "@/contexts/SiteContext"; 
import { useAuth } from "@/contexts/AuthContext";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  LayoutDashboard, HelpCircle, FileText, Newspaper, Building, PlayCircle, Users, Settings, Network, Globe, LayoutTemplate
};

export default function Sidebar() {
  const { user, logout, loading: authLoading } = useAuth(); 
  const { currentSite, sites, loadingSites } = useSite(); 

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showSiteSwitcher, setShowSiteSwitcher] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  
  const pathname = usePathname();
  const router = useRouter();
  const [year] = useState(() => new Date().getFullYear());
  
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const siteSwitcherRef = useRef<HTMLDivElement>(null);

  // === 1. DEFINIÇÃO DO MENU ===
  const menuItems = useMemo(() => {
    if (!user) return [];
    
    if (user.role === "ADMIN") {
      return [
        { type: "item", name: "Visão Geral", href: "/", icon: "LayoutDashboard" },
        { 
          type: "group", 
          title: "Gestão do Sistema", 
          icon: "Settings",
          children: [
            { name: "Usuários", href: "/admin/usuarios", icon: "Users" },
            { name: "Empresas", href: "/admin/empresas", icon: "Building" },
            { name: "Filiais", href: "/admin/subempresas", icon: "Network" },
            { name: "Páginas", href: "/admin/paginas", icon: "LayoutTemplate" }
          ] 
        }
      ];
    }
    
    const baseMenu = currentSite?.menuItems || [];
    const analyticsLink = currentSite ? {
      type: "item", name: "Dashboard", href: `/dashboard/${currentSite.id}`, icon: "LayoutDashboard"
    } : null;

    const filteredBase = baseMenu.filter((item: any) => item.name !== "Dashboard");
    return analyticsLink ? [analyticsLink, ...filteredBase] : filteredBase;
  }, [user, currentSite]);

  // === 2. UTILITÁRIOS ===
  const isActiveLink = useCallback((href: string, exact: boolean = false) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
    const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;
    return exact ? normalizedPath === normalizedHref : pathname.startsWith(href);
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

  // === 3. ESTADOS DE CARREGAMENTO ===
  // Se o Auth ainda está carregando ou não temos usuário, mostramos o spinner centralizado
  if (authLoading || !user) {
    return (
      <aside className="h-screen z-40 fixed border-r border-[var(--color-border)] bg-[var(--color-aside)] w-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </aside>
    );
  }

  return (
    <>
      {isMobile && !isOpen && (
        <motion.button
          ref={toggleButtonRef}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-4 z-50 p-3 rounded-2xl shadow-lg bg-[var(--color-primary)] text-white"
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
            initial={{ x: isMobile ? -320 : 0 }} animate={{ x: 0 }} exit={{ x: -320 }}
            className={`h-screen shadow-2xl flex flex-col justify-between z-40 fixed border-r border-[var(--color-border)] bg-[var(--color-aside)] ${isMobile ? "w-80" : "w-64"} transition-all duration-250`}
          >
            {/* TOPO: SWITCHER / LOGO */}
            <div className="p-4 border-b border-[var(--color-border)]" ref={siteSwitcherRef}>
              {user.role === "ADMIN" ? (
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">M</div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-secondary)] leading-tight">Mavellium OS</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Painel Geral</p>
                  </div>
                </div>
              ) : (
                // LÓGICA DE USUÁRIO COMUM
                loadingSites ? (
                  <div className="p-4 flex items-center justify-center h-12">
                     <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                  </div>
                ) : currentSite ? (
                  <>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setShowSiteSwitcher(!showSiteSwitcher)} className="flex items-center gap-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 group flex-1 min-w-0">
                        <div className="relative flex-shrink-0 w-12 h-12 bg-black/5 dark:bg-white/5 border border-[var(--color-border)] rounded-lg flex items-center justify-center overflow-hidden text-zinc-500">
                          {currentSite.logoUrl ? (
                            <Image src={currentSite.logoUrl} alt={currentSite.siteName} fill sizes="48px" className="rounded-lg object-contain p-1" />
                          ) : (
                            <Globe className="w-6 h-6" />
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-[var(--color-secondary)] truncate max-w-[120px]">{currentSite.siteName}</p>
                            <motion.div animate={{ rotate: showSiteSwitcher ? 180 : 0 }}>
                              <ChevronDown size={16} className="text-[var(--color-secondary)]/60" />
                            </motion.div>
                          </div>
                          <p className="text-xs text-[var(--color-secondary)]/70 mb-1 line-clamp-1 truncate">{currentSite.description || "Unidade Atual"}</p>
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
                            {sites.filter((s: any) => s.id !== currentSite.id).map((s: any) => (
                              <button
                                key={s.id}
                                onClick={() => { router.push(`/dashboard/${s.id}`); setShowSiteSwitcher(false); closeSidebar(); }}
                                className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-black/10 transition-all text-left"
                              >
                                <div className="relative w-8 h-8 flex-shrink-0 mt-1 bg-black/5 border border-[var(--color-border)] rounded flex items-center justify-center text-zinc-500">
                                  {s.logoUrl ? <Image src={s.logoUrl} alt={s.siteName} fill sizes="32px" className="rounded object-contain p-0.5" /> : <Globe className="text-zinc-500 w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[var(--color-secondary)] truncate">{s.siteName}</p>
                                  <p className="text-[10px] text-[var(--color-secondary)]/60 line-clamp-1">{s.description || "Acessar unidade"}</p>
                                </div>
                              </button>
                            ))}
                            <div className="pt-2 border-t border-[var(--color-border)]/50 mt-2">
                              <Link href="/" onClick={() => { setShowSiteSwitcher(false); closeSidebar(); }} className="block w-full text-center text-[10px] font-bold text-[var(--color-primary)] hover:underline py-1.5 uppercase tracking-wider">Ver todas as unidades</Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500 font-medium">Nenhuma filial vinculada.</div>
                )
              )}
            </div>

            {/* NAV PRINCIPAL */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              {menuItems.map((item: any) => {
                if (item.type === "item") {
                  const Icon = iconMap[item.icon] || FileText;
                  const isActive = isActiveLink(item.href, true);
                  return (
                    <motion.div key={item.name} whileHover={{ x: 4 }}>
                      <Link href={item.href} onClick={closeSidebar} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" : "text-[var(--color-secondary)]/80 hover:bg-black/5 dark:hover:bg-white/5"}`}>
                        <Icon size={22} className="flex-shrink-0" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                }

                const GroupIcon = item.icon ? iconMap[item.icon] : null;
                const isGroupOpen = openGroups[item.title] || isActiveLink(item.children[0]?.href);

                return (
                  <div key={item.title} className="space-y-1">
                    <button onClick={() => setOpenGroups(p => ({...p, [item.title]: !isGroupOpen}))} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${isGroupOpen ? "text-[var(--color-primary)]" : "text-[var(--color-secondary)]/80 hover:bg-black/5 dark:hover:bg-white/5"}`}>
                      <div className="flex items-center gap-3">
                        {GroupIcon && <GroupIcon size={20} />}
                        <span className="text-sm font-semibold">{item.title}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${isGroupOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isGroupOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-6 space-y-1 overflow-hidden">
                          {item.children.map((child: any) => {
                            const ChildIcon = iconMap[child.icon] || FileText;
                            const childActive = isActiveLink(child.href, true);
                            return (
                              <Link key={child.name} href={child.href} onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${childActive ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-secondary)]/70 hover:bg-black/5 dark:hover:bg-white/5"}`}>
                                <ChildIcon size={16} />
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
                <button onClick={() => { if(confirm("Encerrar sessão?")) logout(); }} className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-semibold transition-all">
                  <LogOutIcon size={20} />
                  <span className="text-sm">Sair do Sistema</span>
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-[var(--color-border)] text-center">
              <p className="text-[11px] text-[var(--color-secondary)]/70 font-semibold uppercase truncate">Olá, {user.name}</p>
              <p className="text-[10px] text-[var(--color-secondary)]/40 mt-1">© {year} Mavellium OS</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}