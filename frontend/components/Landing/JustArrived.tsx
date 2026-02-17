"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/useProducts"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function JustArrived() {
    const t = useTranslations('JustArrived')
    const locale = useLocale()
    const isRtl = locale === 'ar'
    const { fetchPublicProducts } = useProducts()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchJustArrived = async () => {
            setIsLoading(true)
            try {
                // Fetch recent products using the hook
                const result = await fetchPublicProducts({ page: 1, limit: 10 })
                setProducts(result?.data || [])
            } catch (error) {
                console.error('Failed to fetch just arrived products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchJustArrived()
    }, [fetchPublicProducts])

    if (isLoading) {
        return (
            <section className="py-2 bg-muted/30">
                <div className="container max-w-screen-2xl px-4 md:px-8 lg:px-28">
                    <div className="mb-8">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-square w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (products.length === 0) {
        return null
    }

    return (
        <section className="py-2 bg-muted/30">
            <div className="max-w-screen-3xl px-4 md:px-8 lg:px-28">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="border-s-4 border-primary ps-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary mb-2">
                                {t('title')}
                            </h2>
                            <p className="text-muted-foreground font-medium">
                                {t('description')}
                            </p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="just-arrived-prev rounded-full"
                            >
                                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="just-arrived-next rounded-full"
                            >
                                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Swiper Carousel */}
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={16}
                    slidesPerView={2}
                    navigation={{
                        prevEl: '.just-arrived-prev',
                        nextEl: '.just-arrived-next',
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    autoplay={{
                        delay: 5000,
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
                            slidesPerView: 4,
                            spaceBetween: 24,
                        },
                        1280: {
                            slidesPerView: 5,
                            spaceBetween: 24,
                        },
                    }}
                    className="just-arrived-swiper pb-12"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <ProductCard
                                product={product}
                                isJustAdded={true}
                                showMetadata={true}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style jsx global>{`
                .just-arrived-swiper .swiper-pagination {
                    bottom: 0;
                }
                
                .just-arrived-swiper .swiper-pagination-bullet {
                    background: hsl(var(--primary));
                    opacity: 0.3;
                }
                
                .just-arrived-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                }
                
                .just-arrived-swiper .swiper-button-disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </section>
    )
}
