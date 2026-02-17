"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"
import { Product } from "@/components/products/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package } from "lucide-react"
import { toast } from "sonner"
import RestockDialog from "@/components/admin/RestockDialog"

export default function EditProductPage() {
    const t = useTranslations("Admin.Products")
    const router = useRouter()
    const params = useParams()
    const productId = parseInt(params.id as string)

    const { fetchProductById, updateProduct, restockProduct } = useProducts()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [restockDialogOpen, setRestockDialogOpen] = useState(false)

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

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            const result = await updateProduct(productId, formData)
            if (result) {
                toast.success(t("updateSuccess"))
                router.push("/admin/products")
            } else {
                toast.error(t("updateFailed"))
            }
        } catch (error) {
            console.error("Failed to update product:", error)
            toast.error(t("updateFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push("/admin/products")
    }

    const handleRestock = async (quantity: number) => {
        const result = await restockProduct(productId, quantity)
        if (result.success) {
            toast.success(t("restockSuccess", { quantity, newStock: result.newStockLevel ?? 0 }))
            // Reload product to show updated stock
            const updatedProduct = await fetchProductById(productId)
            setProduct(updatedProduct)
            setRestockDialogOpen(false)
        } else {
            toast.error(t("restockFailed"))
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8 bg-background max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleCancel}>
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
            <div className="space-y-8 bg-background max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleCancel}>
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
        <div className="space-y-8 bg-background max-w-5xl mx-auto">
            <div className="space-y-4">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToProducts")}
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("editProduct")}</h1>
                        <p className="text-muted-foreground">{t("editProductDescription")}</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setRestockDialogOpen(true)}
                    >
                        <Package className="h-4 w-4 me-2" />
                        {t("restock")}
                    </Button>
                </div>
            </div>

            <ProductForm
                mode="edit"
                initialData={{
                    name: product.name,
                    sku: product.sku || "",
                    price: product.price,
                    manufacturerId: product.manufacturerId?.toString() || "",
                    categoryId: product.categoryId?.toString() || "",
                    productTypeId: product.productTypeId?.toString() || "",
                    quantity: (product.stock ?? product.quantity ?? 0).toString(),
                    specs: typeof product.specs === "string" ? product.specs : JSON.stringify(product.specs || {}),
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
                submitLabel={t("updateProduct")}
            />

            {/* Restock Dialog */}
            <RestockDialog
                open={restockDialogOpen}
                onOpenChange={setRestockDialogOpen}
                onRestock={handleRestock}
                productName={product.name}
                currentStock={product.stock ?? product.quantity ?? 0}
                isLoading={false}
            />
        </div>
    )
}
