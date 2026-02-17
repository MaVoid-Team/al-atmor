"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useDebounce } from "@/hooks/useDebounce"
import { Button } from "@/components/ui/button"
import { BundleCard } from "@/components/bundles/BundleCard"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Filter, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Bundle } from "@/types/bundle"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"

const BUNDLES_PER_PAGE = 8

interface AllBundlesProps {
    initialSearch?: string
    showSearch?: boolean
    title?: string
    showTitle?: boolean
}

export function AllBundles({
    initialSearch = '',
    showSearch = false,
    title,
    showTitle = true,
}: AllBundlesProps = {}) {
    const t = useTranslations('AllProducts') // Reusing some strings
    const tBundles = useTranslations('Bundles') // Make sure to add this namespace or use Admin.Bundles if applicable but public preferred
    const tPage = useTranslations('ProductsPage')
    const tCommon = useTranslations('Common')

    const [bundles, setBundles] = useState<Bundle[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Search state with debounce
    const [searchQuery, setSearchQuery] = useState(initialSearch)
    const debouncedSearch = useDebounce(searchQuery, 300)

    // Price range could be added later, currently basic search
    const [currentPage, setCurrentPage] = useState(1)
    const [totalBundles, setTotalBundles] = useState(0)

    useEffect(() => {
        const fetchBundles = async () => {
            setIsLoading(true);
            try {
                // Build query parameters
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: BUNDLES_PER_PAGE.toString(),
                    activeOnly: 'true'
                });

                if (debouncedSearch) params.append('search', debouncedSearch);

                const response = await fetch(`/api/bundles?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setBundles(data.bundles || []);
                    setTotalBundles(data.total || 0);
                } else {
                    setBundles([]);
                    setTotalBundles(0);
                }
            } catch (error) {
                console.error('Failed to fetch bundles:', error);
                setBundles([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBundles();
    }, [debouncedSearch, currentPage]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);


    const totalPages = Math.ceil(totalBundles / BUNDLES_PER_PAGE)

    // Generate page numbers
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            if (currentPage < totalPages - 2) pages.push('...')
            if (totalPages > 1) pages.push(totalPages)
        }
        return pages
    }

    const clearFilters = () => {
        setSearchQuery('')
        setCurrentPage(1)
    }

    if (isLoading && bundles.length === 0) {
        return (
            <div className="max-w-screen-3xl py-8 px-4 md:px-8 lg:px-28">
                <div className="flex flex-col gap-6 mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {title || tBundles('title')}
                    </h1>
                    <StatsCardSkeleton count={3} columns="3" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-screen-3xl py-8 px-4 md:px-8 lg:px-28">
            {/* Header Section */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    {showTitle && (
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            {title || tBundles('title')}
                        </h1>
                    )}
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={tBundles('searchPlaceholder') || "Search bundles..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                )}

                {/* Active Filters Summary */}
                {searchQuery && showSearch && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">{tPage('activeFilters')}:</span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="h-7 gap-1"
                        >
                            "{searchQuery}"
                            <X className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-7 text-destructive hover:text-destructive"
                        >
                            {tPage('clearAll')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Bundles Grid */}
            <div className="flex flex-col gap-6">
                <div className="mb-4 text-sm text-muted-foreground">
                    Showing {bundles.length} results
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {bundles.map(bundle => (
                        <BundleCard
                            key={bundle.id}
                            bundle={bundle}
                        />
                    ))}
                </div>

                {bundles.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{tBundles('noBundles') || "No bundles found."}</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8">
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
            </div>
        </div>
    )
}
