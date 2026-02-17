"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X } from "lucide-react"
import { ProductType } from "@/hooks/useProductTypes"

interface ProductTypeFormProps {
    productType?: ProductType | null
    onSubmit: (data: { name: string; allowedAttributes: string[] }) => Promise<boolean>
    onCancel: () => void
}

export function ProductTypeForm({ productType, onSubmit, onCancel }: ProductTypeFormProps) {
    const t = useTranslations('Admin.ProductTypes')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState(productType?.name || '')
    const [attributes, setAttributes] = useState<string[]>(productType?.allowedAttributes || [])
    const [newAttribute, setNewAttribute] = useState('')

    const handleAddAttribute = () => {
        const trimmed = newAttribute.trim().toLowerCase().replace(/\s+/g, '_')
        if (trimmed && !attributes.includes(trimmed)) {
            setAttributes([...attributes, trimmed])
            setNewAttribute('')
        }
    }

    const handleRemoveAttribute = (attr: string) => {
        setAttributes(attributes.filter(a => a !== attr))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddAttribute()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const success = await onSubmit({
            name,
            allowedAttributes: attributes,
        })

        setIsSubmitting(false)

        if (success && !productType) {
            // Reset form if creating new
            setName('')
            setAttributes([])
            setNewAttribute('')
        }
    }

    // Format attribute name for display
    const formatAttributeName = (attr: string): string => {
        return attr
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

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
                <p className="text-xs text-muted-foreground">
                    {t('nameHelp')}
                </p>
            </div>

            {/* Allowed Attributes */}
            <div className="space-y-2">
                <Label>{t('allowedAttributes')}</Label>
                <p className="text-xs text-muted-foreground">
                    {t('allowedAttributesHelp')}
                </p>

                {/* Add Attribute Input */}
                <div className="flex gap-2">
                    <Input
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('attributePlaceholder')}
                        disabled={isSubmitting}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddAttribute}
                        disabled={isSubmitting || !newAttribute.trim()}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Attributes List */}
                {attributes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3 p-4 bg-muted/50 rounded-lg border">
                        {attributes.map((attr) => (
                            <Badge
                                key={attr}
                                variant="secondary"
                                className="ps-3 pe-1 py-1.5 flex items-center gap-1 text-sm"
                            >
                                <span className="font-mono">{formatAttributeName(attr)}</span>
                                <span className="text-muted-foreground text-xs">({attr})</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttribute(attr)}
                                    className="ms-1 hover:bg-destructive/20 rounded p-0.5"
                                    disabled={isSubmitting}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                        {t('noAttributes')}
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting || !name}
                    className="flex-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 me-2 animate-spin" />
                            {productType ? t('updating') : t('creating')}
                        </>
                    ) : (
                        productType ? t('update') : t('create')
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
