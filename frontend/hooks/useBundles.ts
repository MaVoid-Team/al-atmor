import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { Bundle, PaginationMeta } from "@/types/bundle"


export interface BundlesResponse {
    bundles: Bundle[]
    total: number
    page: number
    totalPages: number
}

// Bundles filters (similar to orders)
export interface BundlesFilters {
    search?: string
    activeOnly?: boolean
}

/**
 * Hook to manage admin bundle operations.
 * Provides functions to fetch, create, update, and delete bundles.
 * Also includes pagination support for bundle listing.
 */
export function useBundles() {
    const { token, isAuthenticated, user } = useAuth()
    const [bundles, setBundles] = useState<Bundle[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        totalPages: 1,
        total: 0
    })

    // Items per page
    const [itemsPerPage, setItemsPerPage] = useState(10)

    /**
     * Fetch paginated list of bundles with optional filters
     */
    const fetchBundles = useCallback(async (
        page: number = 1,
        limit: number = 10,
        filters: BundlesFilters = {}
    ) => {
        if (!token || !isAuthenticated) {
            setBundles([])
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })

            // Add filters
            if (filters.search) params.append('search', filters.search)
            if (filters.activeOnly) params.append('activeOnly', 'true')

            const response = await fetch(`/api/admin/bundles?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const result: BundlesResponse = await response.json()
                setBundles(result.bundles || [])
                setPagination({
                    page: result.page || 1,
                    totalPages: result.totalPages || 1,
                    total: result.total || 0
                })
                setItemsPerPage(limit)
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch bundles')
                setBundles([])
            }
        } catch (err) {
            console.error('Failed to fetch bundles:', err)
            setError('Failed to fetch bundles')
            setBundles([])
        } finally {
            setIsLoading(false)
        }
    }, [token, isAuthenticated])

    /**
     * Fetch public bundles (no auth required)
     */
    const fetchPublicBundles = useCallback(async (params?: {
        page?: number
        limit?: number
        search?: string
    }): Promise<BundlesResponse | null> => {
        try {
            const queryParams = new URLSearchParams()
            if (params?.page) queryParams.append('page', params.page.toString())
            if (params?.limit) queryParams.append('limit', params.limit.toString())
            if (params?.search) queryParams.append('search', params.search)
            // Public bundles should always be active
            queryParams.append('activeOnly', 'true')

            const response = await fetch(`/api/bundles?${queryParams.toString()}`)

            if (response.ok) {
                return await response.json()
            }
            return null
        } catch (error) {
            console.error('Failed to fetch public bundles:', error)
            return null
        }
    }, [])

    /**
     * Fetch a single bundle by ID
     */
    const fetchBundleById = async (bundleId: number): Promise<Bundle | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/bundles/${bundleId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const bundleData: Bundle = await response.json()
                return bundleData
            }

            return null
        } catch (error) {
            console.error('Failed to fetch bundle:', error)
            return null
        }
    }

    /**
     * Create a new bundle with FormData
     */
    const createBundle = async (formData: FormData): Promise<Bundle | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/admin/bundles', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const data: Bundle = await response.json()
                // Refresh bundles list after creation
                await fetchBundles(pagination.page, itemsPerPage)
                return data
            }

            return null
        } catch (error) {
            console.error('Failed to create bundle:', error)
            return null
        }
    }

    /**
     * Update an existing bundle
     */
    const updateBundle = async (bundleId: number, formData: FormData): Promise<Bundle | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/bundles/${bundleId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const data: Bundle = await response.json()
                // Refresh bundles list after update
                await fetchBundles(pagination.page, itemsPerPage)
                return data
            }

            return null
        } catch (error) {
            console.error('Failed to update bundle:', error)
            return null
        }
    }

    /**
     * Delete a bundle
     */
    const deleteBundle = async (bundleId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/admin/bundles/${bundleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok || response.status === 204) {
                // Refresh bundles list after deletion
                await fetchBundles(pagination.page, itemsPerPage)
                return true
            }

            return false
        } catch (error) {
            console.error('Failed to delete bundle:', error)
            return false
        }
    }

    /**
     * Navigate to a specific page
     */
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchBundles(page, itemsPerPage)
        }
    }

    /**
     * Change items per page
     */
    const changeItemsPerPage = (limit: number) => {
        fetchBundles(1, limit)
    }

    // Auto-fetch bundles on mount if authenticated as admin
    useEffect(() => {
        if (isAuthenticated && token && user?.role === 'admin') {
            fetchBundles()
        }
    }, [isAuthenticated, token, user?.role, fetchBundles])

    return {
        // State
        bundles,
        isLoading,
        error,
        pagination,
        itemsPerPage,

        // CRUD Operations
        fetchBundles,
        fetchPublicBundles,
        fetchBundleById,
        createBundle,
        updateBundle,
        deleteBundle,

        // Pagination helpers
        goToPage,
        changeItemsPerPage,

        // Convenience getters
        hasNextPage: pagination.page < pagination.totalPages,
        hasPreviousPage: pagination.page > 1,
    }
}
