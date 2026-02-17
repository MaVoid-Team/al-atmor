"use client"

import { useTranslations } from "next-intl"
import { useCart } from "@/context/CartContext"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Bundle } from "@/types/bundle"

interface BundleCardProps {
    bundle: Bundle
    className?: string
}

export function BundleCard({
    bundle,
    className,
}: BundleCardProps) {
    const t = useTranslations('Bundles') // We might need to add this namespace
    const tCommon = useTranslations('Common')
    const { addBundleToCart, isAdding } = useCart()

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (bundle.active) {
            addBundleToCart(bundle.id)
        }
    }

    // Calculate total original price to show savings
    // Calculate total original price to show savings
    const totalOriginalPrice = bundle.BundleProducts?.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.Product.price) * item.quantity)
    }, 0) || 0

    const bundlePrice = parseFloat(bundle.price)
    const savings = totalOriginalPrice - bundlePrice
    const savingsPercentage = totalOriginalPrice > 0 ? Math.round((savings / totalOriginalPrice) * 100) : 0

    return (
        <div className={cn(
            "flex flex-col h-full bg-card group overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl border",
            className
        )}>
            {/* Image Section */}
            <div className="bg-muted flex items-center justify-center relative overflow-hidden aspect-4/5 w-full">
                {bundle.imageUrl ? (
                    <Image
                        src={bundle.imageUrl}
                        alt={bundle.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <span className="text-4xl mb-2">📦</span>
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Savings Badge */}
                {savings > 0 && (
                    <div className="absolute top-2 start-2 z-10">
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none shadow-sm text-xs px-2 h-6">
                            {tCommon('save')} {Math.round(savings)} {tCommon('currency')} ({savingsPercentage}%)
                        </Badge>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4 h-full">
                {/* Header */}
                <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-base md:text-lg line-clamp-2 leading-tight">
                        {bundle.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                        {bundle.description || tCommon('noDescription')}
                    </p>

                    {/* Bundle Items Summary */}
                    <div className="pt-2 flex flex-wrap gap-1">
                        {bundle.BundleProducts?.slice(0, 3).map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground">
                                {item.quantity}x {item.Product.name}
                            </Badge>
                        ))}
                        {bundle.BundleProducts?.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground">
                                +{bundle.BundleProducts.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Footer - Price and Action */}
                <div className="mt-4 pt-3 border-t flex flex-col gap-3">
                    <div className="flex items-end justify-between gap-2">
                        <div className="flex flex-col">
                            {savings > 0 && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {tCommon('currency')} {totalOriginalPrice.toFixed(2)}
                                </span>
                            )}
                            <span className="font-bold text-xl text-primary leading-none">
                                {tCommon('currency')} {bundlePrice.toFixed(2)}
                            </span>
                        </div>
                        {savings > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
                                {tCommon('save')} {Math.round(savingsPercentage)}%
                            </Badge>
                        )}
                    </div>

                    <Button
                        size="default"
                        disabled={!bundle.active || isAdding}
                        onClick={handleAddToCart}
                        className="w-full font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                    >
                        {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4 me-2" />
                                {tCommon('addToCart')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
