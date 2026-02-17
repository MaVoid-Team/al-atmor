"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useDebounce } from "@/hooks/useDebounce"
import { useCategories } from "@/hooks/useCategories"
import { useManufacturers } from "@/hooks/useManufacturers"
import { Button } from "@/components/ui/button"
import { ProductSearchBar } from "@/components/products/ProductSearchBar"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { CategoriesGrid } from "@/components/products/CategoriesGrid"
import {
    ProductFilters,
    ProductsGridSkeleton,
    AllProductsPageSkeleton,
    ProductType
} from "@/components/products/ProductFilters"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Filter, X } from "lucide-react"

const PRODUCTS_PER_PAGE = 6

interface AllProductsProps {
    /** Initial search query */
    initialSearch?: string
    /** Whether to show the integrated search bar */
    showSearch?: boolean
    /** Custom title for the page */
    title?: string
    /** Whether to show the title */
    showTitle?: boolean
    /** Initial manufacturer ID filter */
    initialManufacturerId?: number
    /** Initial product type ID filter */
    initialProductTypeId?: number
    /** Initial category ID filter */
    initialCategoryId?: number
}

export function AllProducts({
    initialSearch = '',
    showSearch = false,
    title,
    showTitle = true,
    initialManufacturerId,
    initialProductTypeId,
    initialCategoryId
}: AllProductsProps = {}) {
    const t = useTranslations('AllProducts')
    const tPage = useTranslations('ProductsPage')

    // Use hooks for categories and manufacturers
    const { categories, isLoading: loadingCategories } = useCategories()
    const { manufacturers, isLoading: loadingManufacturers } = useManufacturers()

    const [products, setProducts] = useState<Product[]>([])
    const [productTypes, setProductTypes] = useState<ProductType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Search state with debounce
    const [searchQuery, setSearchQuery] = useState(initialSearch)
    const debouncedSearch = useDebounce(searchQuery, 300)

    // Filter states - initialize with URL parameters if provided
    const [selectedManufacturers, setSelectedManufacturers] = useState<number[]>(
        initialManufacturerId ? [initialManufacturerId] : []
    )
    const [selectedProductTypes, setSelectedProductTypes] = useState<number[]>(
        initialProductTypeId ? [initialProductTypeId] : []
    )
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        initialCategoryId || null
    )
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
    const [showFilters, setShowFilters] = useState(true)
    const [inStockOnly, setInStockOnly] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Build query parameters for products
                const params = new URLSearchParams({
                    page: '1',
                    limit: '50',
                });

                if (debouncedSearch) params.append('search', debouncedSearch);
                if (selectedCategory) params.append('categoryId', selectedCategory.toString());
                selectedManufacturers.forEach(id => params.append('manufacturerId', id.toString()));
                selectedProductTypes.forEach(id => params.append('productTypeId', id.toString()));
                if (inStockOnly) params.append('in_stock', 'true');

                // Fetch products with filters
                const productsRes = await fetch(`/api/products?${params.toString()}`);
                const productsData = await productsRes.json();
                const fetchedProducts = productsData.data || [];
                setProducts(fetchedProducts);

                // Dynamically set price range based on actual product prices
                if (fetchedProducts.length > 0) {
                    const prices = fetchedProducts.map((p: Product) => parseFloat(p.price));
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));

                    // Only update price range if it's at default values or if we need to expand it
                    setPriceRange(prev => {
                        // If current range is default or doesn't cover all products, update it
                        if (prev[0] === 0 && prev[1] === 5000) {
                            return [minPrice, maxPrice];
                        }
                        // Expand range if needed to include all products
                        return [
                            Math.min(prev[0], minPrice),
                            Math.max(prev[1], maxPrice)
                        ];
                    });
                }

                // Fetch product types on initial load (no hook available yet)
                if (productTypes.length === 0) {
                    const productTypesRes = await fetch('/api/productTypes');
                    const productTypesData = await productTypesRes.json();
                    setProductTypes(productTypesData.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [debouncedSearch, selectedCategory, selectedManufacturers, selectedProductTypes, inStockOnly]);

    const toggleManufacturer = (id: number) => {
        setSelectedManufacturers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const toggleProductType = (id: number) => {
        setSelectedProductTypes(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const clearFilters = () => {
        setSelectedManufacturers([])
        setSelectedProductTypes([])
        setSelectedCategory(null)
        setInStockOnly(false)
        setSearchQuery('')
        setCurrentPage(1)

        // Reset price range to show all products
        if (products.length > 0) {
            const prices = products.map(p => parseFloat(p.price));
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            setPriceRange([minPrice, maxPrice]);
        } else {
            setPriceRange([0, 5000]);
        }
    }

    // Client-side price range filtering only (other filters are server-side via API)
    const filteredProducts = products.filter(product => {
        const price = parseFloat(product.price)
        return price >= priceRange[0] && price <= priceRange[1]
    })

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    const endIndex = startIndex + PRODUCTS_PER_PAGE
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (isLoading) {
        return <AllProductsPageSkeleton />
    }

    return (
        <div className={`max-w-screen-3xl py-8 px-4 md:px-8 lg:px-28`}>
            {/* Header Section */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    {showTitle && (
                        <div className="border-s-4 border-primary ps-4">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary">
                                {title || t('title')}
                            </h1>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden"
                    >
                        <Filter className="h-4 w-4 me-2" />
                        {showFilters ? t('hideFilters') : t('showFilters')}
                    </Button>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <ProductSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        className="max-w-2xl"
                    />
                )}

                {/* Active Filters Summary */}
                {(searchQuery || selectedCategory || selectedManufacturers.length > 0 || selectedProductTypes.length > 0 || inStockOnly) && showSearch && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">{tPage('activeFilters')}:</span>
                        {searchQuery && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="h-7 gap-1"
                            >
                                "{searchQuery}"
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                        {selectedCategory && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                                className="h-7 gap-1"
                            >
                                {categories.find(c => c.id === selectedCategory)?.name}
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                        {selectedManufacturers.map(id => (
                            <Button
                                key={id}
                                variant="secondary"
                                size="sm"
                                onClick={() => toggleManufacturer(id)}
                                className="h-7 gap-1"
                            >
                                {manufacturers.find(m => m.id === id)?.name}
                                <X className="h-3 w-3" />
                            </Button>
                        ))}
                        {selectedProductTypes.map(id => (
                            <Button
                                key={id}
                                variant="secondary"
                                size="sm"
                                onClick={() => toggleProductType(id)}
                                className="h-7 gap-1"
                            >
                                {productTypes.find(p => p.id === id)?.name}
                                <X className="h-3 w-3" />
                            </Button>
                        ))}
                        {inStockOnly && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setInStockOnly(false)}
                                className="h-7 gap-1"
                            >
                                {t('inStockOnly')}
                                <X className="h-3 w-3" />
                            </Button>
                        )}
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

            {/* Categories Carousel */}
            <div className="mb-8">
                <div className="border-s-4 border-primary ps-4 mb-4">
                    <h2 className="text-xl font-semibold text-primary">{t('categories')}</h2>
                </div>
                <CategoriesGrid
                    categories={categories}
                    selectedCategoryId={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    variant="carousel"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <ProductFilters
                    manufacturers={manufacturers}
                    productTypes={productTypes}
                    selectedManufacturers={selectedManufacturers}
                    selectedProductTypes={selectedProductTypes}
                    priceRange={priceRange}
                    inStockOnly={inStockOnly}
                    onManufacturerToggle={toggleManufacturer}
                    onProductTypeToggle={toggleProductType}
                    onPriceRangeChange={setPriceRange}
                    onInStockOnlyChange={setInStockOnly}
                    onClearFilters={clearFilters}
                    isVisible={showFilters}
                    minPrice={products.length > 0 ? Math.floor(Math.min(...products.map(p => parseFloat(p.price)))) : 0}
                    maxPrice={products.length > 0 ? Math.ceil(Math.max(...products.map(p => parseFloat(p.price)))) : 5000}
                />

                {/* Products Grid */}
                <div className="flex-1">
                    <div className="mb-4 text-sm text-muted-foreground">
                        {t('showing', { count: filteredProducts.length })}
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6`}>
                        {paginatedProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                showMetadata={true}
                                showLowStockWarning={true}
                            />
                        ))}
                    </div>

                    {paginatedProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t('noProducts')}</p>
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
        </div>
    )
}
