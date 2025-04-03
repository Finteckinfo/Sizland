import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import { Montserrat } from "next/font/google";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { SessionProvider } from "next-auth/react";

import { config } from "../wagmi";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer";
import Waves from "@/components/ui/wave"; // Import Waves
import { useTheme } from "next-themes";
import Features from "@/components/features";

const client = new QueryClient();

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Rainbowkit with Ethereum",
});

export const monsterrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: "500",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <SessionProvider session={pageProps.session}>
        <QueryClientProvider client={client}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider>
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
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme(); // Use the `useTheme` hook to get the current theme

  return (
    <div className={`relative overflow-hidden ${monsterrat.className}`}>
      {/* Background Waves */}
      <div className="absolute inset-0 -z-10">
        <Waves
          key={theme} // Force re-render on theme change using the theme as the key
          lineColor={theme === "dark" ? "rgba(150, 196, 97, 0.2)" : "rgba(29, 31, 72, 0.2)"} // Green for dark mode, dark blue for light mode
          backgroundColor={
            theme === "dark"
              ? "rgba(29, 31, 72)"
              : "rgba(150, 196, 97)"
          } // Slightly transparent dark blue for dark mode, green for light mode
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

      <Navbar />
      {children}
      <Features />
      <Footer />
    </div>
  );
}

export default MyApp;
