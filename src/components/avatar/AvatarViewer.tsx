"use client";

import { Suspense, useRef, useEffect, useState } from 'react';
import { Loader2, Bot } from 'lucide-react';

interface AvatarViewerProps {
  avatarUrl: string;
  isAnimating: boolean;
  currentMessage?: string;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading avatar...</p>
      </div>
    </div>
  );
}

export default function AvatarViewer({ avatarUrl, isAnimating, currentMessage }: AvatarViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [avatarUrl]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Failed to load 3D avatar</p>
          <p className="text-xs text-muted-foreground">Using fallback display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-background to-muted">
      {/* Fallback Avatar Display */}
      <div className="text-center">
        <div className={`relative ${isAnimating ? 'animate-pulse' : ''}`}>
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Bot className="h-16 w-16 text-white" />
          </div>
          {isAnimating && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>
        <p className="text-lg font-semibold">AI Tutor</p>
        <p className="text-sm text-muted-foreground">Ready to help you learn!</p>
        {currentMessage && isAnimating && (
          <div className="mt-4 p-2 bg-muted rounded-lg max-w-xs">
            <p className="text-xs text-muted-foreground">Currently saying:</p>
            <p className="text-sm">{currentMessage.slice(0, 50)}{currentMessage.length > 50 ? '...' : ''}</p>
          </div>
        )}
      </div>
      
      {/* Note about 3D Avatar */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 p-2 rounded">
        <p>3D Avatar: {avatarUrl ? 'Uploaded' : 'Not uploaded'}</p>
        <p className="text-[10px]">Full 3D rendering coming soon</p>
      </div>
    </div>
  );
}