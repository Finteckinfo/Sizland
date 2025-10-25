import { PageLayout } from "@/components/page-layout";
import TwitterEmbed from "@/components/twitter-embed";
import TweetEmbed from "@/components/tweet-embed";
import TwitterWidgetsLoader from "@/components/twitter-widgets-loader";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NextPage } from "next";
import { ArrowLeft, ExternalLink, Calendar, Users, TrendingUp } from "lucide-react";

const BlogPage: NextPage = () => {
  return (
    <PageLayout
      title="Sizland Blog"
      description="Stay updated with the latest news, updates, and insights from Sizland."
      requireAuth={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Twitter Widgets Loader */}
        <TwitterWidgetsLoader />
        
        {/* Header Section */}
        <div className="bg-transparent backdrop-blur-sm border-b border-gray-700/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <Typography variant="h1" className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  Sizland Blog
                </Typography>
                <Typography variant="paragraph" className="text-lg text-gray-200 mb-6 max-w-2xl drop-shadow-md">
                  Stay updated with the latest news, updates, and insights from the Sizland ecosystem. 
                  Follow our journey as we build the future of remote team management and blockchain solutions.
                </Typography>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    asChild
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <a 
                      href="https://twitter.com/sizlandofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Follow on Twitter
                    </a>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Homepage
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1 drop-shadow-md">Live</div>
                  <div className="text-sm text-gray-300 drop-shadow-sm">Updates</div>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-2xl font-bold text-green-400 mb-1 drop-shadow-md">Daily</div>
                  <div className="text-sm text-gray-300 drop-shadow-sm">Posts</div>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-2xl font-bold text-purple-400 mb-1 drop-shadow-md">Public</div>
                  <div className="text-sm text-gray-300 drop-shadow-sm">Building</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Twitter Feed Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="mb-6 text-center">
              <Typography variant="h2" className="text-2xl font-bold text-white mb-2">
                Live Updates from Sizland
              </Typography>
              <Typography variant="paragraph" className="text-gray-400">
                Follow our journey as we build the boring rails remote teams need. 
                We ship in public, daily updates on our progress.
              </Typography>
            </div>
            
            {/* Featured Tweets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* First Tweet */}
              <div>
                <TweetEmbed 
                  tweetId="1958067960506900738"
                  username="sizlandofficial"
                  title="Building Remote Rails"
                />
              </div>
              
              {/* Second Tweet */}
              <div>
                <TweetEmbed 
                  tweetId="1980965670717190421"
                  username="sizlandofficial"
                  title="Latest Update"
                />
              </div>
            </div>


            {/* Timeline */}
            <div className="mb-8">
              <TwitterEmbed 
                username="sizlandofficial"
                showTimeline={true}
                maxTweets={5}
              />
            </div>
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* What We're Building */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                <h3 className="text-base sm:text-lg font-semibold text-white">What We're Building</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Task → Approval → Instant Payout. We're building the boring rails remote teams need for clean operations and fast payments.
              </p>
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Link href="/wallet">Try Our Platform</Link>
              </Button>
            </div>

            {/* Community */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Community</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Join our growing community of remote teams and blockchain enthusiasts. Follow our daily updates and be part of the journey.
              </p>
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <a 
                  href="https://twitter.com/sizlandofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Community
                </a>
              </Button>
            </div>

            {/* Updates */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/30 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Daily Updates</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                We ship in public, daily. Follow our progress as we build the future of remote team management and blockchain solutions.
              </p>
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <a 
                  href="https://twitter.com/sizlandofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow Updates
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Typography variant="h3" className="text-xl font-semibold text-white mb-4">
                Stay Connected
              </Typography>
              <Typography variant="paragraph" className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Follow us on Twitter for the latest updates, join our community, and be part of the Sizland journey.
        </Typography>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <a 
                    href="https://twitter.com/sizlandofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Follow @sizlandofficial
                  </a>
                </Button>
                
                <Button 
                  asChild
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Link href="/wallet">
                    Try Our Platform
        </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BlogPage; 