"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useProducts } from "@/hooks/useProducts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchX, ArrowLeft } from "lucide-react"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { ProductsGridSkeleton } from "@/components/products/ProductFilters"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const PRODUCTS_PER_PAGE = 20

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const router = useRouter()
    const t = useTranslations('Search')
    const tPage = useTranslations('ProductsPage')
    const { searchProducts } = useProducts()

    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const doSearch = async () => {
            if (!query || query.length < 2) {
                setProducts([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const results = await searchProducts(query, 50)
                setProducts(results)
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsLoading(false)
            }
        }

        doSearch()
        setCurrentPage(1) // Reset to first page on new search
    }, [query, searchProducts])

    // Pagination calculations
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    const endIndex = startIndex + PRODUCTS_PER_PAGE
    const paginatedProducts = products.slice(startIndex, endIndex)

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (isLoading) {
        return (
            <div className="container max-w-screen-2xl py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Back button skeleton */}
                <Skeleton className="h-10 w-24 mb-4 sm:mb-6" />

                {/* Title skeleton */}
                <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 mb-2" />
                <Skeleton className="h-4 sm:h-5 w-32 sm:w-48 mb-6 sm:mb-8" />

                {/* Products grid skeleton */}
                <ProductsGridSkeleton count={10} gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" />
            </div>
        )
    }

    return (
        <div className="container max-w-screen-2xl py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 sm:mb-6">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('back')}
            </Button>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
                {t('resultsFor', { query })} ({products.length})
            </p>

            {products.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="py-16 text-center flex flex-col items-center justify-center">
                        <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                            <SearchX className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{t('noResults')}</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            {t('tryDifferentKeywords')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {paginatedProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                showMetadata={true}
                                showLowStockWarning={true}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 sm:mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            {tPage('previous')}
                                        </PaginationPrevious>
                                    </PaginationItem>

                                    {getPageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page as number)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            {tPage('next')}
                                        </PaginationNext>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>

                            <div className="text-center mt-4 text-sm text-muted-foreground">
                                {tPage('pageOf', { current: currentPage, total: totalPages })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
