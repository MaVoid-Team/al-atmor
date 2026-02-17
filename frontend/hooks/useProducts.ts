"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { Product } from "@/components/products/ProductCard"

export interface PaginationMeta {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
}

export interface ProductsResponse {
    data: Product[]
    meta: PaginationMeta
}

/**
 * Hook to manage admin product operations.
 * Provides functions to fetch, create, update, and delete products.
 * Also includes pagination support for product listing.
 * 
 * @returns Product operations and state including products list, pagination, and CRUD operations
 */
export function useProducts() {
    const { token, isAuthenticated, user } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [pagination, setPagination] = useState<PaginationMeta>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 8
    })

    /**
     * Fetch paginated list of products
     * @param page - Page number to fetch
     * @param limit - Number of items per page
     */
    const fetchProducts = useCallback(async (page: number = 1, limit: number = 8) => {
        if (!token || !isAuthenticated) {
            setProducts([])
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/products?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const result: ProductsResponse = await response.json()
                setProducts(result.data || [])
                setPagination({
                    currentPage: result.meta?.currentPage || 1,
                    totalPages: result.meta?.totalPages || 1,
                    totalItems: result.meta?.totalItems || 0,
                    itemsPerPage: result.meta?.itemsPerPage || limit
                })
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch products')
                setProducts([])
            }
        } catch (err) {
            console.error('Failed to fetch products:', err)
            setError('Failed to fetch products')
            setProducts([])
        } finally {
            setIsLoading(false)
        }
    }, [token, isAuthenticated])

    /**
     * Fetch a single product by ID (admin)
     */
    const fetchProductById = async (productId: number): Promise<Product | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const productData: Product = await response.json()
                return productData
            }

            return null
        } catch (error) {
            console.error('Failed to fetch product:', error)
            return null
        }
    }

    /**
     * Fetch public products (no auth required)
     * @param params - Query parameters for filtering/pagination
     */
    const fetchPublicProducts = useCallback(async (params?: {
        page?: number
        limit?: number
        search?: string
        categoryId?: number
        manufacturerId?: number
        productTypeId?: number
    }): Promise<ProductsResponse | null> => {
        try {
            const queryParams = new URLSearchParams()
            if (params?.page) queryParams.append('page', params.page.toString())
            if (params?.limit) queryParams.append('limit', params.limit.toString())
            if (params?.search) queryParams.append('search', params.search)
            if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString())
            if (params?.manufacturerId) queryParams.append('manufacturerId', params.manufacturerId.toString())
            if (params?.productTypeId) queryParams.append('productTypeId', params.productTypeId.toString())

            const response = await fetch(`/api/products?${queryParams.toString()}`)

            if (response.ok) {
                return await response.json()
            }
            return null
        } catch (error) {
            console.error('Failed to fetch public products:', error)
            return null
        }
    }, [])

    /**
     * Fetch a single public product by ID (no auth required)
     */
    const fetchPublicProductById = useCallback(async (productId: number): Promise<Product | null> => {
        try {
            const response = await fetch(`/api/products/${productId}`)

            if (response.ok) {
                const productData: Product = await response.json()
                return productData
            }
            return null
        } catch (error) {
            console.error('Failed to fetch public product:', error)
            return null
        }
    }, [])

    /**
     * Search products (no auth required)
     */
    const searchProducts = useCallback(async (query: string, limit: number = 50): Promise<Product[]> => {
        if (!query || query.length < 2) return []

        try {
            const response = await fetch(`/api/products?page=1&limit=${limit}&search=${encodeURIComponent(query)}`)

            if (response.ok) {
                const data: ProductsResponse = await response.json()
                return data.data || []
            }
            return []
        } catch (error) {
            console.error('Search products failed:', error)
            return []
        }
    }, [])

    /**
     * Create a new product with FormData
     */
    const createProduct = async (formData: FormData): Promise<Product | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const data: Product = await response.json()
                // Refresh products list after creation
                await fetchProducts(pagination.currentPage, pagination.itemsPerPage)
                return data
            }

            return null
        } catch (error) {
            console.error('Failed to create product:', error)
            return null
        }
    }

    /**
     * Update an existing product
     */
    const updateProduct = async (productId: number, formData: FormData): Promise<Product | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const data: Product = await response.json()
                // Refresh products list after update
                await fetchProducts(pagination.currentPage, pagination.itemsPerPage)
                return data
            }

            return null
        } catch (error) {
            console.error('Failed to update product:', error)
            return null
        }
    }

    /**
     * Delete a product
     */
    const deleteProduct = async (productId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Refresh products list after deletion
                await fetchProducts(pagination.currentPage, pagination.itemsPerPage)
                return true
            }

            return false
        } catch (error) {
            console.error('Failed to delete product:', error)
            return false
        }
    }

    /**
     * Navigate to a specific page
     */
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchProducts(page, pagination.itemsPerPage)
        }
    }

    /**
     * Change items per page
     */
    const changeItemsPerPage = (limit: number) => {
        fetchProducts(1, limit)
    }

    // Auto-fetch products on mount if authenticated as admin
    useEffect(() => {
        if (isAuthenticated && token && user?.role === 'admin') {
            fetchProducts()
        }
    }, [isAuthenticated, token, user?.role, fetchProducts])

    /**
     * Restock a product
     */
    const restockProduct = async (productId: number, quantity: number): Promise<{ success: boolean; newStockLevel?: number }> => {
        if (!token) return { success: false }

        try {
            const response = await fetch(`/api/admin/products/${productId}/restock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity }),
            })

            if (response.ok) {
                const data = await response.json()
                // Refresh products list after restock
                await fetchProducts(pagination.currentPage, pagination.itemsPerPage)
                return { success: true, newStockLevel: data.newStockLevel }
            }

            return { success: false }
        } catch (error) {
            console.error('Failed to restock product:', error)
            return { success: false }
        }
    }

    return {
        // State
        products,
        isLoading,
        error,
        pagination,

        // Admin CRUD Operations
        fetchProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        restockProduct,

        // Public Operations (no auth required)
        fetchPublicProducts,
        fetchPublicProductById,
        searchProducts,

        // Pagination helpers
        goToPage,
        changeItemsPerPage,

        // Convenience getters
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
    }
}
