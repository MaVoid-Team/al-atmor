"use client"

import { useState, FormEvent, ChangeEvent, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Plus, Minus, Search } from "lucide-react"
import Image from "next/image"
import { useProducts } from "@/hooks/useProducts"
import { useDebounce } from "@/hooks/useDebounce"
import { Bundle, BundleProduct } from "@/types/bundle"

interface BundleProductInput {
    productId: number
    quantity: number
    productName: string
    productPrice: string
    productImage?: string
}

interface BundleFormData {
    name: string
    description: string
    price: string
    active: boolean
    image: File | null
}

interface BundleFormProps {
    initialData?: Bundle | null
    onSubmit: (formData: FormData) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
    submitLabel?: string
    mode?: 'create' | 'edit'
}

export default function BundleForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    mode = 'create',
}: BundleFormProps) {
    const t = useTranslations("Admin.Bundles")
    const tCommon = useTranslations("Common")

    const [formData, setFormData] = useState<BundleFormData>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price || "",
        active: initialData?.active ?? true,
        image: null,
    })

    // Products state
    const [bundleProducts, setBundleProducts] = useState<BundleProductInput[]>([])
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.imageUrl || null
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Product search state
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedSearch = useDebounce(searchQuery, 300)

    const { searchProducts, products: allProducts, fetchProducts } = useProducts()

    // Fetch all products for dropdown on mount
    useEffect(() => {
        fetchProducts(1, 100) // Fetch up to 100 products for dropdown
    }, [fetchProducts])

    // Initialize bundle products from initial data
    useEffect(() => {
        if (initialData?.BundleProducts) {
            const products = initialData.BundleProducts.map((bp: BundleProduct) => ({
                productId: bp.productId,
                quantity: bp.quantity,
                productName: bp.Product?.name || `Product #${bp.productId}`,
                productPrice: bp.Product?.price || "0",
                productImage: bp.Product?.imageUrl,
            }))
            setBundleProducts(products)
        }
    }, [initialData])

    // Search products
    useEffect(() => {
        const search = async () => {
            if (debouncedSearch.length >= 2) {
                setIsSearching(true)
                const results = await searchProducts(debouncedSearch)
                // Filter out products already in bundle
                const existingIds = bundleProducts.map(bp => bp.productId)
                setSearchResults(results.filter(p => !existingIds.includes(p.id)))
                setIsSearching(false)
            } else {
                setSearchResults([])
            }
        }
        search()
    }, [debouncedSearch, searchProducts, bundleProducts])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleActiveChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, active: checked }))
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

    const addProduct = (product: any) => {
        setBundleProducts(prev => [
            ...prev,
            {
                productId: product.id,
                quantity: 1,
                productName: product.name,
                productPrice: product.price,
                productImage: product.imageUrl,
            },
        ])
        setSearchQuery("")
        setSearchResults([])
    }

    const updateProductQuantity = (productId: number, delta: number) => {
        setBundleProducts(prev =>
            prev.map(bp =>
                bp.productId === productId
                    ? { ...bp, quantity: Math.max(1, bp.quantity + delta) }
                    : bp
            )
        )
    }

    const removeProduct = (productId: number) => {
        setBundleProducts(prev => prev.filter(bp => bp.productId !== productId))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append("name", formData.name)
            submitData.append("description", formData.description)
            submitData.append("price", formData.price)
            submitData.append("active", formData.active.toString())

            // Add products as JSON string
            const productsData = bundleProducts.map(bp => ({
                productId: bp.productId,
                quantity: bp.quantity,
            }))
            submitData.append("products", JSON.stringify(productsData))

            if (formData.image) {
                submitData.append("image", formData.image)
            }

            await onSubmit(submitData)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Calculate total value of individual products
    const productsTotal = bundleProducts.reduce(
        (sum, bp) => sum + parseFloat(bp.productPrice) * bp.quantity,
        0
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("basicInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("bundleName")} *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder={t("bundleNamePlaceholder")}
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
                            {productsTotal > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {t("individualTotal")}: {tCommon("currency")} {productsTotal.toFixed(2)}
                                    {formData.price && (
                                        <span className="text-green-600 ms-2">
                                            ({t("savings")}: {tCommon("currency")} {(productsTotal - parseFloat(formData.price || "0")).toFixed(2)})
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("description")}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t("descriptionPlaceholder")}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={handleActiveChange}
                        />
                        <Label htmlFor="active">{t("activeBundle")}</Label>
                    </div>
                </CardContent>
            </Card>

            {/* Products Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("bundleProducts")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Product Search and Dropdown */}
                    <div className="space-y-3">
                        <Label>{t("addProducts")}</Label>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("searchProducts")}
                                className="ps-10"
                            />
                        </div>

                        {/* Dropdown to browse all products */}
                        <div className="flex items-center gap-2">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value=""
                                onChange={(e) => {
                                    const productId = parseInt(e.target.value)
                                    if (productId) {
                                        const product = searchResults.find(p => p.id === productId) ||
                                            allProducts.find((p: any) => p.id === productId)
                                        if (product) {
                                            addProduct(product)
                                        }
                                    }
                                }}
                            >
                                <option value="">{t("selectProduct")}</option>
                                {allProducts
                                    .filter((p: any) => !bundleProducts.some(bp => bp.productId === p.id))
                                    .map((product: any) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - {tCommon("currency")} {parseFloat(product.price).toFixed(2)}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                                {searchResults.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer"
                                        onClick={() => addProduct(product)}
                                    >
                                        <div className="h-10 w-10 relative rounded overflow-hidden bg-secondary shrink-0">
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    unoptimized
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-muted-foreground text-xs">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {tCommon("currency")} {parseFloat(product.price).toFixed(2)}
                                            </p>
                                        </div>
                                        <Plus className="h-4 w-4 text-primary" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSearching && (
                            <p className="text-sm text-muted-foreground">{t("searching")}</p>
                        )}
                    </div>

                    {/* Selected Products */}
                    {bundleProducts.length > 0 ? (
                        <div className="space-y-2">
                            <Label>{t("selectedProducts")}</Label>
                            <div className="border rounded-lg divide-y">
                                {bundleProducts.map((bp) => (
                                    <div key={bp.productId} className="flex items-center gap-3 p-3">
                                        <div className="h-12 w-12 relative rounded overflow-hidden bg-secondary shrink-0">
                                            {bp.productImage ? (
                                                <Image
                                                    src={bp.productImage}
                                                    alt={bp.productName}
                                                    fill
                                                    unoptimized
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-muted-foreground text-xs">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{bp.productName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {tCommon("currency")} {parseFloat(bp.productPrice).toFixed(2)} × {bp.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateProductQuantity(bp.productId, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center">{bp.quantity}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => updateProductQuantity(bp.productId, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive"
                                                onClick={() => removeProduct(bp.productId)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 border rounded-lg bg-muted/30">
                            <p className="text-muted-foreground">{t("noProductsSelected")}</p>
                            <p className="text-sm text-muted-foreground">{t("searchToAdd")}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("bundleImage")}</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading || isSubmitting}
                >
                    {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || isSubmitting || bundleProducts.length === 0}
                >
                    {(isLoading || isSubmitting) ? t("submitting") : (submitLabel || t("submit"))}
                </Button>
            </div>
        </form>
    )
}
