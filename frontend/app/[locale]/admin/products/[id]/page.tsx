"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation"
import ProductDetailView from "@/components/admin/ProductDetailView"
import { Product } from "@/components/products/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ProductDetailPage() {
    const t = useTranslations("Admin.Products")
    const router = useRouter()
    const params = useParams()
    const productId = parseInt(params.id as string)

    const { fetchProductById, deleteProduct, restockProduct } = useProducts()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true)
            const data = await fetchProductById(productId)
            setProduct(data)
            setIsLoading(false)
        }

        if (productId) {
            loadProduct()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]) // Only re-run when productId changes

    const handleEdit = () => {
        router.push(`/admin/products/${productId}/edit`)
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        try {
            const success = await deleteProduct(productId)
            if (success) {
                toast.success(t("deleteSuccess"))
                router.push("/admin/products")
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch (error) {
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleRestock = async (quantity: number) => {
        const result = await restockProduct(productId, quantity)
        if (result.success) {
            toast.success(t("restockSuccess", { quantity, newStock: result.newStockLevel ?? 0 }))
            // Reload product to show updated stock
            const updatedProduct = await fetchProductById(productId)
            setProduct(updatedProduct)
        } else {
            toast.error(t("restockFailed"))
        }
    }

    const handleBack = () => {
        router.push("/admin/products")
    }

    if (isLoading) {
        return (
            <div className="space-y-8 bg-background">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToProducts")}
                </Button>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="space-y-8 bg-background">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToProducts")}
                </Button>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">{t("productNotFound")}</h2>
                    <p className="text-muted-foreground">{t("productNotFoundDescription")}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 bg-background">
            <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {t("backToProducts")}
            </Button>

            <ProductDetailView
                product={product}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onRestock={handleRestock}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deleteProduct")}</DialogTitle>
                        <DialogDescription>{t("deleteConfirmation")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t("deleting") : t("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
