"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"

// Raw type from API - allowedAttributes can be array or object
interface RawProductType {
    id: number
    name: string
    allowedAttributes: string[] | Record<string, string>
}

// Normalized type for frontend use - always array
export interface ProductType {
    id: number
    name: string
    allowedAttributes: string[]
}

export interface ProductTypesResponse {
    data: RawProductType[]
    meta?: {
        totalItems: number
        itemsPerPage: number
        totalPages: number
        currentPage: number
    }
}

/**
 * Helper to normalize allowedAttributes to always be an array
 * Handles both ["attr1", "attr2"] and {"attr1": "", "attr2": ""} formats
 */
function normalizeAllowedAttributes(attrs: string[] | Record<string, string>): string[] {
    if (Array.isArray(attrs)) {
        return attrs
    }
    if (typeof attrs === 'object' && attrs !== null) {
        return Object.keys(attrs)
    }
    return []
}

/**
 * Hook to manage product type operations.
 * Provides functions to fetch, create, update, and delete product types.
 * Public operations (fetchProductTypes) don't require auth.
 * Admin operations (create, update, delete) require admin auth.
 */
export function useProductTypes() {
    const { token } = useAuth()
    const [productTypes, setProductTypes] = useState<ProductType[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Fetch list of product types (public - no auth required)
     */
    const fetchProductTypes = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/productTypes')

            if (response.ok) {
                const result = await response.json()
                // Handle both { data: [...] } and direct array responses
                const rawTypes: RawProductType[] = result.data || result || []
                // Normalize allowedAttributes to always be arrays
                const normalizedTypes: ProductType[] = rawTypes.map(pt => ({
                    ...pt,
                    allowedAttributes: normalizeAllowedAttributes(pt.allowedAttributes)
                }))
                setProductTypes(normalizedTypes)
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch product types')
                setProductTypes([])
            }
        } catch (err) {
            console.error('Failed to fetch product types:', err)
            setError('Failed to fetch product types')
            setProductTypes([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * Create a new product type (admin only)
     */
    const createProductType = async (data: { name: string; allowedAttributes: string[] }): Promise<ProductType | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/admin/productTypes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                const result: ProductType = await response.json()
                await fetchProductTypes() // Refresh list
                return result
            }
            return null
        } catch (error) {
            console.error('Failed to create product type:', error)
            return null
        }
    }

    /**
     * Update an existing product type (admin only)
     */
    const updateProductType = async (productTypeId: number, data: { name?: string; allowedAttributes?: string[] }): Promise<ProductType | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/productTypes/${productTypeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                const result: ProductType = await response.json()
                await fetchProductTypes() // Refresh list
                return result
            }
            return null
        } catch (error) {
            console.error('Failed to update product type:', error)
            return null
        }
    }

    /**
     * Delete a product type (admin only)
     */
    const deleteProductType = async (productTypeId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/admin/productTypes/${productTypeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok || response.status === 204) {
                await fetchProductTypes() // Refresh list
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to delete product type:', error)
            return false
        }
    }

    // Auto-fetch product types on mount
    useEffect(() => {
        fetchProductTypes()
    }, [fetchProductTypes])

    return {
        productTypes,
        isLoading,
        error,
        fetchProductTypes,
        createProductType,
        updateProductType,
        deleteProductType,
    }
}
