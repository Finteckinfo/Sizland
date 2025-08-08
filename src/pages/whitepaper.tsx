import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NextPage } from "next";

const WhitepaperPage: NextPage = () => {
  return (
    <PageLayout
      title="Coming Soon"
      description="Our whitepaper will be available soon."
      justify="center"
    >
      <div className="flex flex-col justify-center items-center gap-8 text-center">
        <Typography variant="h1">Coming Soon</Typography>
        <Typography variant="paragraph">
          We are working on our whitepaper. Stay tuned for the complete Sizland ecosystem documentation!
        </Typography>
        <Link href="/" passHref>
          <Button className="gap-2">Go Back to Homepage</Button>
        </Link>
      </div>
    </PageLayout>
  );
};

export default WhitepaperPage;