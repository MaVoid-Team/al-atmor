"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { Category } from "@/hooks/useCategories"

interface CategoryFormProps {
    category?: Category | null
    categories: Category[]
    onSubmit: (formData: FormData) => Promise<boolean>
    onCancel: () => void
}

export function CategoryForm({ category, categories, onSubmit, onCancel }: CategoryFormProps) {
    const t = useTranslations('Admin.Categories')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState(category?.name || '')
    const [slug, setSlug] = useState(category?.slug || '')
    const [parentId, setParentId] = useState<string>(category?.parentId?.toString() || 'none')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(category?.imageUrl || null)

    // Auto-generate slug from name
    useEffect(() => {
        if (!category && name) {
            const generatedSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setSlug(generatedSlug)
        }
    }, [name, category])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('name', name)
        formData.append('slug', slug)

        if (parentId !== 'none') {
            formData.append('parentId', parentId)
        }

        if (imageFile) {
            formData.append('image', imageFile)
        }

        const success = await onSubmit(formData)
        setIsSubmitting(false)

        if (success) {
            // Reset form if creating new category
            if (!category) {
                setName('')
                setSlug('')
                setParentId('none')
                setImageFile(null)
                setImagePreview(null)
            }
        }
    }

    // Filter out current category and its descendants from parent options
    const availableParents = categories.filter(cat => {
        if (!category) return true
        if (cat.id === category.id) return false
        // Don't allow selecting a child as parent (prevents circular reference)
        if (cat.parentId === category.id) return false
        return true
    })

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    required
                />
            </div>

            {/* Slug Field */}
            <div className="space-y-2">
                <Label htmlFor="slug">{t('slug')}</Label>
                <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={t('slugPlaceholder')}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    {t('slugHelp')}
                </p>
            </div>

            {/* Parent Category Field */}
            <div className="space-y-2">
                <Label htmlFor="parentId">{t('parentCategory')}</Label>
                <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('selectParent')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t('noParent')}</SelectItem>
                        {availableParents.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    {t('parentHelp')}
                </p>
            </div>

            {/* Image Upload Field */}
            <div className="space-y-2">
                <Label htmlFor="image">{t('image')}</Label>

                {imagePreview ? (
                    <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            unoptimized
                            className="object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 end-2"
                            onClick={handleRemoveImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label
                            htmlFor="image"
                            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        >
                            {t('uploadImage')}
                        </Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                )}

                {!imagePreview && (
                    <Input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2"
                    />
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting || !name || !slug}
                    className="flex-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 me-2 animate-spin" />
                            {category ? t('updating') : t('creating')}
                        </>
                    ) : (
                        category ? t('update') : t('create')
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    {t('cancel')}
                </Button>
            </div>
        </form>
    )
}
