import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/Landing/Navbar";
import { Footer } from "@/components/Landing/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

// Inter - Clean, modern font designed for screens. Used by top tech companies.
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

// IBM Plex Sans Arabic - Professional Arabic font that pairs perfectly with Inter
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
    variable: "--font-ibm-plex-arabic",
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["arabic"],
    display: "swap",
});

export const viewport: Viewport = {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    title: "Al-Atmour Group",
    description: "Premium E-commerce Store",
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Al-Atmor',
    },
    icons: {
        icon: [
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { url: '/Logo_with_background.png', sizes: '32x32', type: 'image/png' },
        ],
        shortcut: '/icon-192x192.png',
        apple: [
            { url: '/icon-192x192.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    formatDetection: {
        telephone: false,
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <body
                className={`${inter.variable} ${ibmPlexArabic.variable} ${locale === 'ar' ? ibmPlexArabic.className : inter.className} antialiased`}
            >
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <CartProvider>
                                <Navbar />
                                <Toaster position="bottom-right" richColors />
                                {children}
                                <Footer />
                            </CartProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
