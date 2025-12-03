import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import { Montserrat } from "next/font/google";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Providers } from '@/providers/index'
import { SessionProvider } from "next-auth/react";

import { config } from "../wagmi";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer";
import GlowBackground from "@/components/ui/GlowBackground";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Defensive theme check: Only allow valid theme values in localStorage
if (typeof window !== "undefined") {
  const validThemes = ["light", "dark", "system"];
  const theme = localStorage.getItem("theme");
  if (theme && (!validThemes.includes(theme) || theme.includes(" "))) {
    localStorage.removeItem("theme");
  }
}

const client = new QueryClient();

export const monsterrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: "500",
});

import { SpeedInsights } from "@vercel/speed-insights/next";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ThemeProvider>
          </Providers>
        </QueryClientProvider>
      </WagmiProvider>
      <SpeedInsights />
    </SessionProvider>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${monsterrat.className}`}>
      {/* Background glow system (replaces Waves) */}
      {mounted && (
        <>
          <GlowBackground position="top" className="-z-10" />
          <GlowBackground position="bottom" className="-z-10" />
        </>
      )}

      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default MyApp;
