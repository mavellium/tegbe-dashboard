/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

interface SiteContextType {
  currentSite: any | null;
  setCurrentSite: (site: any) => void;
  sites: any[];
  loadingSites: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  
  const [sites, setSites] = useState<any[]>([]);
  const [currentSite, setCurrentSiteState] = useState<any | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // SE FOR ADMIN: Para o loading imediatamente.
    if (!user || user.role === 'ADMIN') {
      setSites([]);
      setLoadingSites(false);
      return;
    }

    // SE FOR USER: Busca as filiais e para o loading no final.
    if (user.role === 'USER' && user.companyId) {
      setLoadingSites(true);
      fetch('/api/sub-companies')
        .then(res => res.json())
        .then(data => {
          const userSubs = data
            .filter((s: any) => s.companyId === user.companyId)
            .map((sub: any) => ({
              id: sub.id,
              siteName: sub.name,
              description: sub.description || "",
              logoUrl: sub.logo_img || "",
              theme: sub.theme ? (typeof sub.theme === 'string' ? JSON.parse(sub.theme) : sub.theme) : null,
              menuItems: sub.menuItems ? (typeof sub.menuItems === 'string' ? JSON.parse(sub.menuItems) : sub.menuItems) : []
            }));
            
          setSites(userSubs);
        })
        .catch(() => setSites([]))
        .finally(() => setLoadingSites(false));
    } else {
      setLoadingSites(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (sites.length > 0) {
      const match = pathname?.match(/^\/dashboard\/([^/]+)/);
      if (match) {
        const idDaUrl = match[1];
        const found = sites.find(s => s.id === idDaUrl);
        if (found) {
          setCurrentSiteState(found);
          return;
        }
      }
      const savedId = localStorage.getItem('currentSiteId');
      const foundSaved = savedId ? sites.find(s => s.id === savedId) : null;
      setCurrentSiteState(foundSaved || sites[0]);
    } else {
      setCurrentSiteState(null);
    }
  }, [pathname, sites]);

  const setCurrentSite = (site: any) => {
    setCurrentSiteState(site);
    if (site?.id) localStorage.setItem('currentSiteId', site.id);
  };

  return (
    <SiteContext.Provider value={{ currentSite, setCurrentSite, sites, loadingSites }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) throw new Error('useSite must be used within SiteProvider');
  return context;
}