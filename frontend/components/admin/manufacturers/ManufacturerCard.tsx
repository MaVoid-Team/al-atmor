"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Building2 } from "lucide-react"
import Image from "next/image"
import { Manufacturer } from "@/hooks/useManufacturers"

interface ManufacturerCardProps {
    manufacturer: Manufacturer
    onEdit: (manufacturer: Manufacturer) => void
    onDelete: (manufacturerId: number) => void
}

export function ManufacturerCard({ manufacturer, onEdit, onDelete }: ManufacturerCardProps) {
    const t = useTranslations('Admin.Manufacturers')

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image Section */}
            <div className="aspect-video bg-muted relative">
                {manufacturer.logoUrl ? (
                    <Image
                        src={manufacturer.logoUrl}
                        alt={manufacturer.name}
                        fill
                        unoptimized
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{manufacturer.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {manufacturer.id}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {t('manufacturer')}
                    </Badge>
                </div>
            </CardContent>

            {/* Actions Section */}
            <CardFooter className="p-4 pt-0 gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(manufacturer)}
                >
                    <Pencil className="h-4 w-4 me-2" />
                    {t('edit')}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(manufacturer.id)}
                >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t('delete')}
                </Button>
            </CardFooter>
        </Card>
    )
}
