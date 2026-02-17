import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

// Order item interface
export interface OrderItem {
    id: number
    productId: number
    orderId: number
    quantity: number
    priceAtPurchase: string
    createdAt: string
}

// Order interface
export interface Order {
    id: number
    userId: number
    status: string
    paymentStatus: string
    currency: string
    subtotal: string
    shipping: string
    tax: string
    total: string
    metadata: {
        discountCode?: string
        discountAmount?: number
        discountCodeId?: number
        addressId?: number
    } | null
    placedAt: string
    createdAt: string
    updatedAt: string
    user: {
        id: number
        email: string
        role: string
    }
    items: OrderItem[]
    location?: {
        id: number
        name: string
        city: string
        taxRate: string
        shippingRate: string
    }
    shippingAddress?: {
        fullName?: string
        addressLine1?: string
        addressLine2?: string
        city?: string
        state?: string
        postalCode?: string
        country?: string
        phoneNumber?: string
        label?: string
    }
}

// Pagination metadata
export interface PaginationMeta {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
}

// Orders response with pagination
export interface OrdersResponse {
    data: Order[]
    meta: PaginationMeta
}

// Analytics summary
export interface AnalyticsSummary {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    itemsSold: number
    totalProducts: number
    totalCategories: number
    totalProductTypes: number
}

// Analytics filters
export interface AnalyticsFilters {
    period?: 'week' | 'month' | 'year'
    date?: string // YYYY/MM/DD
    startDate?: string // YYYY/MM/DD
    endDate?: string // YYYY/MM/DD
}

// Order update payload
export interface OrderUpdatePayload {
    status?: string
    paymentStatus?: string
    metadata?: Record<string, any>
}

// Admin orders filters
export interface AdminOrdersFilters {
    search?: string
    status?: string
    period?: string
    date?: string
    startDate?: string
    endDate?: string
}

export function useOrders() {
    const [isLoading, setIsLoading] = useState(false)
    const { token } = useAuth()

    /**
     * Get user's orders (paginated)
     */
    const getUserOrders = useCallback(async (page: number = 1, limit: number = 10): Promise<OrdersResponse | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/orders?page=${page}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to fetch user orders:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    /**
     * Get single order by ID
     */
    const getOrderById = useCallback(async (orderId: number): Promise<Order | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to fetch order:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    /**
     * Get all orders (Admin only, paginated with filters)
     */
    const getAllOrders = useCallback(async (
        page: number = 1,
        limit: number = 10,
        filters: AdminOrdersFilters = {}
    ): Promise<OrdersResponse | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })

            if (filters.search) params.append('search', filters.search)
            if (filters.status && filters.status !== 'all') params.append('status', filters.status)
            if (filters.period) params.append('period', filters.period)
            if (filters.date) params.append('date', filters.date)
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)

            const response = await fetch(
                `/api/admin/orders?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to fetch all orders:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    /**
     * Get single order by ID (Admin)
     */
    const getAdminOrderById = useCallback(async (orderId: number): Promise<Order | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/admin/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to fetch admin order:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    /**
     * Update order (Admin only)
     */
    const updateOrder = useCallback(async (orderId: number, updates: OrderUpdatePayload): Promise<Order | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/admin/orders/${orderId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updates),
                }
            )

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to update order:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    /**
     * Delete order (Admin only)
     */
    const deleteOrder = useCallback(async (orderId: number): Promise<boolean> => {
        if (!token) return false

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/admin/orders/${orderId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            )

            return response.status === 204 || response.ok
        } catch (error) {
            console.error('Failed to delete order:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [token])

    /**
     * Get analytics summary (Admin only)
     */
    const getAnalyticsSummary = useCallback(async (filters?: AnalyticsFilters): Promise<AnalyticsSummary | null> => {
        if (!token) return null

        setIsLoading(true)
        try {
            // Build query params
            const params = new URLSearchParams()
            if (filters?.period) params.append('period', filters.period)
            if (filters?.date) params.append('date', filters.date)
            if (filters?.startDate) params.append('startDate', filters.startDate)
            if (filters?.endDate) params.append('endDate', filters.endDate)

            const queryString = params.toString()
            const url = `/api/admin/orders/analytics${queryString ? `?${queryString}` : ''}`

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                return data
            }
            return null
        } catch (error) {
            console.error('Failed to fetch analytics summary:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [token])

    return {
        isLoading,
        // User functions
        getUserOrders,
        getOrderById,
        // Admin functions
        getAllOrders,
        getAdminOrderById,
        updateOrder,
        deleteOrder,
        getAnalyticsSummary,
    }
}
