"use client"

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export interface AdminLocation {
    id: number
    name: string
    city: string
    taxRate: string
    shippingRate: string
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateLocationInput {
    name: string
    city: string
    taxRate: number
    shippingRate: number
    active?: boolean
}

export interface UpdateLocationInput {
    name?: string
    city?: string
    taxRate?: number
    shippingRate?: number
    active?: boolean
}

export function useAdminLocations() {
    const { token } = useAuth()
    const [locations, setLocations] = useState<AdminLocation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchLocations = useCallback(async (activeOnly: boolean = false) => {
        if (!token) return

        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/admin/locations?activeOnly=${activeOnly}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch locations')
            }

            const data = await response.json()
            setLocations(data)
        } catch (err) {
            console.error('Failed to fetch locations:', err)
            setError('Failed to fetch locations')
        } finally {
            setIsLoading(false)
        }
    }, [token])

    const createLocation = useCallback(async (input: CreateLocationInput): Promise<AdminLocation | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/admin/locations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create location')
            }

            const newLocation = await response.json()
            setLocations(prev => [...prev, newLocation])
            return newLocation
        } catch (err: any) {
            console.error('Failed to create location:', err)
            throw err
        }
    }, [token])

    const updateLocation = useCallback(async (id: number, input: UpdateLocationInput): Promise<AdminLocation | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/admin/locations/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update location')
            }

            const updatedLocation = await response.json()
            setLocations(prev => prev.map(loc => loc.id === id ? updatedLocation : loc))
            return updatedLocation
        } catch (err: any) {
            console.error('Failed to update location:', err)
            throw err
        }
    }, [token])

    const deleteLocation = useCallback(async (id: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/admin/locations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok && response.status !== 204) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete location')
            }

            setLocations(prev => prev.filter(loc => loc.id !== id))
            return true
        } catch (err: any) {
            console.error('Failed to delete location:', err)
            throw err
        }
    }, [token])

    // Fetch on mount
    useEffect(() => {
        if (token) {
            fetchLocations()
        }
    }, [token, fetchLocations])

    // Get unique cities from locations
    const cities = [...new Set(locations.map(loc => loc.city))]

    return {
        locations,
        cities,
        isLoading,
        error,
        fetchLocations,
        createLocation,
        updateLocation,
        deleteLocation,
    }
}
