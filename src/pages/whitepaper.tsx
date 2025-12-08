'use client';

import { PageLayout } from "@/components/page-layout";
import PDFViewer from "@/components/pdf-viewer";
import { useTheme } from "next-themes";
import { AuroraText } from "@/components/ui/aurora-text";
import { Download } from "lucide-react";
import Link from "next/link";
import { NextPage } from "next";
import { useEffect, useState } from "react";

const WhitepaperPage: NextPage = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout
      title="Sizland Whitepaper - Technical Documentation"
      description="Complete Sizland ecosystem documentation and technical specifications. Learn about our blockchain-powered ERP system, tokenomics, and roadmap for remote teams."
      requireAuth={false}
    >
      <div className="min-h-screen w-full">
        {/* Top Section: Whitepaper Introduction */}
        <section className="relative pt-12 sm:pt-16 md:pt-24 pb-24 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 text-center">
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className={isDark ? "text-white" : "text-black"}>
                  Sizland White
                </span>
                <AuroraText>paper</AuroraText>
              </h1>

              {/* Description */}
              <p className={`text-lg md:text-xl leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Discover the complete technical documentation, tokenomics, and roadmap for the Sizland ecosystem. Our comprehensive whitepaper covers everything from blockchain integration to business solutions.
              </p>
                
                {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="/sizland-whitepaper.pdf" 
                      download="Sizland-Whitepaper-3.0.pdf"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-full transition-all duration-200"
                    >
                  <Download className="w-5 h-5" />
                      Download PDF
                    </a>

                <Link
                  href="/"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-full transition-all duration-200 ${
                    isDark
                      ? "text-gray-900 bg-white hover:bg-gray-100"
                      : "text-gray-900 bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Join our community
                    </Link>
                </div>

              {/* Statistics - Below buttons, matching hero section design */}
              <div className="flex items-center justify-center mt-16 sm:mt-20 md:mt-24 space-x-10 sm:space-x-16 md:space-x-20">
                {/* 3.0 Latest Release */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    3.0
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Latest Release
                  </p>
              </div>
              
                {/* spacer */}
                <div className="hidden sm:block">
                  <svg
                    className={isDark ? "text-gray-600" : "text-gray-400"}
                    width="16"
                    height="39"
                    viewBox="0 0 16 39"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                    <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                    <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                    <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                    <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                  </svg>
                </div>

                {/* 50+ Total Pages */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    50+
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Total Pages
                  </p>
                </div>

                {/* spacer */}
                <div className="hidden sm:block">
                  <svg
                    className={isDark ? "text-gray-600" : "text-gray-400"}
                    width="16"
                    height="39"
                    viewBox="0 0 16 39"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                    <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                    <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                    <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                    <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                  </svg>
                </div>

                {/* 2025 Updated */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    2025
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Updated
                  </p>
              </div>
            </div>
          </div>
        </div>
        </section>

        {/* Middle Section: Interactive PDF Viewer */}
        <section className="py-16 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                <span className={isDark ? "text-white" : "text-black"}>
                Interactive PDF Viewer
                </span>
              </h2>
              <p className={`text-base md:text-lg max-w-2xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Use the controls below to zoom, rotate, and navigate through the document. Press <kbd className={`px-2 py-1 rounded text-sm ${
                  isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                }`}>Ctrl+F</kbd> for fullscreen mode.
              </p>
            </div>
            
            {/* PDF Viewer - No background/border container */}
            <div>
            <PDFViewer 
              pdfUrl="/sizland-whitepaper.pdf"
              title="Sizland Whitepaper 3.0"
            />
          </div>
        </div>
        </section>

        {/* Bottom Section: Need More Information? */}
        <section className={`relative py-24 w-full ${
          isDark 
            ? "bg-gradient-to-t from-green-950/40 via-green-900/25 to-transparent" 
            : "bg-gradient-to-t from-green-100/90 via-green-50/70 to-white"
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl">
                <span className={isDark ? "text-white" : "text-black"}>
                  Need More Information
                </span>
                <AuroraText>?</AuroraText>
              </h2>

              {/* Description */}
              <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Power your workflows, payments, and investments through a secure, multi-chain platform designed for teams like yours.
              </p>

              {/* CTA Button */}
              <Link
                href="/"
                className={`mt-8 px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isDark
                    ? "bg-white text-green-600 hover:bg-green-50"
                    : "bg-white text-green-600 hover:bg-green-50 border-2 border-green-500"
                }`}
              >
                Visit Our Blogs
                  </Link>
              </div>
            </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default WhitepaperPage;
