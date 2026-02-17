"use client"

import { useTranslations } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { useRouter } from "@/i18n/navigation"
import ProductForm from "@/components/admin/ProductForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function CreateProductPage() {
    const t = useTranslations("Admin.Products")
    const router = useRouter()
    const { createProduct } = useProducts()

    const handleSubmit = async (formData: FormData) => {
        try {
            const result = await createProduct(formData)
            if (result) {
                toast.success(t("createSuccess"))
                router.push("/admin/products")
            } else {
                toast.error(t("createFailed"))
            }
        } catch (error) {
            console.error("Failed to create product:", error)
            toast.error(t("createFailed"))
        }
    }

    const handleCancel = () => {
        router.push("/admin/products")
    }

    return (
        <div className="space-y-8 bg-background max-w-5xl mx-auto">
            <div className="space-y-4">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToProducts")}
                </Button>

                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("createProduct")}</h1>
                    <p className="text-muted-foreground">{t("createProductDescription")}</p>
                </div>
            </div>

            <ProductForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel={t("createProduct")}
            />
        </div>
    )
}
