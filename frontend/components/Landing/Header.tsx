"use client"

import { Link } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

export function Header() {
    const t = useTranslations('Footer')
    const locale = useLocale()
    const isRtl = locale === 'ar'
    const [showContent, setShowContent] = useState(false)

    useEffect(() => {
        // Delay text appearance to sync with fan animation (adjust time as needed)
        const timer = setTimeout(() => {
            setShowContent(true)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <section className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/wholesale-hero.jpg"
                    alt="Wholesale Trade Market"
                />
                <div className={`absolute inset-0 ${isRtl ? 'bg-linear-to-l' : 'bg-linear-to-r'} from-black/80 via-black/50 to-transparent`} />
            </div>

            {/* Content */}
            <div className="container relative z-10 mx-auto px-4 flex justify-start">
                <Card className="max-w-2xl border border-white/20 bg-background/95 backdrop-blur-md shadow-2xl p-6 sm:p-10 rounded-2xl">
                    <CardContent className="flex flex-col items-start text-start p-0 space-y-6">
                        <div
                            className={`space-y-4 transition-all duration-1000 ease-out transform ${showContent
                                ? 'opacity-100 translate-y-0'
                                : `opacity-0 ${isRtl ? 'translate-x-10' : '-translate-x-10'}`
                                }`}
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-4">
                                <span className="text-primary block mb-2">
                                    {t('companyName')}
                                </span>
                                <span className="text-2xl sm:text-3xl md:text-4xl font-light text-muted-foreground block">
                                    Wholesale Trade Market
                                </span>
                            </h1>
                            <p className={`text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed transition-all duration-1000 delay-300 ${showContent
                                ? 'opacity-100 translate-y-0'
                                : `opacity-0 ${isRtl ? 'translate-x-10' : '-translate-x-10'}`
                                }`}>
                                {t('description')}
                            </p>
                        </div>

                        <div className={`flex flex-wrap gap-4 pt-4 transition-all duration-1000 delay-500 ${showContent
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-10'
                            }`}>
                            <Link href={"/products"}>
                                <button className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90 transition-all hover:scale-105 shadow-lg shadow-secondary/25 text-base cursor-pointer">
                                    {t('shopNow')}
                                </button>
                            </Link>
                            <Link href={"/categories"}>
                                <button className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-all text-base cursor-pointer">
                                    {t('explore')}
                                </button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
