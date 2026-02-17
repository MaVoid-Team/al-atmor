"use client"

import { useCallback, useState } from "react"
import { useAuth } from "@/context/AuthContext"

export interface DiscountCode {
    id: number
    code: string
    type: "percentage" | "fixed"
    value: string
    minPurchase: string | null
    maxUses: number | null
    usedCount: number
    validFrom: string
    validTo: string
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface PaginationMeta {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

export interface DiscountsResponse {
    discounts: DiscountCode[]
    pagination: PaginationMeta
}

export interface CreateDiscountRequest {
    code: string
    type: "percentage" | "fixed"
    value: number
    minPurchase?: number
    maxUses?: number
    validFrom: string
    validTo: string
    active?: boolean
}

export interface UpdateDiscountRequest {
    code?: string
    type?: "percentage" | "fixed"
    value?: number
    minPurchase?: number
    maxUses?: number
    validFrom?: string
    validTo?: string
    active?: boolean
}

export interface ValidateDiscountRequest {
    code: string
    subtotal: number
}

export interface ValidateDiscountResponse {
    valid: boolean
    discountAmount: number
    discountCode: {
        id: number
        code: string
        type: "percentage" | "fixed"
        value: string
    }
}

export interface FetchDiscountsOptions {
    page?: number
    limit?: number
    activeOnly?: boolean
}

/**
 * Hook to manage discount code operations.
 * Provides functions to fetch, create, update, delete, and validate discount codes.
 * Admin functions require authentication, while validation is available to logged-in users.
 * 
 * @returns Discount operations and state
 */
export function useDiscounts() {
    const { token, isAuthenticated } = useAuth()
    const [discounts, setDiscounts] = useState<DiscountCode[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationMeta>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6
    })

    /**
     * Fetch all discounts with pagination and filters (admin only)
     */
    const fetchDiscounts = useCallback(async (
        page: number = 1,
        limit: number = 6,
        activeOnly: boolean = true
    ): Promise<DiscountCode[] | null> => {
        if (!token || !isAuthenticated) {
            setDiscounts([])
            return null
        }

        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                activeOnly: activeOnly.toString()
            })

            const response = await fetch(`/api/admin/discounts?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()

                // Handle both paginated and non-paginated response formats
                if (Array.isArray(data)) {
                    // Non-paginated response (array of discounts)
                    setDiscounts(data)
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: data.length,
                        itemsPerPage: data.length
                    })
                    return data
                } else if (data.discounts) {
                    // Paginated response
                    setDiscounts(data.discounts)
                    setPagination(data.pagination || {
                        currentPage: page,
                        totalPages: Math.ceil((data.total || data.discounts.length) / limit),
                        totalItems: data.total || data.discounts.length,
                        itemsPerPage: limit
                    })
                    return data.discounts
                } else {
                    // Fallback: treat as array
                    const discountArray = Object.values(data) as DiscountCode[]
                    setDiscounts(discountArray)
                    return discountArray
                }
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch discounts')
                setDiscounts([])
                return null
            }
        } catch (err) {
            console.error('Failed to fetch discounts:', err)
            setError('Failed to fetch discounts')
            setDiscounts([])
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token, isAuthenticated])

    /**
     * Fetch a single discount by ID (admin only)
     */
    const fetchDiscountById = async (id: number): Promise<DiscountCode | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/discounts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                return await response.json()
            }
            return null
        } catch (error) {
            console.error('Failed to fetch discount:', error)
            return null
        }
    }

    /**
     * Create a new discount code (admin only)
     */
    const createDiscount = async (discountData: CreateDiscountRequest): Promise<DiscountCode | null> => {
        if (!token) return null

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/admin/discounts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discountData),
            })

            if (response.ok) {
                const data: DiscountCode = await response.json()
                // Refresh discounts list after creation
                await fetchDiscounts(pagination.currentPage, pagination.itemsPerPage)
                return data
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to create discount')
                return null
            }
        } catch (error) {
            console.error('Failed to create discount:', error)
            setError('Failed to create discount')
            return null
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Update an existing discount code (admin only)
     */
    const updateDiscount = async (id: number, discountData: UpdateDiscountRequest): Promise<DiscountCode | null> => {
        if (!token) return null

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/discounts/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discountData),
            })

            if (response.ok) {
                const data: DiscountCode = await response.json()
                // Refresh discounts list after update
                await fetchDiscounts(pagination.currentPage, pagination.itemsPerPage)
                return data
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to update discount')
                return null
            }
        } catch (error) {
            console.error('Failed to update discount:', error)
            setError('Failed to update discount')
            return null
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Delete (soft-delete) a discount code (admin only)
     */
    const deleteDiscount = async (id: number): Promise<boolean> => {
        if (!token) return false

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/discounts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok || response.status === 204) {
                // Refresh discounts list after deletion
                await fetchDiscounts(pagination.currentPage, pagination.itemsPerPage)
                return true
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to delete discount')
                return false
            }
        } catch (error) {
            console.error('Failed to delete discount:', error)
            setError('Failed to delete discount')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Validate a discount code (logged-in users)
     */
    const validateDiscount = async (validateData: ValidateDiscountRequest): Promise<ValidateDiscountResponse | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/discounts/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validateData),
            })

            if (response.ok) {
                const data: ValidateDiscountResponse = await response.json()
                return data
            }

            return null
        } catch (error) {
            console.error('Failed to validate discount:', error)
            return null
        }
    }

    return {
        // State
        discounts,
        isLoading,
        error,
        pagination,

        // Admin Operations
        fetchDiscounts,
        fetchDiscountById,
        createDiscount,
        updateDiscount,
        deleteDiscount,

        // User Operations
        validateDiscount,
    }
}
