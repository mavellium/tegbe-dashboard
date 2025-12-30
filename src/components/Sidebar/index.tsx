/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSite } from "@/context/site-context";

// Mapeamento de ícones
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [showSiteSwitcher, setShowSiteSwitcher] = useState(false);
  const pathname = usePathname();
  const [year] = useState(() => new Date().getFullYear());
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const siteSwitcherRef = useRef<HTMLDivElement>(null);
  
  const { currentSite, setCurrentSite, sites } = useSite();

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  }, [isMobile, isOpen, isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (isMobile && isOpen) {
        if (
          sidebarRef.current && 
          !sidebarRef.current.contains(target) &&
          toggleButtonRef.current && 
          !toggleButtonRef.current.contains(target)
        ) {
          closeSidebar();
        }
      }
      
      // Fechar site switcher ao clicar fora
      if (showSiteSwitcher && siteSwitcherRef.current && 
          !siteSwitcherRef.current.contains(target)) {
        setShowSiteSwitcher(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isOpen, closeSidebar, showSiteSwitcher]);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarWidth = isMobile ? (isOpen ? "w-80" : "w-0") : (isCollapsed ? "w-20" : "w-80");
  const router = useRouter();
  return (
    <>
      {isMobile && !isOpen && (
        <motion.button
          ref={toggleButtonRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleSidebar}
          className="
            fixed top-6 left-6 z-50
            p-3 rounded-2xl
            shadow-[var(--color-shadow)] hover:shadow-lg transition-all duration-300
            hover:scale-105 bg-[var(--color-primary)]
            text-white
            z-[99999999999]
          "
          style={{
            left: '6rem',
            transform: 'translateX(-50%)',
          }}
        >
          <Menu size={24} />
        </motion.button>
      )}

      {!isMobile && isCollapsed && (
        <motion.button
          ref={toggleButtonRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleSidebar}
          className="
            fixed top-6 z-50
            p-3 rounded-2xl
            shadow-[var(--color-shadow)] transition-all duration-300
            hover:scale-105 bg-[var(--color-primary)]
            text-white
            z-[99999999999]
          "
          style={{
            left: '6rem',
            transform: 'translateX(-50%)',
          }}
        >
          <Menu size={24} />
        </motion.button>
      )}

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
        {!isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/30 z-30 hidden lg:block z-[999999]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            ref={sidebarRef}
            initial={{ 
              x: isMobile ? -320 : 0, 
              opacity: isMobile ? 0 : 1 
            }}
            animate={{ 
              x: 0, 
              opacity: 1 
            }}
            exit={{ 
              x: isMobile ? -320 : 0, 
              opacity: isMobile ? 0 : 1 
            }}
            transition={{ 
              duration: 0.25, 
              ease: "easeInOut" 
            }}
            className={`
              h-screen 
              shadow-2xl flex flex-col justify-between z-40 fixed lg:fixed
              border-r border-[var(--color-border)] bg-[var(--color-aside)]
              ${sidebarWidth}
              transition-all duration-250
              z-[99999999999999999999]
            `}
          >
            {/* Topo da Sidebar - SiteSwitcher Simplificado */}
            <div className="p-4 border-b border-[var(--color-border)]" ref={siteSwitcherRef}>
              <div className="flex items-center justify-between">
                {/* SiteSwitcher - Logo e Seta */}
                <button
                  onClick={() => setShowSiteSwitcher(!showSiteSwitcher)}
                  className={`
                    flex items-center gap-3
                    rounded-xl
                    hover:bg-[var(--color-background)]/50
                    transition-all duration-200
                    group
                    ${isCollapsed && !isMobile ? 'justify-center w-full' : ''}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    {isCollapsed && !isMobile ? (
                      <div className="w-10 h-10 relative">
                        <Image
                          src={currentSite.logoUrl}
                          alt={currentSite.siteName}
                          fill
                          sizes="40px"
                          className="rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 relative">
                        <Image
                          src={currentSite.logoUrl}
                          alt={currentSite.siteName}
                          fill
                          sizes="48px"
                          className="rounded-lg object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  {(!isCollapsed || isMobile) && (
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[var(--color-secondary)] truncate max-w-[120px]">
                          {currentSite.siteName}
                        </p>
                        <motion.div
                          animate={{ rotate: showSiteSwitcher ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown 
                            size={16} 
                            className="text-[var(--color-secondary)]/60 group-hover:text-[var(--color-secondary)] flex-shrink-0" 
                          />
                        </motion.div>
                      </div>
                      {/* Descrição do site atual */}
                      <p className="text-xs text-[var(--color-secondary)]/70 mb-1 line-clamp-2">
                        {currentSite.description}
                      </p>
                      {/* Total de sites disponíveis */}
                      <p className="text-xs text-[var(--color-secondary)]/60">
                        {sites.length} {sites.length === 1 ? 'site disponível' : 'sites disponíveis'}
                      </p>
                    </div>
                  )}
                  
                  {/* Para sidebar colapsada, mostrar apenas a seta pequena */}
                  {isCollapsed && !isMobile && (
                    <motion.div
                      animate={{ rotate: showSiteSwitcher ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                    >
                      <ChevronDown 
                        size={12} 
                        className="text-[var(--color-secondary)]/60" 
                      />
                    </motion.div>
                  )}
                </button>

                {/* Botão de Fechar (apenas quando sidebar expandida) */}
                {(isMobile && isOpen) || (!isMobile && !isCollapsed) ? (
                  <motion.button
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    onClick={closeSidebar}
                    className="p-2 rounded-xl hover:bg-[var(--color-primary)]/20 transition-all duration-200 hover:scale-105 flex-shrink-0 ml-2"
                  >
                    <X size={20} className="text-[var(--color-secondary)]/80" />
                  </motion.button>
                ) : null}
              </div>

              {/* Lista de Sites - Dropdown */}
              <AnimatePresence>
                {showSiteSwitcher && (!isCollapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="
                      bg-[var(--color-background)]/30 
                      rounded-xl p-2
                      space-y-2
                      max-h-60 overflow-y-auto
                    ">
                      {sites
                        .filter(site => site.id !== currentSite.id)
                        .map(site => (
                          <button
                            key={site.id}
                            onClick={() => {
                              setCurrentSite(site);
                              const firstMenuItem = site.menuItems?.[0];

                              if (firstMenuItem?.href) {
                                router.push(firstMenuItem.href);
                              }

                              setShowSiteSwitcher(false);
                              
                            }}
                            className="
                              w-full flex items-start gap-3
                              p-2 rounded-lg
                              hover:bg-[var(--color-background)]/50
                              transition-all duration-200
                              group/site
                            "
                          >
                            <div className="relative w-8 h-8 flex-shrink-0 mt-1">
                              <Image
                                src={site.logoUrl}
                                alt={site.siteName}
                                fill
                                sizes="32px"
                                className="rounded object-contain"
                              />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--color-secondary)] truncate">
                                {site.siteName}
                              </p>
                              {/* Descrição do site na lista */}
                              <p className="text-xs text-[var(--color-secondary)]/60 mt-0.5 line-clamp-2">
                                {site.description}
                              </p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu List */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {currentSite.menuItems.map((item, index) => {
                const Icon = iconMap[item.icon];
                const isActive = isActiveLink(item.href);
                
                return (
                  <motion.div
                    key={item.name}
                    onHoverStart={() => setHoveredItem(index)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href={item.href}
                      onClick={isMobile ? closeSidebar : undefined}
                      className={`
                        flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative
                        ${isActive 
                          ? 'text-white shadow-[var(--color-shadow)] bg-[var(--color-primary)]'
                          : 'text-[var(--color-secondary)]/80 hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)]'
                        }
                        ${isCollapsed && !isMobile ? 'justify-center px-3' : ''}
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}
                      
                      <motion.div
                        className={`
                          transition-all duration-200 flex-shrink-0
                          ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                        `}
                        layout
                      >
                        <Icon 
                          size={22} 
                          className={`
                            ${isActive 
                              ? 'text-white' 
                              : 'text-[var(--color-secondary)]/60 group-hover:text-[var(--color-secondary)]'
                            }
                          `} 
                        />
                      </motion.div>
                      
                      <AnimatePresence>
                        {(!isCollapsed || isMobile) && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.15 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                            layout
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {(isCollapsed && !isMobile) && hoveredItem === index && (
                        <motion.div
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="absolute left-full ml-2 px-3 py-2 bg-[var(--color-aside)] text-[var(--color-secondary)] text-sm rounded-lg shadow-[var(--color-shadow)] whitespace-nowrap z-50 border border-[var(--color-border)]"
                        >
                          {item.name}
                          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[var(--color-aside)] transform -translate-y-1/2 rotate-45 border-l border-t border-[var(--color-border)]" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer da Sidebar */}
            <div className="p-4 border-t border-[var(--color-border)]">
              <AnimatePresence mode="wait">
                {(!isCollapsed || isMobile) && (
                  <motion.div
                    key="footer-expanded"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="text-center"
                  >
                    <div className="w-10 h-10 mx-auto mb-2 relative opacity-80 hover:opacity-100 transition-opacity">
                      <Image
                        src={currentSite.logoUrl}
                        alt={currentSite.siteName}
                        width={40}
                        height={40}
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      © {year} {currentSite.devAuthor}
                    </p>
                    <p className="text-[10px] text-[var(--color-secondary)]/50 mt-1">
                      Todos os direitos reservados
                    </p>
                  </motion.div>
                )}
                
                {!isMobile && isCollapsed && (
                  <motion.div
                    key="footer-collapsed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex justify-center"
                  >
                    <div className="w-8 h-8 relative opacity-70">
                      <Image
                        src={currentSite.logoUrl}
                        alt={currentSite.siteName}
                        width={32}
                        height={32}
                        className="object-contain rounded"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}