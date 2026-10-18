import { MAIN_ORIGIN, products, siteConfig, siteFaqs } from "@/lib/site";

export function siteJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${MAIN_ORIGIN}/#organization`,
        name: siteConfig.name,
        url: MAIN_ORIGIN,
        logo: siteConfig.ogImage,
        sameAs: siteConfig.sameAs,
        description: siteConfig.description,
      },
      {
        "@type": "WebSite",
        "@id": `${MAIN_ORIGIN}/#website`,
        name: siteConfig.name,
        url: MAIN_ORIGIN,
        description: siteConfig.description,
        publisher: { "@id": `${MAIN_ORIGIN}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${MAIN_ORIGIN}/#faq`,
        mainEntity: siteFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      ...products.map((p) => ({
        "@type": "WebApplication",
        name: p.name,
        url: p.url,
        description: p.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        publisher: { "@id": `${MAIN_ORIGIN}/#organization` },
      })),
    ],
  };
}
