import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ConditionalSidebar from "@/components/ConditionalSidebar";
import MainWrapper from "@/components/MainWrapper";
import { SiteProvider } from "@/contexts/SiteContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ForcePasswordModal from "@/components/ForcePasswordModal";
import ThemeClientUpdater from "@/components/ThemeClientUpdater";
import { getThemeFromRequest, generateThemeCSS } from "@/lib/theme-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Mavellium | CMS`,
  description: `CMS da Mavellium`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obter tema no server-side para tema inicial
  const theme = await getThemeFromRequest();
  const themeCSS = generateThemeCSS(theme);

  return (
    <html lang="pt-br" style={theme as React.CSSProperties}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <AuthProvider>
          <SiteProvider>
            <ForcePasswordModal />
            <ThemeClientUpdater />
            <ConditionalSidebar />
            <MainWrapper>
              {children}
            </MainWrapper>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}