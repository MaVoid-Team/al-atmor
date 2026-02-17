"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import Image from "next/image"
import { FolderTree, ChevronLeft, ChevronRight } from "lucide-react"
import { useLocale } from "next-intl"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export interface Category {
    id: number
    name: string
    slug: string
    parentId: number | null
    imageUrl?: string | null
    imagePublicId?: string | null
}

interface CategoriesGridProps {
    /** List of categories to display */
    categories: Category[]
    /** Currently selected category ID */
    selectedCategoryId: number | null
    /** Callback when a category is selected */
    onSelectCategory: (categoryId: number | null) => void
    /** Whether data is loading */
    isLoading?: boolean
    /** Display variant - grid or carousel */
    variant?: "grid" | "carousel"
    /** Show parent category name for subcategories */
    showParentName?: boolean
    /** Additional class names */
    className?: string
}

export function CategoriesGrid({
    categories,
    selectedCategoryId,
    onSelectCategory,
    isLoading = false,
    variant = "grid",
    showParentName = true,
    className,
}: CategoriesGridProps) {
    // Get parent category name helper
    const getParentName = (parentId: number | null) => {
        if (!parentId) return null
        return categories.find(c => c.id === parentId)?.name
    }

    // Handle category click with toggle behavior
    const handleCategoryClick = (categoryId: number) => {
        if (selectedCategoryId === categoryId) {
            onSelectCategory(null) // Deselect if clicking the same category
        } else {
            onSelectCategory(categoryId)
        }
    }

    // RTL support
    const locale = useLocale()
    const isRtl = locale === 'ar'

    if (isLoading) {
        if (variant === "carousel") {
            return (
                <div className={cn("flex gap-4 overflow-hidden", className)}>
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-20 min-w-[150px] rounded-lg flex-shrink-0" />
                    ))}
                </div>
            )
        }
        return (
            <div className={cn("grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3", className)}>
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
        )
    }

    if (variant === "carousel") {
        // Filter root categories (no parent)
        const rootCategories = categories.filter(cat => !cat.parentId)

        // Get subcategories of selected category
        const selectedRootCategory = selectedCategoryId
            ? categories.find(cat => cat.id === selectedCategoryId)
            : null

        // If selected category has a parent, find the root parent
        const actualRootId = selectedRootCategory?.parentId || selectedCategoryId

        // Only show subcategories if a category is actually selected and has children
        const subcategories = actualRootId
            ? categories.filter(cat => cat.parentId === actualRootId)
            : []

        return (
            <div className="space-y-4">
                {/* Navigation Header */}
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="categories-prev rounded-full h-8 w-8"
                    >
                        {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="categories-next rounded-full h-8 w-8"
                    >
                        {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Root Categories Carousel */}
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={2}
                    slidesPerView={3}
                    navigation={{
                        prevEl: '.categories-prev',
                        nextEl: '.categories-next',
                    }}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        480: { slidesPerView: 4 },
                        640: { slidesPerView: 5 },
                        768: { slidesPerView: 6 },
                        1024: { slidesPerView: 8 },
                        1280: { slidesPerView: 10 },
                        1536: { slidesPerView: 12 },
                    }}
                    className={cn("pb-12 categories-swiper", className)}
                >
                    {rootCategories.map(category => {
                        const isSelected = selectedCategoryId === category.id || actualRootId === category.id
                        const hasChildren = categories.some(cat => cat.parentId === category.id)

                        return (
                            <SwiperSlide key={category.id}>
                                <div
                                    className={cn(
                                        "cursor-pointer transition-all duration-300 group flex flex-col items-center gap-2",
                                    )}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    {/* Circular Category Image */}
                                    <div className={cn(
                                        "relative overflow-hidden rounded-full transition-all duration-300",
                                        "w-16 h-16 sm:w-20 sm:h-20",
                                        isSelected
                                            ? "ring-2 ring-primary shadow-lg scale-105"
                                            : "ring-1 ring-border hover:ring-primary/50 hover:shadow-md"
                                    )}>
                                        {category.imageUrl ? (
                                            <Image
                                                src={category.imageUrl}
                                                alt={category.name}
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                <FolderTree className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/40" />
                                            </div>
                                        )}

                                        {/* Indicator for subcategories */}
                                        {hasChildren && (
                                            <div className="absolute bottom-0 end-0 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                                                <span className="text-[8px] text-primary-foreground font-bold">+</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Name */}
                                    <p className={cn(
                                        "text-xs sm:text-sm font-medium text-center line-clamp-2 transition-colors",
                                        isSelected
                                            ? "text-primary"
                                            : "text-foreground group-hover:text-primary"
                                    )}>
                                        {category.name}
                                    </p>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>

                {/* Subcategories Carousel - Only show if there are subcategories */}
                {subcategories.length > 0 && (
                    <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-3 px-1">
                            {categories.find(c => c.id === actualRootId)?.name}
                        </p>
                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={2}
                            slidesPerView={3}
                            navigation
                            breakpoints={{
                                480: { slidesPerView: 4 },
                                640: { slidesPerView: 5 },
                                768: { slidesPerView: 6 },
                                1024: { slidesPerView: 8 },
                                1280: { slidesPerView: 10 },
                                1536: { slidesPerView: 12 },
                            }}
                        >
                            {subcategories.map(category => {
                                const isSelected = selectedCategoryId === category.id

                                return (
                                    <SwiperSlide key={category.id}>
                                        <div
                                            className={cn(
                                                "cursor-pointer transition-all duration-300 group flex flex-col items-center gap-2",
                                            )}
                                            onClick={() => handleCategoryClick(category.id)}
                                        >
                                            {/* Smaller Circular Image for Subcategories */}
                                            <div className={cn(
                                                "relative overflow-hidden rounded-full transition-all duration-300",
                                                "w-12 h-12 sm:w-16 sm:h-16",
                                                isSelected
                                                    ? "ring-2 ring-primary shadow-lg scale-105"
                                                    : "ring-1 ring-border hover:ring-primary/50 hover:shadow-md"
                                            )}>
                                                {category.imageUrl ? (
                                                    <Image
                                                        src={category.imageUrl}
                                                        alt={category.name}
                                                        fill
                                                        unoptimized
                                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <FolderTree className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground/40" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subcategory Name */}
                                            <p className={cn(
                                                "text-[10px] sm:text-xs font-medium text-center line-clamp-2 transition-colors",
                                                isSelected
                                                    ? "text-primary"
                                                    : "text-muted-foreground group-hover:text-primary"
                                            )}>
                                                {category.name}
                                            </p>
                                        </div>
                                    </SwiperSlide>
                                )
                            })}
                        </Swiper>
                    </div>
                )}
            </div>
        )
    }

    // Grid variant
    return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", className)}>
            {categories.map((category) => (
                <Card
                    key={category.id}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-lg overflow-hidden group bg-background",
                        selectedCategoryId === category.id
                            ? "ring-2 ring-primary border-primary shadow-md"
                            : "hover:border-primary/50"
                    )}
                    onClick={() => handleCategoryClick(category.id)}
                >
                    {/* Category Image */}
                    <div className="aspect-square relative overflow-hidden">
                        {category.imageUrl ? (
                            <Image
                                src={category.imageUrl}
                                alt={category.name}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <FolderTree className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                        )}
                    </div>

                    {/* Category Name */}
                    <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium line-clamp-2">
                            {category.name}
                        </p>
                        {showParentName && category.parentId && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                                {getParentName(category.parentId)}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
