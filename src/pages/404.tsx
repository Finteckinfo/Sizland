import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NextPage } from "next";

const ComingSoonPage: NextPage = () => {
  return (
    <PageLayout
      title="Coming Soon"
      description="This page will be available soon."
      justify="center"
    >
      <div className="flex flex-col justify-center items-center gap-8 text-center">
        <Typography variant="h1">Coming Soon</Typography>
        <Typography variant="paragraph">
          We are working on this page. Please check back later!
        </Typography>
        <Link href="/" passHref>
          <Button className="gap-2">Go Back to Homepage</Button>
        </Link>
      </div>
    </PageLayout>
  );
};

export default ComingSoonPage;
