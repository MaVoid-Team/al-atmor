"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"

// Type definitions
export interface AdminUser {
    id: number
    email: string
    role: "admin" | "customer"
    firstName?: string
    lastName?: string
}

export interface PaginationMeta {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
}

export interface UsersResponse {
    data: AdminUser[]
    meta: PaginationMeta
}

export interface CreateUserData {
    email: string
    password: string
    role: "admin" | "customer"
    firstName?: string
    lastName?: string
}

export interface UpdateUserData {
    firstName?: string
    lastName?: string
    role?: "admin" | "customer"
}

export interface AdminStats {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    itemsSold: number
    totalProducts: number
    totalCategories: number
    totalProductTypes: number
}

/**
 * Hook to manage admin operations for user management and statistics.
 * Provides functions to fetch, create, update, and delete users.
 * Also includes pagination support for user listing and admin statistics.
 * 
 * @returns Admin operations and state including users list, pagination, stats, and CRUD operations
 */
export function useAdmin() {
    const { token, isAuthenticated, user } = useAuth()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Stats state
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [isStatsLoading, setIsStatsLoading] = useState(false)

    // Pagination state
    const [pagination, setPagination] = useState<PaginationMeta>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    })

    /**
     * Fetch paginated list of users
     * @param page - Page number to fetch
     * @param limit - Number of items per page
     */
    const fetchUsers = useCallback(async (page: number = 1, limit: number = 10) => {
        if (!token || !isAuthenticated) {
            setUsers([])
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const result: UsersResponse = await response.json()
                setUsers(result.data || [])
                setPagination({
                    currentPage: result.meta?.currentPage || 1,
                    totalPages: result.meta?.totalPages || 1,
                    totalItems: result.meta?.totalItems || 0,
                    itemsPerPage: result.meta?.itemsPerPage || limit
                })
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch users')
                setUsers([])
            }
        } catch (err) {
            console.error('Failed to fetch users:', err)
            setError('Failed to fetch users')
            setUsers([])
        } finally {
            setIsLoading(false)
        }
    }, [token, isAuthenticated])

    /**
     * Fetch admin statistics
     */
    const fetchStats = useCallback(async () => {
        if (!token || !isAuthenticated) {
            setStats(null)
            return
        }

        setIsStatsLoading(true)
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                setStats(null)
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error)
            setStats(null)
        } finally {
            setIsStatsLoading(false)
        }
    }, [token, isAuthenticated])

    /**
     * Fetch a single user by ID
     * @param userId - User ID to fetch
     * @returns User object or null
     */
    const fetchUserById = async (userId: number): Promise<AdminUser | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const userData: AdminUser = await response.json()
                return userData
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to fetch user:', response.status, errorData)
            return null
        } catch (error) {
            console.error('Failed to fetch user:', error)
            return null
        }
    }

    /**
     * Create a new user
     * @param userData - User data including email, password, role, firstName, lastName
     * @returns Created user object or null
     */
    const createUser = async (userData: CreateUserData): Promise<AdminUser | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            })

            if (response.ok) {
                const data: AdminUser = await response.json()
                // Refresh users list after creation
                await fetchUsers(pagination.currentPage, pagination.itemsPerPage)
                return data
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to create user:', response.status, errorData)
            return null
        } catch (error) {
            console.error('Failed to create user:', error)
            return null
        }
    }

    /**
     * Update an existing user
     * @param userId - User ID to update
     * @param userData - Updated user data (firstName, lastName, role)
     * @returns Updated user object or null
     */
    const updateUser = async (userId: number, userData: UpdateUserData): Promise<AdminUser | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            })

            if (response.ok) {
                const data: AdminUser = await response.json()
                // Refresh users list after update
                await fetchUsers(pagination.currentPage, pagination.itemsPerPage)
                return data
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to update user:', response.status, errorData)
            return null
        } catch (error) {
            console.error('Failed to update user:', error)
            return null
        }
    }

    /**
     * Delete a user
     * @param userId - User ID to delete
     * @returns Success status
     */
    const deleteUser = async (userId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Refresh users list after deletion
                await fetchUsers(pagination.currentPage, pagination.itemsPerPage)
                return true
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to delete user:', response.status, errorData)
            return false
        } catch (error) {
            console.error('Failed to delete user:', error)
            return false
        }
    }

    /**
     * Navigate to a specific page
     * @param page - Page number to navigate to
     */
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchUsers(page, pagination.itemsPerPage)
        }
    }

    /**
     * Change items per page
     * @param limit - New limit for items per page
     */
    const changeItemsPerPage = (limit: number) => {
        fetchUsers(1, limit)
    }

    // Auto-fetch users and stats on mount if authenticated
    useEffect(() => {
        if (isAuthenticated && token && user?.role === 'admin') {
            fetchUsers()
            fetchStats()
        }
    }, [isAuthenticated, token, user?.role, fetchUsers, fetchStats])

    return {
        // State
        users,
        isLoading,
        error,
        pagination,
        stats,
        isStatsLoading,

        // CRUD Operations
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser,
        fetchStats,

        // Pagination helpers
        goToPage,
        changeItemsPerPage,

        // Convenience getters
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
    }
}
