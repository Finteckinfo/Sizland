import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import { Montserrat } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Providers } from '@/providers/index'
import { SessionProvider } from "next-auth/react";
import { config } from "../wagmi";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer";
import GlowBackground from "@/components/ui/GlowBackground";
import AnimatedGrid from "@/components/ui/AnimatedGrid";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { generateNonce, getCSP } from '@/utils/security';

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
  const router = useRouter();
  const nonce = generateNonce();
  const cspHeader = getCSP(nonce, process.env.NODE_ENV === 'development');

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Security-Policy" content={cspHeader} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="csp-nonce" content={nonce} />
      </Head>
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
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`${monsterrat.variable} font-sans`}>
      {process.env.NODE_ENV === 'production' && (
        <>
          <GlowBackground />
          <AnimatedGrid />
        </>
      )}
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default MyApp;