/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  HelpCircle, 
  FileText, 
  Newspaper, 
  Building, 
  PlayCircle,
  LayoutDashboard,
  ChevronDown,
  LogOutIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSite } from "@/context/site-context";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  LayoutDashboard: LayoutDashboard,
  HelpCircle: HelpCircle,
  FileText: FileText,
  Newspaper: Newspaper,
  Building: Building,
  PlayCircle: PlayCircle,
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [showSiteSwitcher, setShowSiteSwitcher] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const [year] = useState(() => new Date().getFullYear());
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const siteSwitcherRef = useRef<HTMLDivElement>(null);
  
  const { currentSite, setCurrentSite, sites } = useSite();

  const isActiveLink = useCallback((href: string, exact: boolean = false) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    if (exact) {
      const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
      const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;
      return normalizedPathname === normalizedHref;
    }
    return pathname.startsWith(href);
  }, [pathname]);

  const isGroupActive = useCallback((group: any) => {
    if (!group.children || group.children.length === 0) return false;
    return group.children.some((child: any) => {
      if (!child.href) return false;
      return isActiveLink(child.href, true);
    });
  }, [isActiveLink]);

  const groupsToOpen = useMemo(() => {
    const groups: Record<string, boolean> = {};
    if (!currentSite?.menuItems) return groups;
    
    currentSite.menuItems.forEach((item: any) => {
      if (item.type === "group" && item.children) {
        if (item.children.some((child: any) => isActiveLink(child.href, true))) {
          groups[item.title] = true;
        }
      }
    });
    return groups;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentSite, isActiveLink]);
  
  useEffect(() => {
    if (Object.keys(groupsToOpen).length > 0) {    
      setOpenGroups(prev => ({ ...prev, ...groupsToOpen }));
    }
  }, [groupsToOpen]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const closeSidebar = useCallback(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setIsOpen(!isOpen);
  }, [isMobile, isOpen]);

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

      if (isMobile && isOpen) {
        if (sidebarRef.current && !sidebarRef.current.contains(target) &&
            toggleButtonRef.current && !toggleButtonRef.current.contains(target)) {
          closeSidebar();
        }
      }
      
      if (showSiteSwitcher && siteSwitcherRef.current && !siteSwitcherRef.current.contains(target)) {
        setShowSiteSwitcher(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, closeSidebar, showSiteSwitcher]);

  // LARGURA FIXA NO DESKTOP (w-64) E DINÂMICA NO MOBILE (w-80 / w-0)
  const sidebarWidth = isMobile ? (isOpen ? "w-80" : "w-0") : "w-64";
  const router = useRouter();

  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    }
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleLogout = () => {
    clearAllCookies();
    if (window.confirm("Tem certeza que deseja sair? Todos os dados locais serão limpos.")) {
      router.push("/login");
      setTimeout(() => window.location.reload(), 100);
    }
  };

  return (
    <>
      {/* BOTÃO MOBILE - EXATAMENTE IGUAL AO SEU ARQUIVO INICIAL */}
      {isMobile && !isOpen && (
        <motion.button
          ref={toggleButtonRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleSidebar}
          className="
            fixed top-6 left-1 z-50
            p-3 rounded-2xl
            shadow-[var(--color-shadow)] hover:shadow-lg transition-all duration-300
            hover:scale-105 bg-[var(--color-primary)]
            text-white
            z-[99999999999]
          "
          style={{
            left: '1rem',
            transform: 'translateX(-50%)',
          }}
        >
          <Menu size={24} />
        </motion.button>
      )}

      {/* OVERLAY APENAS MOBILE */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/45 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`
              h-screen 
              shadow-2xl flex flex-col justify-between z-40 fixed lg:fixed
              border-r border-[var(--color-border)] bg-[var(--color-aside)]
              ${sidebarWidth}
              transition-all duration-250
              z-[99999999999999999999]
            `}
          >
            {/* Topo / Site Switcher */}
            <div className="p-4 border-b border-[var(--color-border)]" ref={siteSwitcherRef}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowSiteSwitcher(!showSiteSwitcher)}
                  className="flex items-center gap-3 rounded-xl hover:bg-[var(--color-background)]/50 transition-all duration-200 group flex-1 min-w-0"
                >
                  <div className="relative flex-shrink-0 w-12 h-12">
                    <Image
                      src={currentSite.logoUrl}
                      alt={currentSite.siteName}
                      fill
                      sizes="48px"
                      className="rounded-lg object-contain"
                    />
                  </div>
                  
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-[var(--color-secondary)] truncate max-w-[120px]">
                        {currentSite.siteName}
                      </p>
                      <motion.div animate={{ rotate: showSiteSwitcher ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} className="text-[var(--color-secondary)]/60 group-hover:text-[var(--color-secondary)] flex-shrink-0" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-[var(--color-secondary)]/70 mb-1 line-clamp-2">
                      {currentSite.description}
                    </p>
                  </div>
                </button>

                {/* Botão de Fechar Apenas no Mobile */}
                {isMobile && isOpen && (
                  <motion.button
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    onClick={closeSidebar}
                    className="p-2 rounded-xl hover:bg-[var(--color-primary)]/20 transition-all duration-200 hover:scale-105 flex-shrink-0 ml-2"
                  >
                    <X size={20} className="text-[var(--color-secondary)]/80" />
                  </motion.button>
                )}
              </div>

              {/* Lista de Sites */}
              <AnimatePresence>
                {showSiteSwitcher && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-[var(--color-background)]/30 rounded-xl p-2 space-y-2 max-h-60 overflow-y-auto">
                      {sites.filter(site => site.id !== currentSite.id).map(site => (
                        <button
                          key={site.id}
                          onClick={() => {
                            setCurrentSite(site);
                            const firstMenuItem = site.menuItems?.[0];
                            if (firstMenuItem?.href) router.push(firstMenuItem.href);
                            setShowSiteSwitcher(false);
                          }}
                          className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--color-background)]/50 transition-all duration-200 group/site"
                        >
                          <div className="relative w-8 h-8 flex-shrink-0 mt-1">
                            <Image src={site.logoUrl} alt={site.siteName} fill sizes="32px" className="rounded object-contain" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-secondary)] truncate">{site.siteName}</p>
                            <p className="text-xs text-[var(--color-secondary)]/60 mt-0.5 line-clamp-2">{site.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
              {currentSite.menuItems.map((item: any) => {
                if (item.type === "item") {
                  const Icon = iconMap[item.icon];
                  const isActive = isActiveLink(item.href, true);

                  return (
                    <motion.div key={item.name} whileHover={{ x: 4 }}>
                      <Link
                        href={item.href}
                        onClick={isMobile ? closeSidebar : undefined}
                        className={`
                          flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative
                          ${isActive ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-secondary)]/80 hover:bg-white/10"}
                        `}
                      >
                        <Icon size={22} className="flex-shrink-0" />
                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                }

                const GroupIcon = item.icon ? iconMap[item.icon] : null;
                const isGroupCurrentlyActive = isGroupActive(item);
                const isGroupOpen = openGroups[item.title] ?? isGroupCurrentlyActive;

                return (
                  <div key={item.title} className="space-y-1">
                    <button
                      onClick={() => toggleGroup(item.title)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                        ${isGroupCurrentlyActive ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" : "text-[var(--color-secondary)]/80 hover:bg-white/10"}
                      `}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {GroupIcon && <GroupIcon size={20} className="flex-shrink-0" />}
                        <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
                      </div>
                      <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isGroupOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isGroupOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-6 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child: any) => {
                            const ChildIcon = iconMap[child.icon];
                            const isActive = isActiveLink(child.href, true);

                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={isMobile ? closeSidebar : undefined}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                  ${isActive ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-secondary)]/70 hover:bg-white/10"}
                                `}
                              >
                                <ChildIcon size={16} className="flex-shrink-0" />
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{child.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Botão de Sair */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-8 pt-6 border-t border-[var(--color-border)]/30">
                <button
                  onClick={() => {
                    if (isMobile) closeSidebar();
                    handleLogout();
                  }}
                  className={`
                    group relative flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 w-full overflow-hidden bg-[var(--color-primary)]
                    hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)]
                    text-white font-medium shadow-lg hover:shadow-xl active:scale-[0.99]
                  `}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                  <motion.div whileHover={{ x: -2 }} transition={{ duration: 0.2 }}>
                    <LogOutIcon size={22} className="transition-transform duration-300 flex-shrink-0" />
                  </motion.div>
                  <motion.span className="text-sm font-semibold whitespace-nowrap" whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                    Sair do Sistema
                  </motion.span>
                </button>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)]">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 relative opacity-80 hover:opacity-100 transition-opacity">
                  <Image src={currentSite.logoUrl} alt={currentSite.siteName} width={40} height={40} className="object-contain rounded-lg" />
                </div>
                <p className="text-xs text-[var(--color-secondary)]/70">
                  © {year} {currentSite.devAuthor}
                </p>
                <p className="text-[10px] text-[var(--color-secondary)]/50 mt-1">
                  Todos os direitos reservados
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}