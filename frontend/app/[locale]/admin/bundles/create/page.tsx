"use client"

import { useTranslations } from "next-intl"
import { useBundles } from "@/hooks/useBundles"
import { useRouter } from "@/i18n/navigation"
import BundleForm from "@/components/admin/BundleForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function CreateBundlePage() {
    const t = useTranslations("Admin.Bundles")
    const router = useRouter()
    const { createBundle } = useBundles()

    const handleSubmit = async (formData: FormData) => {
        try {
            const result = await createBundle(formData)
            if (result) {
                toast.success(t("createSuccess"))
                router.push("/admin/bundles")
            } else {
                toast.error(t("createFailed"))
            }
        } catch (error) {
            console.error("Failed to create bundle:", error)
            toast.error(t("createFailed"))
        }
    }

    const handleCancel = () => {
        router.push("/admin/bundles")
    }

    return (
        <div className="space-y-8 bg-background max-w-5xl mx-auto">
            <div className="space-y-4">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToBundles")}
                </Button>

                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("createBundle")}</h1>
                    <p className="text-muted-foreground">{t("createBundleDescription")}</p>
                </div>
            </div>

            <BundleForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel={t("createBundle")}
            />
        </div>
    )
}
