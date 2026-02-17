"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { ProductsGridSkeleton } from "@/components/products/ProductFilters"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function FeaturedProducts() {
    const t = useTranslations('Products')
    const locale = useLocale()
    const isRtl = locale === 'ar'
    const { fetchPublicProducts } = useProducts()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const result = await fetchPublicProducts({ page: 1, limit: 10 })
                setProducts(result?.data || [])
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [fetchPublicProducts])

    if (isLoading) {
        return (
            <section className="bg-muted/10 px-4 md:px-8 lg:px-28">
                <div className="container max-w-screen-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-center my-12 text-foreground">
                        {t('title')}
                    </h2>
                    <ProductsGridSkeleton
                        count={3}
                        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12"
                    />
                </div>
            </section>
        )
    }

    return (
        <section className="bg-muted/10">
            <div className="max-w-screen-4xl px-4 md:px-8 lg:px-28">
                {/* Header */}
                <div className="mb-8 pt-12">
                    <div className="flex items-center justify-between">
                        <div className="border-s-4 border-primary ps-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary">
                                {t('title')}
                            </h2>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="featured-prev rounded-full"
                            >
                                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="featured-next rounded-full"
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
                        prevEl: '.featured-prev',
                        nextEl: '.featured-next',
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
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 24,
                        },
                    }}
                    className="featured-swiper pb-12"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <ProductCard
                                product={product}
                                showMetadata={true}
                                showLowStockWarning={true}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style jsx global>{`
                .featured-swiper .swiper-pagination {
                    bottom: 0;
                }
                
                .featured-swiper .swiper-pagination-bullet {
                    background: hsl(var(--primary));
                    opacity: 0.3;
                }
                
                .featured-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                }
                
                .featured-swiper .swiper-button-disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </section>
    )
}

