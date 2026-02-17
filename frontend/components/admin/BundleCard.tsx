"use client"

import { Bundle } from "@/types/bundle"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Package } from "lucide-react"
import { Link } from "@/i18n/navigation"

interface BundleCardProps {
    bundle: Bundle
    onDelete?: (bundleId: number) => void
}

export function BundleCard({ bundle, onDelete }: BundleCardProps) {
    const t = useTranslations("Admin.Bundles")
    const tCommon = useTranslations("Common")

    const productCount = bundle.BundleProducts?.length || 0
    const totalItems = bundle.BundleProducts?.reduce((sum: number, bp: any) => sum + bp.quantity, 0) || 0

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            {/* Image Section */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                {bundle.imageUrl ? (
                    <Image
                        src={bundle.imageUrl}
                        alt={bundle.name}
                        fill
                        unoptimized
                        className="object-contain p-4 transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
                {/* Status Badge */}
                <Badge
                    variant={bundle.active ? "default" : "secondary"}
                    className="absolute top-2 end-2"
                >
                    {bundle.active ? t("active") : t("inactive")}
                </Badge>
            </div>

            {/* Content Section */}
            <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-1" title={bundle.name}>
                    {bundle.name}
                </h3>
                {bundle.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {bundle.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                        {tCommon("currency")} {parseFloat(bundle.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {productCount} {t("products")} • {totalItems} {t("items")}
                    </span>
                </div>
            </CardContent>

            {/* Actions Footer */}
            <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
                <Button asChild variant="outline" className="flex-1">
                    <Link href={`/admin/bundles/${bundle.id}/edit`}>
                        <Edit className="h-4 w-4 me-2" />
                        {t("edit")}
                    </Link>
                </Button>
                {onDelete && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(bundle.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("delete")}</span>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
