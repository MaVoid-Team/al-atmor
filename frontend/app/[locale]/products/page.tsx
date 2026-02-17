"use client"

import { useSearchParams } from "next/navigation"
import { AllProducts } from "@/components/Landing/AllProducts"

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('q') || ''
    const manufacturerId = searchParams.get('manufacturerId')
    const productTypeId = searchParams.get('productTypeId')
    const categoryId = searchParams.get('categoryId')

    return (
        <AllProducts
            initialSearch={initialSearch}
            showSearch={true}
            initialManufacturerId={manufacturerId ? parseInt(manufacturerId) : undefined}
            initialProductTypeId={productTypeId ? parseInt(productTypeId) : undefined}
            initialCategoryId={categoryId ? parseInt(categoryId) : undefined}
        />
    )
}
