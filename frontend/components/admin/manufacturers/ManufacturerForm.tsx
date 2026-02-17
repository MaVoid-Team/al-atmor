"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Building2 } from "lucide-react"
import Image from "next/image"
import { Manufacturer } from "@/hooks/useManufacturers"

interface ManufacturerFormProps {
    manufacturer?: Manufacturer | null
    onSubmit: (data: { name: string; logoUrl?: string }) => Promise<boolean>
    onCancel: () => void
}

// Helper to validate URL format before showing preview
const isValidUrl = (url: string): boolean => {
    if (!url || url.length < 10) return false
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

export function ManufacturerForm({ manufacturer, onSubmit, onCancel }: ManufacturerFormProps) {
    const t = useTranslations('Admin.Manufacturers')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState(manufacturer?.name || '')
    const [logoUrl, setLogoUrl] = useState(manufacturer?.logoUrl || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const data: { name: string; logoUrl?: string } = { name }
        if (logoUrl.trim()) {
            data.logoUrl = logoUrl.trim()
        }

        const success = await onSubmit(data)
        setIsSubmitting(false)

        if (success) {
            // Reset form if creating new manufacturer
            if (!manufacturer) {
                setName('')
                setLogoUrl('')
            }
        }
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

            {/* Logo URL Field */}
            <div className="space-y-2">
                <Label htmlFor="logoUrl">{t('logoUrl')}</Label>
                <Input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder={t('logoUrlPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                    {t('logoUrlHelp')}
                </p>
            </div>

            {/* Logo Preview - only show when URL is valid */}
            {isValidUrl(logoUrl) && (
                <div className="space-y-2">
                    <Label>{t('logoPreview')}</Label>
                    <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-muted">
                        <Image
                            src={logoUrl}
                            alt={name || 'Logo preview'}
                            fill
                            unoptimized
                            className="object-contain p-4"
                            onError={(e) => {
                                // Hide broken images
                                e.currentTarget.style.display = 'none'
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                    </div>
                </div>
            )}

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
                            {manufacturer ? t('updating') : t('creating')}
                        </>
                    ) : (
                        manufacturer ? t('update') : t('create')
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

