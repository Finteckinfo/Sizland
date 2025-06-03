import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { NextPage } from "next";
import React from "react";

const WhitepaperPage: NextPage = () => {
  return (
    <PageLayout
      title="Sizland Whitepaper"
      description="Explore the full Sizland ecosystem and its foundational principles."
      justify="center"
    >
      <div className="prose dark:prose-invert max-w-4xl text-blue-900 dark:text-green-500 px-4 py-10">
        <Typography variant="h1">Sizland White Paper</Typography>

        <p><strong>We’re building an ecosystem that redefines finance and enterprise solutions:</strong></p>
        <ul className="list-disc pl-5">
          <li><strong>Enterprise Resource Planning (ERP):</strong> A secure, decentralized ERP for remote workforces.</li>
          <li><strong>Investment Fund:</strong> A performance-driven, pooled investment vehicle.</li>
          <li><strong>Utility Token:</strong> The SIZ token powers transactions and governance.</li>
          <li><strong>Unified Wallet System:</strong> Manages assets across fiat and crypto seamlessly.</li>
          <li><strong>Integrated Crypto Exchange:</strong> Secure, low-fee trading for users.</li>
        </ul>

        <p><strong>Whitepaper version 4.0</strong>, last updated on 10 April 2025, subject to future review and update.</p>

        <Typography variant="h2">1. Introduction</Typography>
        <p>Sizland is an emerging fintech company founded by ContWhizz. Its vision is to transform enterprise and investment management using blockchain technology. At the heart of our mission is the Sizland Enterprise Resource Planning (ERP) system—a multi-tenant, blockchain-based platform that streamlines operations for businesses of all sizes, with a special focus on remote and digital-first teams.</p>
        <p>Our ERP solution is Sizland’s core business. It enables task automation, transparent workflows, and instant, secure payments using smart contracts. Businesses can access this platform by staking our utility token, SIZ, which fuels the ecosystem.</p>
        <p>Sizland also operates a performance-driven pooled investment fund to complement the ERP system. This fund invests across traditional and digital asset classes — including forex, stocks, commodities, crypto, DeFi, and staking — creating income-generating strategies that support the ERP’s sustainability.</p>
        <p>Currently, Sizland does not hold public funds. We are in Phase 1 of regulatory preparation, offering advisory services through subscription. Subscribers receive curated investment insights and research-based strategies via premium social accounts.</p>

        <Typography variant="h3">1.1 Problem Statement</Typography>
        <p>Despite advancements in financial technology and investment management, several persistent challenges continue to hinder economic growth, financial inclusion, and investment efficiency, particularly in emerging markets such as Kenya. These challenges create barriers for investors, businesses, and individuals seeking to access secure and reliable financial services. Sizland seeks to address the following key issues:</p>

        <Typography variant="h4">1.1.1 Inefficient and Costly ERP Systems</Typography>
        <p>Many businesses struggle with outdated and inefficient enterprise resource planning (ERP) systems that are expensive, centralized, and prone to security risks...</p>

        <Typography variant="h4">1.1.2 Limited Access to Diversified Investment Opportunities</Typography>
        <p>Many investors lack access to diversified, professionally managed portfolios...</p>

        <Typography variant="h4">1.1.3 High Transaction Costs and Slow Settlement Times</Typography>
        <p>Conventional financial systems often involve high transaction fees, lengthy processing times, and intermediaries...</p>

        <Typography variant="h4">1.1.4 Limited Integration of Blockchain and Digital Assets in Financial Services</Typography>
        <p>While blockchain technology has demonstrated its potential to enhance security, transparency, and efficiency...</p>

        <Typography variant="h4">1.1.5 Fragmented and Insecure Digital Asset Management</Typography>
        <p>The lack of a unified, secure digital asset management system poses significant risks...</p>

        <Typography variant="h2">2. Market Opportunity</Typography>
        <p>The global financial landscape is undergoing rapid transformation, driven by digital innovation...</p>

        <Typography variant="h2">3. Vision</Typography>
        <p>Sizland envisions a future where financial empowerment is accessible to all through a decentralized, transparent, and technology-driven investment ecosystem...</p>

        <Typography variant="h2">4. Sizland Ecosystem</Typography>
        <p>Sizland is building an integrated financial ecosystem designed to revolutionize investment, enterprise management, and blockchain technology adoption...</p>

        <Typography variant="h2">SIZ Token Utilities</Typography>
        <p>The SIZ token powers multiple functions across the Sizland ecosystem...</p>

        <Typography variant="h2">5. How It Works</Typography>
        <p>Sizland is a blockchain-powered enterprise technology company focused on revolutionizing business operations...</p>

        <Typography variant="h2">Conclusion</Typography>
        <p>Sizland is redefining finance by placing enterprise solutions at its core. Our ERP platform solves real business problems while the supporting financial tools — investment fund, wallet, exchange, and education — build a complete ecosystem for growth and inclusion.</p>
        <p>With transparency, education, and accessibility at its foundation, Sizland bridges traditional and digital finance to empower individuals and enterprises alike. As we scale, our focus remains on regulatory compliance, technological innovation, and creating lasting impact through decentralized tools.</p>
        <p><strong>Sizland: Powering the Future of Finance and Work.</strong></p>
      </div>
    </PageLayout>
  );
};

export default WhitepaperPage;