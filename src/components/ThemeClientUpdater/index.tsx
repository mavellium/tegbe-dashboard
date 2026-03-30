"use client";

import { useSite } from "@/contexts/SiteContext";
import { useEffect, useRef } from "react";

const defaultTheme = {
  mainColor: "#ffffff",      
  secondColor: "#ffffff",   
  boxShadowColor: "#ffffff1a",
  asideColor: "#000000",      
  borderColor: "#f1f1f1",   
  backgroundColor: "#111111",
  backgroundBody: "#000000"   
};

export default function ThemeClientUpdater() {
  const { currentSite } = useSite();
  const initialLoad = useRef(true);

  useEffect(() => {
    // Na primeira carga, não aplicar tema (já foi aplicado via SSR)
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    // Só aplicar tema em mudanças subsequentes (navegação client-side)
    if (currentSite?.theme) {
      const root = document.documentElement;
      const theme = currentSite.theme;

      // Aplicar tema imediatamente no client-side
      root.style.setProperty('--color-primary', theme.mainColor);
      root.style.setProperty('--color-secondary', theme.secondColor);
      root.style.setProperty('--color-shadow', theme.boxShadowColor);
      root.style.setProperty('--color-aside', theme.asideColor);
      root.style.setProperty('--color-border', theme.borderColor);
      root.style.setProperty('--color-background', theme.backgroundColor);
      root.style.setProperty('--color-body', theme.backgroundBody);
    } else {
      // Aplicar tema padrão se não houver tema
      const root = document.documentElement;
      root.style.setProperty('--color-primary', defaultTheme.mainColor);
      root.style.setProperty('--color-secondary', defaultTheme.secondColor);
      root.style.setProperty('--color-shadow', defaultTheme.boxShadowColor);
      root.style.setProperty('--color-aside', defaultTheme.asideColor);
      root.style.setProperty('--color-border', defaultTheme.borderColor);
      root.style.setProperty('--color-background', defaultTheme.backgroundColor);
      root.style.setProperty('--color-body', defaultTheme.backgroundBody);
    }
  }, [currentSite]);

  return null;
}
