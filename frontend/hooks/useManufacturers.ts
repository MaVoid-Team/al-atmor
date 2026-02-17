"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"

export interface Manufacturer {
    id: number
    name: string
    logoUrl: string | null
}

export interface ManufacturersResponse {
    data: Manufacturer[]
    meta?: {
        totalItems: number
        itemsPerPage: number
        totalPages: number
        currentPage: number
    }
}

/**
 * Hook to manage manufacturer operations.
 * Provides functions to fetch, create, update, and delete manufacturers.
 * Public operations (fetchManufacturers) don't require auth.
 * Admin operations (create, update, delete) require admin auth.
 */
export function useManufacturers() {
    const { token } = useAuth()
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Fetch list of manufacturers (public - no auth required)
     */
    const fetchManufacturers = useCallback(async (limit: number = 100) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/manufacturers?limit=${limit}`)

            if (response.ok) {
                const result: ManufacturersResponse = await response.json()
                setManufacturers(result.data || [])
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch manufacturers')
                setManufacturers([])
            }
        } catch (err) {
            console.error('Failed to fetch manufacturers:', err)
            setError('Failed to fetch manufacturers')
            setManufacturers([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * Fetch a single manufacturer by ID
     */
    const fetchManufacturerById = async (manufacturerId: number): Promise<Manufacturer | null> => {
        try {
            const response = await fetch(`/api/manufacturers?limit=100`)

            if (response.ok) {
                const data: ManufacturersResponse = await response.json()
                return data.data?.find(m => m.id === manufacturerId) || null
            }
        } catch (error) {
            console.error('Failed to fetch manufacturer:', error)
        }
        return null
    }

    /**
     * Create a new manufacturer (admin only)
     */
    const createManufacturer = async (data: { name: string; logoUrl?: string }): Promise<Manufacturer | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/admin/manufacturers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                const result: Manufacturer = await response.json()
                await fetchManufacturers() // Refresh list
                return result
            }
            return null
        } catch (error) {
            console.error('Failed to create manufacturer:', error)
            return null
        }
    }

    /**
     * Update an existing manufacturer (admin only)
     */
    const updateManufacturer = async (manufacturerId: number, data: { name: string; logoUrl?: string }): Promise<Manufacturer | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/manufacturers/${manufacturerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                const result: Manufacturer = await response.json()
                await fetchManufacturers() // Refresh list
                return result
            }
            return null
        } catch (error) {
            console.error('Failed to update manufacturer:', error)
            return null
        }
    }

    /**
     * Delete a manufacturer (admin only)
     */
    const deleteManufacturer = async (manufacturerId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/admin/manufacturers/${manufacturerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok || response.status === 204) {
                await fetchManufacturers() // Refresh list
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to delete manufacturer:', error)
            return false
        }
    }

    // Auto-fetch manufacturers on mount
    useEffect(() => {
        fetchManufacturers()
    }, [fetchManufacturers])

    return {
        manufacturers,
        isLoading,
        error,
        fetchManufacturers,
        fetchManufacturerById,
        createManufacturer,
        updateManufacturer,
        deleteManufacturer,
    }
}
