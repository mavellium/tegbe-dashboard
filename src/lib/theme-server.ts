const defaultTheme = {
  mainColor: "#ffffff",      
  secondColor: "#ffffff",   
  boxShadowColor: "#ffffff1a",
  asideColor: "#000000",      
  borderColor: "#f1f1f1",   
  backgroundColor: "#111111",
  backgroundBody: "#000000"   
};

export async function getThemeFromRequest(pathname?: string): Promise<typeof defaultTheme> {
  try {
    // Check if we're in static generation mode
    if (typeof window === 'undefined' && !pathname) {
      return defaultTheme;
    }
    
    if (!pathname) return defaultTheme;
    
    // Extrair ID do site da URL
    const match = pathname.match(/^\/dashboard\/([^/]+)/);
    if (!match) return defaultTheme;

    const siteId = match[1];
    
    // Buscar dados do site no server
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sub-companies/${siteId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return defaultTheme;
    
    const site = await response.json();
    return site.theme ? (typeof site.theme === 'string' ? JSON.parse(site.theme) : site.theme) : defaultTheme;
  } catch (error) {
    console.error('Error fetching theme:', error);
    return defaultTheme;
  }
}

export function generateThemeCSS(theme: typeof defaultTheme): string {
  return `
    :root {
      --color-primary: ${theme.mainColor};
      --color-secondary: ${theme.secondColor};
      --color-shadow: ${theme.boxShadowColor};
      --color-aside: ${theme.asideColor};
      --color-border: ${theme.borderColor};
      --color-background: ${theme.backgroundColor};
      --color-body: ${theme.backgroundBody};
    }
  `;
}
