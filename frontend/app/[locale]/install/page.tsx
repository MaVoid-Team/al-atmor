'use client';

import { useTranslations } from 'next-intl';
import { Download, Apple, Chrome, Globe, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InstallPage() {
  const t = useTranslations();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setUserAgent(window.navigator.userAgent);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
  };

  const isChrome = /Chrome/.test(userAgent) && !/Chromium|Edg/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chromium|Edg|Chrome/.test(userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Download className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Install Al-Atmor App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Install Al-Atmor as an app on your device for the best experience
          </p>
        </div>

        {/* Installation Status */}
        {isInstalled && (
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-2">✓ App Installed!</h2>
            <p className="text-green-700">
              You have already installed Al-Atmor. Look for the app icon on your home screen or app drawer.
            </p>
          </div>
        )}

        {/* Installation Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Browser Installation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Browser Install</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Install directly from your web browser - works on all modern browsers
            </p>

            {deferredPrompt && !isInstalled ? (
              <button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Install Now
              </button>
            ) : (
              <ol className="space-y-3 text-gray-700 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Tap the share/menu icon (⋮ or ⤴)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Select &quot;Add to Home Screen&quot; or &quot;Install App&quot;</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Confirm and wait for installation to complete</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Launch the app from your home screen</span>
                </li>
              </ol>
            )}
          </div>

          {/* APK Installation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">APK Install</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Download the native Android app for an app store-like experience
            </p>

            <a
              href="#download"
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Download className="w-5 h-5" />
              Download APK
            </a>

            <p className="text-xs text-gray-500 mt-3">
              Contact us for the APK download link or check your email for the latest version
            </p>
          </div>
        </div>

        {/* Browser-specific Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Installation by Browser</h2>

          <div className="space-y-6">
            {/* Chrome */}
            <div className="border-b pb-6 last:border-b-0">
              <div className="flex items-center gap-3 mb-3">
                <Chrome className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900">Chrome / Edge</h3>
              </div>
              <ol className="space-y-2 text-gray-700 text-sm ml-9">
                <li>1. Look for the install icon in the address bar</li>
                <li>2. Click it and follow the prompts</li>
                <li>3. Or: Menu (⋮) → &quot;Install app&quot;</li>
              </ol>
            </div>

            {/* Safari */}
            <div className="border-b pb-6 last:border-b-0">
              <div className="flex items-center gap-3 mb-3">
                <Apple className="w-6 h-6 text-gray-800" />
                <h3 className="text-lg font-bold text-gray-900">Safari (iOS/Mac)</h3>
              </div>
              <ol className="space-y-2 text-gray-700 text-sm ml-9">
                <li>1. Tap the Share button (↗ or ⤴)</li>
                <li>2. Scroll and select &quot;Add to Home Screen&quot;</li>
                <li>3. Name the app and tap &quot;Add&quot;</li>
              </ol>
            </div>

            {/* Firefox */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF7139">
                  <circle cx="12" cy="12" r="10" fill="#FF7139" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Firefox</h3>
              </div>
              <ol className="space-y-2 text-gray-700 text-sm ml-9">
                <li>1. Tap the menu button (⋮)</li>
                <li>2. Select &quot;Install&quot; or &quot;Add to Home Screen&quot;</li>
                <li>3. Confirm the installation</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits of Installing</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {[
              '⚡ Faster loading times',
              '📱 App icon on home screen',
              '🔌 Works offline',
              '💨 No browser toolbar',
              '🔔 Notifications support',
              '💾 Optimized storage',
            ].map((benefit, idx) => (
              <li key={idx} className="text-gray-700">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
