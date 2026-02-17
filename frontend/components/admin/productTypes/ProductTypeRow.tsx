"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { ProductType } from "@/hooks/useProductTypes"

interface ProductTypeRowProps {
    productType: ProductType
    onEdit: (productType: ProductType) => void
    onDelete: (productTypeId: number) => void
}

export function ProductTypeRow({ productType, onEdit, onDelete }: ProductTypeRowProps) {
    const t = useTranslations('Admin.ProductTypes')

    // Format attribute name for display
    const formatAttributeName = (attr: string): string => {
        return attr
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <TableRow>
            <TableCell className="font-medium">{productType.id}</TableCell>
            <TableCell className="font-semibold">{productType.name}</TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1.5">
                    {productType.allowedAttributes.length > 0 ? (
                        productType.allowedAttributes.map((attr) => (
                            <Badge key={attr} variant="outline" className="font-mono text-xs">
                                {formatAttributeName(attr)}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-sm">{t('noAttributes')}</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(productType)}
                        title={t('edit')}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(productType.id)}
                        title={t('delete')}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}
