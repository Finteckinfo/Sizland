import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import Head from "next/head";
import React from "react";
import { Hero } from "@/components/hero";
import IdentityPivot from "@/components/identity-pivot";
import Features from "@/components/features";
import About from "@/components/about";
import InfoHub from "@/components/infoHub";
import Roadmap from "@/components/roadmap";
import { siteJsonLdGraph } from "@/components/seo/site-json-ld";
import { siteConfig, siteFaqs, siteKeywordsCsv } from "@/lib/site";

const SITE_URL = `${siteConfig.url}/`;
const SITE_TITLE = siteConfig.title;
const SITE_DESCRIPTION = siteConfig.description;
const SITE_IMAGE = siteConfig.ogImage;
const jsonLd = siteJsonLdGraph();

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content={siteKeywordsCsv} />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={SITE_IMAGE} />
        <meta property="og:image:alt" content={SITE_TITLE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sizlandofficial" />
        <meta name="twitter:creator" content="@sizlandofficial" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={SITE_IMAGE} />
        <meta name="twitter:image:alt" content={SITE_TITLE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <PageLayout
        title={SITE_TITLE}
        description={SITE_DESCRIPTION}
        url={SITE_URL}
        requireAuth={false}
        setSocialMetadata={false}
      >
        <section id="hero">
          <Hero />
        </section>
      </PageLayout>

      <IdentityPivot />

      <section id="what-sizland-is" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          What Sizland is
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {siteConfig.disambiguation}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {siteFaqs.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-border-subtle bg-white/5 p-5"
            >
              <h3 className="font-semibold text-on-surface">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <Features />

      <PageLayout requireAuth={false} includeHead={false}>
        <section id="technology">
          <About />
        </section>
      </PageLayout>

      <PageLayout requireAuth={false} includeHead={false}>
        <section id="roadmap">
          <Roadmap />
        </section>
      </PageLayout>

      <InfoHub />
    </>
  );
};

export default HomePage;
