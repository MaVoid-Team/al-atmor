'use client';

import { useTranslations } from 'next-intl';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const t = useTranslations();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're back online
    const handleOnline = () => {
      setIsOnline(true);
      // Redirect back to home after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isOnline ? 'Back Online!' : 'You are Offline'}
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          {isOnline
            ? 'Great! Your connection is restored. Redirecting you back...'
            : 'No internet connection detected. Some features may be limited.'}
        </p>

        {!isOnline && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <h2 className="font-semibold text-blue-900 mb-3">
              📱 You can still:
            </h2>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>✓ Browse products you've already loaded</li>
              <li>✓ View your order history</li>
              <li>✓ Check your profile and addresses</li>
              <li>✓ Read static pages</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          Check your internet connection and try again
        </p>
      </div>
    </div>
  );
}
