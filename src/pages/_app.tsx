import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { AppProps } from "next/app";
import { Montserrat, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "next-auth/react";
import { config } from "../wagmi";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer";
import GlowBackground from "@/components/ui/GlowBackground";
import AnimatedGrid from "@/components/ui/AnimatedGrid";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  weight: ["400", "500", "600", "700", "800"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={client}>
            <RainbowKitProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ThemeProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <SpeedInsights />
      </SessionProvider>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isMytab = router.pathname.startsWith("/mytab");

  if (isMytab) {
    return (
      <div
        className={`${monsterrat.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-x-hidden font-body`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${monsterrat.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-x-hidden font-body text-on-surface`}
    >
      <GlowBackground />
      <AnimatedGrid />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default MyApp;