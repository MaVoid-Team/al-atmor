"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, FolderTree } from "lucide-react"
import Image from "next/image"
import { Category } from "@/hooks/useCategories"

interface CategoryCardProps {
    category: Category
    onEdit: (category: Category) => void
    onDelete: (categoryId: number) => void
    allCategories: Category[]
}

export function CategoryCard({ category, onEdit, onDelete, allCategories }: CategoryCardProps) {
    const t = useTranslations('Admin.Categories')

    // Find parent category name if exists
    const parentCategory = category.parentId
        ? allCategories.find(cat => cat.id === category.parentId)
        : null

    // Find child categories
    const childCategories = allCategories.filter(cat => cat.parentId === category.id)

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image Section */}
            <div className="aspect-video bg-muted relative">
                {category.imageUrl ? (
                    <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <FolderTree className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {parentCategory && (
                        <Badge variant="secondary" className="text-xs">
                            Parent: {parentCategory.name}
                        </Badge>
                    )}
                    {childCategories.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {childCategories.length} {childCategories.length === 1 ? 'Subcategory' : 'Subcategories'}
                        </Badge>
                    )}
                    {!parentCategory && childCategories.length === 0 && (
                        <Badge variant="default" className="text-xs">
                            Root Category
                        </Badge>
                    )}
                </div>
            </CardContent>

            {/* Actions Section */}
            <CardFooter className="p-4 pt-0 gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(category)}
                >
                    <Pencil className="h-4 w-4 me-2" />
                    {t('edit')}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(category.id)}
                >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t('delete')}
                </Button>
            </CardFooter>
        </Card>
    )
}
