"use client"

import { useState, FormEvent, ChangeEvent, useEffect, useMemo } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, Plus } from "lucide-react"
import Image from "next/image"
import { useCategories } from "@/hooks/useCategories"
import { useManufacturers } from "@/hooks/useManufacturers"
import { useProductTypes, ProductType } from "@/hooks/useProductTypes"
import { CategoryForm } from "./CategoryForm"
import { ManufacturerForm } from "./manufacturers/ManufacturerForm"
import { ProductTypeForm } from "./productTypes/ProductTypeForm"

interface ProductFormData {
    name: string
    sku: string
    price: string
    manufacturerId: string
    categoryId: string
    productTypeId: string
    initialStock?: string
    quantity?: string
    image: File | null
}

interface ProductFormProps {
    initialData?: Partial<ProductFormData> & { specs?: string }
    onSubmit: (formData: FormData) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
    submitLabel?: string
    mode?: 'create' | 'edit'
}

export default function ProductForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    mode = 'create',
}: ProductFormProps) {
    const t = useTranslations("Admin.Products")

    const [formData, setFormData] = useState<ProductFormData>({
        name: initialData?.name || "",
        sku: initialData?.sku || "",
        price: initialData?.price || "",
        manufacturerId: initialData?.manufacturerId || "",
        categoryId: initialData?.categoryId || "",
        productTypeId: initialData?.productTypeId || "",
        initialStock: mode === 'create' ? (initialData?.initialStock || "") : undefined,
        quantity: mode === 'edit' ? (initialData?.quantity || "") : undefined,
        image: null,
    })

    // Specifications state - key-value pairs for each attribute
    const [specsValues, setSpecsValues] = useState<Record<string, string>>({})

    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Quick create dialog states
    const [manufacturerDialogOpen, setManufacturerDialogOpen] = useState(false)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [productTypeDialogOpen, setProductTypeDialogOpen] = useState(false)

    // Use hooks for all data
    const { categories, isLoading: loadingCategories, fetchCategories, createCategory } = useCategories()
    const { manufacturers, isLoading: loadingManufacturers, fetchManufacturers, createManufacturer } = useManufacturers()
    const { productTypes, isLoading: loadingProductTypes, fetchProductTypes, createProductType } = useProductTypes()

    const loadingData = loadingCategories || loadingManufacturers || loadingProductTypes

    // Get current selected product type
    const selectedProductType = useMemo(() => {
        if (!formData.productTypeId) return null
        return productTypes.find(pt => pt.id.toString() === formData.productTypeId) || null
    }, [formData.productTypeId, productTypes])

    // Initialize specs from initial data when editing
    useEffect(() => {
        if (initialData?.specs) {
            try {
                const parsed = JSON.parse(initialData.specs)
                if (typeof parsed === 'object' && parsed !== null) {
                    setSpecsValues(parsed)
                }
            } catch {
                // Invalid JSON, start with empty specs
                setSpecsValues({})
            }
        }
    }, [initialData?.specs])

    // When product type changes, initialize empty values for its attributes
    useEffect(() => {
        if (selectedProductType?.allowedAttributes) {
            setSpecsValues(prev => {
                const newValues: Record<string, string> = {}
                selectedProductType.allowedAttributes.forEach(attr => {
                    // Keep existing value if present, otherwise empty
                    newValues[attr] = prev[attr] || ""
                })
                return newValues
            })
        }
    }, [selectedProductType])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSpecChange = (attribute: string, value: string) => {
        setSpecsValues(prev => ({ ...prev, [attribute]: value }))
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, image: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }))
        setImagePreview(null)
    }

    // Quick create handlers
    const handleManufacturerFormSubmit = async (data: { name: string; logoUrl?: string }): Promise<boolean> => {
        const result = await createManufacturer(data)
        if (result) {
            await fetchManufacturers()
            setFormData(prev => ({ ...prev, manufacturerId: result.id.toString() }))
            setManufacturerDialogOpen(false)
            return true
        }
        return false
    }

    const handleCategoryFormSubmit = async (formData: FormData): Promise<boolean> => {
        const success = await createCategory(formData)
        if (success) {
            await fetchCategories()
            setCategoryDialogOpen(false)
            return true
        }
        return false
    }

    const handleProductTypeFormSubmit = async (data: { name: string; allowedAttributes: string[] }): Promise<boolean> => {
        const result = await createProductType(data)
        if (result) {
            await fetchProductTypes()
            setFormData(prev => ({ ...prev, productTypeId: result.id.toString() }))
            setProductTypeDialogOpen(false)
            return true
        }
        return false
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Build specs JSON from values
            const specsJson = JSON.stringify(specsValues)

            // Create FormData
            const submitData = new FormData()
            submitData.append("name", formData.name)
            submitData.append("sku", formData.sku)
            submitData.append("price", formData.price)
            submitData.append("manufacturerId", formData.manufacturerId)
            submitData.append("categoryId", formData.categoryId)
            submitData.append("productTypeId", formData.productTypeId)

            // Use initialStock for create, quantity for edit
            if (mode === 'create' && formData.initialStock) {
                submitData.append("initialStock", formData.initialStock)
            } else if (mode === 'edit' && formData.quantity) {
                submitData.append("quantity", formData.quantity)
            }

            submitData.append("specs", specsJson)

            if (formData.image) {
                submitData.append("image", formData.image)
            }

            await onSubmit(submitData)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Format attribute name for display (snake_case to Title Case)
    const formatAttributeName = (attr: string): string => {
        return attr
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    if (loadingData) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">{t("loadingForm")}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{submitLabel || t("productDetails")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t("productName")} *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={t("productNamePlaceholder")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">{t("sku")} *</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={t("skuPlaceholder")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">{t("price")} *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={t("pricePlaceholder")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={mode === 'create' ? 'initialStock' : 'quantity'}>
                                    {mode === 'create' ? t("initialStock") : t("quantity")} *
                                </Label>
                                <Input
                                    id={mode === 'create' ? 'initialStock' : 'quantity'}
                                    name={mode === 'create' ? 'initialStock' : 'quantity'}
                                    type="number"
                                    min="0"
                                    value={mode === 'create' ? formData.initialStock : formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={mode === 'create' ? t("initialStockPlaceholder") : t("quantityPlaceholder")}
                                />
                            </div>
                        </div>

                        {/* Category, Manufacturer, Product Type with Quick Create */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">{t("category")} *</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(value) => handleSelectChange("categoryId", value)}
                                        required
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder={t("selectCategory")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCategoryDialogOpen(true)}
                                        title={t("quickCreateCategory")}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Manufacturer */}
                            <div className="space-y-2">
                                <Label htmlFor="manufacturerId">{t("manufacturer")} *</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.manufacturerId}
                                        onValueChange={(value) => handleSelectChange("manufacturerId", value)}
                                        required
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder={t("selectManufacturer")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {manufacturers.map((manufacturer) => (
                                                <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                                                    {manufacturer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setManufacturerDialogOpen(true)}
                                        title={t("quickCreateManufacturer")}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Product Type */}
                            <div className="space-y-2">
                                <Label htmlFor="productTypeId">{t("productType")} *</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.productTypeId}
                                        onValueChange={(value) => handleSelectChange("productTypeId", value)}
                                        required
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder={t("selectProductType")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setProductTypeDialogOpen(true)}
                                        title={t("quickCreateProductType")}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Specifications UI */}
                        {selectedProductType && selectedProductType.allowedAttributes.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold">{t("specs")}</Label>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                        {selectedProductType.name}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                                    {selectedProductType.allowedAttributes.map((attr) => (
                                        <div key={attr} className="space-y-1">
                                            <Label htmlFor={`spec-${attr}`} className="text-sm font-medium">
                                                {formatAttributeName(attr)}
                                            </Label>
                                            <Input
                                                id={`spec-${attr}`}
                                                value={specsValues[attr] || ""}
                                                onChange={(e) => handleSpecChange(attr, e.target.value)}
                                                placeholder={t("specValuePlaceholder")}
                                                className="bg-background"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{t("specsHelp")}</p>
                            </div>
                        )}

                        {/* Show message when no product type selected */}
                        {!selectedProductType && (
                            <div className="space-y-2">
                                <Label>{t("specs")}</Label>
                                <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                                    {t("selectProductTypeForSpecs")}
                                </div>
                            </div>
                        )}

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>{t("productImage")}</Label>
                            {imagePreview ? (
                                <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        unoptimized
                                        className="object-contain"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 end-2"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="image"
                                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors block"
                                >
                                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <span className="text-primary hover:underline">
                                        {t("uploadImage")}
                                    </span>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading || isSubmitting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={isLoading || isSubmitting}>
                                {(isLoading || isSubmitting) ? t("submitting") : (submitLabel || t("submit"))}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Quick Create Dialogs */}
            <Dialog open={manufacturerDialogOpen} onOpenChange={setManufacturerDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t("quickCreateManufacturer")}</DialogTitle>
                        <DialogDescription>{t("quickCreateManufacturerDescription")}</DialogDescription>
                    </DialogHeader>
                    <ManufacturerForm
                        onSubmit={handleManufacturerFormSubmit}
                        onCancel={() => setManufacturerDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("quickCreateCategory")}</DialogTitle>
                        <DialogDescription>{t("quickCreateCategoryDescription")}</DialogDescription>
                    </DialogHeader>
                    <CategoryForm
                        categories={categories}
                        onSubmit={handleCategoryFormSubmit}
                        onCancel={() => setCategoryDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={productTypeDialogOpen} onOpenChange={setProductTypeDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t("quickCreateProductType")}</DialogTitle>
                        <DialogDescription>{t("quickCreateProductTypeDescription")}</DialogDescription>
                    </DialogHeader>
                    <ProductTypeForm
                        onSubmit={handleProductTypeFormSubmit}
                        onCancel={() => setProductTypeDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
