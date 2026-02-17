"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Product } from "@/components/products/ProductCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Package } from "lucide-react"
import Image from "next/image"
import RestockDialog from "@/components/admin/RestockDialog"

interface ProductDetailViewProps {
    product: Product
    onEdit: () => void
    onDelete: () => void
    onRestock?: (quantity: number) => Promise<void>
}

export default function ProductDetailView({ product, onEdit, onDelete, onRestock }: ProductDetailViewProps) {
    const t = useTranslations("Admin.Products")
    const [restockDialogOpen, setRestockDialogOpen] = useState(false)
    const [isRestocking, setIsRestocking] = useState(false)

    // Parse specs if it's a string, handle null/undefined
    let specs: Record<string, any> = {}
    try {
        if (product.specs) {
            specs = typeof product.specs === "string" ? JSON.parse(product.specs) : product.specs
        }
    } catch {
        specs = {}
    }

    // Use quantity from API response (stock is the same as quantity)
    const stockQuantity = product.stock ?? product.quantity ?? 0

    const handleRestock = async (quantity: number) => {
        if (onRestock) {
            setIsRestocking(true)
            try {
                await onRestock(quantity)
            } finally {
                setIsRestocking(false)
            }
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{product.name}</h1>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setRestockDialogOpen(true)} className="flex-1 sm:flex-none">
                        <Package className="h-4 w-4 me-2" />
                        <span className="truncate">{t("restock")}</span>
                    </Button>
                    <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-none">
                        <Pencil className="h-4 w-4 me-2" />
                        <span className="truncate">{t("edit")}</span>
                    </Button>
                    <Button variant="destructive" onClick={onDelete} className="flex-1 sm:flex-none">
                        <Trash2 className="h-4 w-4 me-2" />
                        <span className="truncate">{t("delete")}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image */}
                <Card className="bg-background">
                    <CardContent className="p-3 sm:p-6">
                        <div className="relative w-full h-48 sm:h-64 md:h-96 rounded-lg overflow-hidden">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    {t("noImage")}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Information */}
                <div className="space-y-6">
                    {/* Price and Stock */}
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>{t("priceAndStock")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t("price")}:</span>
                                <span className="text-2xl font-bold text-primary">
                                    {product.price} {t("currency")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t("stock")}:</span>
                                <Badge variant={stockQuantity > 0 ? "default" : "destructive"}>
                                    {stockQuantity > 0 ? `${stockQuantity} ${t("inStock")}` : t("outOfStock")}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>{t("classification")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {product.category && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t("category")}:</span>
                                    <Badge variant="secondary">{product.category.name}</Badge>
                                </div>
                            )}
                            {product.manufacturer && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t("manufacturer")}:</span>
                                    <Badge variant="outline">{product.manufacturer.name}</Badge>
                                </div>
                            )}
                            {product.productType && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t("productType")}:</span>
                                    <Badge variant="default">{product.productType.name}</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("specifications")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(specs).map(([key, value]) => (
                                <div key={key} className="flex items-start justify-between border-b pb-2">
                                    <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                                    <span className="text-muted-foreground text-right">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Restock Dialog */}
            <RestockDialog
                open={restockDialogOpen}
                onOpenChange={setRestockDialogOpen}
                onRestock={handleRestock}
                productName={product.name}
                currentStock={stockQuantity}
                isLoading={isRestocking}
            />
        </div>
    )
}
