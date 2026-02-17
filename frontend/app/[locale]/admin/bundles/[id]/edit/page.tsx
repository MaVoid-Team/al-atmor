"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBundles } from "@/hooks/useBundles"
import { Bundle } from "@/types/bundle"
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation"
import BundleForm from "@/components/admin/BundleForm"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function EditBundlePage() {
    const t = useTranslations("Admin.Bundles")
    const router = useRouter()
    const params = useParams()
    const bundleId = parseInt(params.id as string)

    const { fetchBundleById, updateBundle } = useBundles()
    const [bundle, setBundle] = useState<Bundle | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const loadBundle = async () => {
            setIsLoading(true)
            const data = await fetchBundleById(bundleId)
            setBundle(data)
            setIsLoading(false)
        }

        if (bundleId) {
            loadBundle()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bundleId])

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            const result = await updateBundle(bundleId, formData)
            if (result) {
                toast.success(t("updateSuccess"))
                router.push("/admin/bundles")
            } else {
                toast.error(t("updateFailed"))
            }
        } catch (error) {
            console.error("Failed to update bundle:", error)
            toast.error(t("updateFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push("/admin/bundles")
    }

    if (isLoading) {
        return (
            <div className="space-y-8 bg-background max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToBundles")}
                </Button>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (!bundle) {
        return (
            <div className="space-y-8 bg-background max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToBundles")}
                </Button>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">{t("bundleNotFound")}</h2>
                    <p className="text-muted-foreground">{t("bundleNotFoundDescription")}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 bg-background max-w-5xl mx-auto">
            <div className="space-y-4">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t("backToBundles")}
                </Button>

                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("editBundle")}</h1>
                    <p className="text-muted-foreground">{t("editBundleDescription")}</p>
                </div>
            </div>

            <BundleForm
                mode="edit"
                initialData={bundle}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
                submitLabel={t("updateBundle")}
            />
        </div>
    )
}
