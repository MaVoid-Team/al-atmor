"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useBundles } from "@/hooks/useBundles"
import { BundleCard } from "@/components/bundles/BundleCard"
import { Bundle } from "@/types/bundle"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function FeaturedBundles() {
    const t = useTranslations('Bundles')
    const locale = useLocale()
    const isRtl = locale === 'ar'
    const { fetchPublicBundles } = useBundles()
    const [bundles, setBundles] = useState<Bundle[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadBundles = async () => {
            try {
                const result = await fetchPublicBundles({ page: 1, limit: 10 })
                setBundles(result?.bundles || [])
            } catch (error) {
                console.error('Failed to fetch bundles:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadBundles()
    }, [fetchPublicBundles])

    if (isLoading) {
        return (
            <section className="bg-background py-12 px-4 md:px-8 lg:px-28">
                <div className="container max-w-screen-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-center mb-12 text-foreground">
                        {t('featured')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-[4/5] w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (bundles.length === 0) {
        return null
    }

    return (
        <section className="bg-background py-12">
            <div className="max-w-screen-3xl px-4 md:px-8 lg:px-28">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="border-s-4 border-secondary ps-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary">
                                {t('featured')}
                            </h2>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="featured-bundles-prev rounded-full"
                            >
                                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="featured-bundles-next rounded-full"
                            >
                                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation={{
                        prevEl: '.featured-bundles-prev',
                        nextEl: '.featured-bundles-next',
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    autoplay={{
                        delay: 6000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                        480: {
                            slidesPerView: 2,
                            spaceBetween: 12,
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 16,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 24,
                        },
                    }}
                    className="featured-bundles-swiper pb-12"
                >
                    {bundles.map((bundle) => (
                        <SwiperSlide key={bundle.id} className="h-auto">
                            <BundleCard
                                bundle={bundle}
                                className="h-full"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style jsx global>{`
                .featured-bundles-swiper .swiper-pagination {
                    bottom: 0;
                }

                .featured-bundles-swiper .swiper-pagination-bullet {
                    background: hsl(var(--primary));
                    opacity: 0.3;
                }

                .featured-bundles-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                }

                .featured-bundles-swiper .swiper-button-disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </section>
    )
}
