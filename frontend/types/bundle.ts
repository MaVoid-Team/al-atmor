export interface BundleProduct {
    id: number
    bundleId: number
    productId: number
    quantity: number
    Product: {
        id: number
        name: string
        sku: string
        price: string
        imageUrl?: string
        stock?: number
        active?: boolean
    }
}

export interface Bundle {
    id: number
    name: string
    description?: string | null
    price: string
    imageUrl?: string | null
    active: boolean
    createdAt: string
    updatedAt: string
    BundleProducts: BundleProduct[]
}

export interface PaginationMeta {
    total: number
    page: number
    totalPages: number
}
