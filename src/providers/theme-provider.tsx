"use client";

import { useSite } from "@/contexts/SiteContext";
import { useEffect } from "react";

const defaultTheme = {
  mainColor: "#e61a4a",
  secondColor: "#fff",
  boxShadowColor: "#fff",
  asideColor: "#111",
  borderColor: "#e61a4a",
  backgroundColor: "#111",
  backgroundBody: "#000"
};

export default function ThemeProvider() {
  const { currentSite } = useSite();

  useEffect(() => {
    const root = document.documentElement;
    
    const theme = currentSite?.theme || defaultTheme;

    root.style.setProperty('--color-primary', theme.mainColor);
    root.style.setProperty('--color-secondary', theme.secondColor);
    root.style.setProperty('--color-shadow', theme.boxShadowColor);
    root.style.setProperty('--color-aside', theme.asideColor);
    root.style.setProperty('--color-border', theme.borderColor);
    root.style.setProperty('--color-background', theme.backgroundColor);
    root.style.setProperty('--color-body', theme.backgroundBody);
    
  }, [currentSite]);
  
  return null;
}