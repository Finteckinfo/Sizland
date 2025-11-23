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
import Waves from "@/components/ui/wave"; // Import Waves

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
  const { theme } = useTheme(); // Use the `useTheme` hook to get the current theme
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative overflow-hidden ${monsterrat.className}`}>
      {/* Render Waves only after component has mounted to avoid SSR mismatches */}
      {mounted && (
        <div className="absolute inset-0 -z-10">
          <Waves
            key={theme} // Forces re-render on theme switch
            lineColor={
              theme === "dark"
                ? "rgba(150, 196, 97, 0.2)"
                : "rgba(29, 31, 72, 0.2)"
            }
            backgroundColor={
              theme === "dark"
                ? "rgba(29, 31, 72)"
                : "rgba(150, 196, 97)"
            }
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        </div>
      )}

      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default MyApp;
