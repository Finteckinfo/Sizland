'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Download, 
  Eye,
  EyeOff,
  Settings,
  BookOpen,
  FileText
} from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  title = "Sizland Whitepaper" 
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const zoomLevels = [50, 75, 100, 125, 150, 200, 300];
  const minZoom = 25;
  const maxZoom = 500;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleFitToScreen();
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, minZoom));
  };

  const handleFitToScreen = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const pdfWidth = 595; // Standard PDF width in points
      const calculatedZoom = Math.floor((containerWidth / pdfWidth) * 100);
      setZoom(Math.max(calculatedZoom, minZoom));
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title.replace(/\s+/g, '-').toLowerCase() + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Please try refreshing the page.');
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-[80vh]'
      }`}
    >
      {/* Header Controls */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-gray-900/95 to-transparent backdrop-blur-sm transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= minZoom}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-0 focus:ring-2 focus:ring-green-400"
                title="Select zoom level"
                aria-label="Select zoom level"
              >
                {zoomLevels.map(level => (
                  <option key={level} value={level}>{level}%</option>
                ))}
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= maxZoom}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFitToScreen}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                title="Fit to Screen (Ctrl+0)"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                title="Toggle Fullscreen (Ctrl+F)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                title="Toggle Controls"
              >
                {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Container */}
      <div className="relative w-full h-full bg-gray-100">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">PDF Loading Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-green-500 hover:bg-green-600">
              Refresh Page
            </Button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}&view=FitH`}
            className="w-full h-full border-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
          />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading PDF...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we prepare the document</p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className={`absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="space-y-1">
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">+</kbd> Zoom In</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">-</kbd> Zoom Out</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">0</kbd> Fit to Screen</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">F</kbd> Fullscreen</div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
