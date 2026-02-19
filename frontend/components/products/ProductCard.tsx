"use client"

import { useTranslations } from "next-intl"
import { useCart } from "@/context/CartContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { ShoppingCart, Loader2, Pencil, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export interface Product {
    id: number
    name: string
    sku?: string
    price: string
    stockStatusOverride?: string | null
    quantity: number
    stockLabel: string
    isPurchasable: boolean
    manufacturerId?: number
    categoryId?: number
    productTypeId?: number
    manufacturer?: {
        id: number
        name: string
    }
    category?: {
        id: number
        name: string
    }
    productType?: {
        id: number
        name: string
    }
    // Admin-specific fields
    imageUrl?: string
    stock?: number
    specs?: string | Record<string, any>
}

interface ProductCardProps {
    product: Product
    /** Whether to show the product image placeholder */
    showImage?: boolean
    /** Whether clicking the card navigates to product page */
    clickable?: boolean
    /** Additional class names */
    className?: string
    /** Whether to show low stock warning (User mode) */
    showLowStockWarning?: boolean
    /** Whether to show metadata (manufacturer, category, type) */
    showMetadata?: boolean

    // Props for Unified Card
    /** Admin mode: enables edit/delete actions, shows SKU and stock count */
    isAdmin?: boolean
    /** Shows "Best Seller" badge */
    isBestSeller?: boolean
    /** Shows "New" badge */
    isJustAdded?: boolean
    /** Callback for delete action (Admin mode) */
    onDelete?: (id: number) => void
}

export function ProductCard({
    product,
    showImage = true,
    clickable = true,
    className,
    showLowStockWarning = true,
    showMetadata = true,
    isAdmin = false,
    isBestSeller = false,
    isJustAdded = false,
    onDelete,
}: ProductCardProps) {
    const t = useTranslations('Products')
    const tCommon = useTranslations('Common')
    const tAdmin = useTranslations('Admin.Products')
    const { addToCart, isAdding } = useCart()

    const getStockBadgeColor = (stockLabel: string) => {
        switch (stockLabel) {
            case 'in_stock':
                return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
            case 'low_stock':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            case 'out_of_stock':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            case 'pre_order':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const getStockLabel = (stockLabel: string) => {
        const labels: Record<string, string> = {
            in_stock: t('inStock'),
            low_stock: t('lowStock'),
            out_of_stock: t('outOfStock'),
            pre_order: t('preOrder')
        }
        return labels[stockLabel] || stockLabel
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.isPurchasable) {
            addToCart(product.id)
        }
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onDelete) {
            onDelete(product.id)
        }
    }

    const stockQuantity = product.stock ?? product.quantity ?? 0

    const cardContent = (
        <>
            {showImage && (
                <div className="bg-muted flex items-center justify-center relative overflow-hidden aspect-4/5 w-full">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-fit p-2 transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <span className="text-4xl text-muted-foreground/50">📦</span>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute flex z-10 top-2 start-2 flex-col gap-1">
                        {isBestSeller && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm text-[10px] px-1.5 h-5">
                                Best Seller
                            </Badge>
                        )}
                        {isJustAdded && (
                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-sm text-[10px] px-1.5 h-5">
                                New
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-1 flex-col p-3 md:p-4 h-full">
                {/* Upper content area - grows to fill available space */}
                <div className="flex-1">
                    <CardHeader className="p-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className="font-semibold line-clamp-2 h-[2.5em] md:h-[3em] text-sm md:text-base leading-tight md:leading-snug">
                                {product.name}
                            </CardTitle>
                        </div>
                        {/* Admin SKU */}
                        {isAdmin && product.sku && (
                            <p className="text-xs text-muted-foreground font-mono">
                                SKU: {product.sku}
                            </p>
                        )}
                    </CardHeader>

                    {/* Product metadata - reserve space even when empty for consistent height */}
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-2 h-6 overflow-hidden">
                        {showMetadata && (
                            <>
                                {product.manufacturer && (
                                    <span className="inline-flex items-center gap-1 font-medium text-foreground truncate max-w-full">
                                        {product.manufacturer.name}
                                    </span>
                                )}
                                {product.productType && (
                                    <span className="inline-flex items-center gap-1 truncate max-w-full">
                                        • {product.productType.name}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom section - price, stock, and button - always at bottom */}
                <div className="mt-auto pt-3 flex flex-col gap-3">
                    <div className="space-y-1">
                        <div className="flex items-end justify-between gap-2 flex-wrap">
                            <div className="font-bold text-xl text-primary leading-none">
                                {tCommon('currency')} {parseFloat(product.price).toFixed(2)}
                            </div>

                            {/* Stock Status Badge */}
                            {isAdmin ? (
                                <Badge variant={stockQuantity > 0 ? "default" : "destructive"} className="h-fit">
                                    {stockQuantity > 0 ? `${stockQuantity} ${t('inStock')}` : t('outOfStock')}
                                </Badge>
                            ) : (
                                <span
                                    className={cn(
                                        "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight border",
                                        getStockBadgeColor(product.stockLabel)
                                    )}
                                >
                                    {getStockLabel(product.stockLabel)}
                                </span>
                            )}
                        </div>

                        {/* Low Stock Warning (User only) - reserve space for consistent height */}
                        <div className="h-4">
                            {!isAdmin && showLowStockWarning && product.quantity > 0 && product.quantity <= 5 && (
                                <CardDescription className="text-xs text-orange-600 font-medium">
                                    {t('onlyLeft', { count: product.quantity })}
                                </CardDescription>
                            )}
                        </div>
                    </div>

                    <CardFooter className="p-0 gap-2 min-w-[120px]">
                        {isAdmin ? (
                            <div className="flex gap-2 w-full mx-1">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link href={`/admin/products/${product.id}`}>
                                        <Eye className="h-4 w-4 me-2" />
                                        {tAdmin('viewDetails')}
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                                size="default"
                                disabled={!product.isPurchasable || isAdding}
                                onClick={handleAddToCart}
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4 me-2" />
                                        {product.isPurchasable ? t('addToCart') : t('unavailable')}
                                    </>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </div>
            </div>
        </>
    )

    // Layout
    const cardClasses = cn(
        "flex flex-col h-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300 group overflow-hidden rounded-lg",
        clickable && !isAdmin ? "cursor-pointer" : "",
        className
    )

    if (clickable && !isAdmin && product.isPurchasable) {
        return (
            <Link href={`/products/${product.id}`} className="block h-full">
                <div className={cardClasses}>
                    {cardContent}
                </div>
            </Link>
        )
    }

    return (
        <div className={cardClasses}>
            {cardContent}
        </div>
    )
}
