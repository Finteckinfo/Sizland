import { PageLayout } from "@/components/page-layout";
import PDFViewer from "@/components/pdf-viewer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NextPage } from "next";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

const WhitepaperPage: NextPage = () => {
  return (
    <PageLayout
      title="Sizland Whitepaper"
      description="Complete Sizland ecosystem documentation and technical specifications."
      requireAuth={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header Section */}
        <div className="bg-transparent backdrop-blur-sm border-b border-gray-700/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <Typography variant="h1" className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  Sizland Whitepaper
                </Typography>
                <Typography variant="paragraph" className="text-lg text-gray-200 mb-6 max-w-2xl drop-shadow-md">
                  Discover the complete technical documentation, tokenomics, and roadmap for the Sizland ecosystem. 
                  Our comprehensive whitepaper covers everything from blockchain integration to business solutions.
                </Typography>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    asChild
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <a 
                      href="/sizland-whitepaper.pdf" 
                      download="Sizland-Whitepaper-3.0.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
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
                  <div className="text-2xl font-bold text-green-400 mb-1 drop-shadow-md">Version 3.0</div>
                  <div className="text-sm text-gray-300 drop-shadow-sm">Latest Release</div>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1 drop-shadow-md">50+</div>
                  <div className="text-sm text-gray-300 drop-shadow-sm">Pages</div>
                </div>
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-2xl font-bold text-purple-400 mb-1 drop-shadow-md">2024</div>
                  <div className="text-sm text-gray-300 drop-shadow-sm">Updated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="mb-6 text-center">
              <Typography variant="h2" className="text-2xl font-bold text-white mb-2">
                Interactive PDF Viewer
              </Typography>
              <Typography variant="paragraph" className="text-gray-400">
                Use the controls below to zoom, rotate, and navigate through the document. 
                Press <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl+F</kbd> for fullscreen mode.
              </Typography>
            </div>
            
            <PDFViewer 
              pdfUrl="/sizland-whitepaper.pdf"
              title="Sizland Whitepaper 3.0"
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Typography variant="h3" className="text-xl font-semibold text-white mb-4">
                Need More Information?
              </Typography>
              <Typography variant="paragraph" className="text-gray-400 mb-6 max-w-2xl mx-auto">
                For technical questions, partnerships, or additional documentation, 
                please visit our main website or contact our team.
              </Typography>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <a 
                    href="https://siz.land" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Sizland
                  </a>
                </Button>
                
                <Button 
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
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

export default WhitepaperPage;