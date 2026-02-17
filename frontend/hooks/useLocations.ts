"use client"

import { useState, useCallback, useMemo } from "react"
import { Location } from "@/types/location"

/**
 * Hook to manage location data for checkout.
 * Locations are independent of addresses and used for tax/shipping rate calculation.
 */
export function useLocations() {
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch all active locations
    const fetchLocations = useCallback(async (): Promise<Location[]> => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/locations')

            if (response.ok) {
                const data = await response.json()
                // Filter only active locations
                const activeLocations = Array.isArray(data)
                    ? data.filter((loc: Location) => loc.active)
                    : []
                setLocations(activeLocations)
                return activeLocations
            }

            setError('Failed to fetch locations')
            return []
        } catch (err) {
            console.error('Failed to fetch locations:', err)
            setError('Failed to fetch locations')
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Get unique list of cities from locations
    const cities = useMemo(() => {
        const uniqueCities = [...new Set(locations.map(loc => loc.city))]
        return uniqueCities.sort()
    }, [locations])

    // Get locations filtered by city
    const getLocationsByCity = useCallback((city: string): Location[] => {
        return locations.filter(loc => loc.city === city && loc.active)
    }, [locations])

    // Fetch locations by city from backend (alternative to client-side filtering)
    const fetchLocationsByCity = useCallback(async (city: string): Promise<Location[]> => {
        try {
            const response = await fetch(`/api/locations/cities/${encodeURIComponent(city)}?activeOnly=true`)

            if (response.ok) {
                const data = await response.json()
                return Array.isArray(data) ? data : []
            }
            return []
        } catch (err) {
            console.error('Failed to fetch locations by city:', err)
            return []
        }
    }, [])

    // Get a location by ID
    const getLocationById = useCallback((locationId: number): Location | undefined => {
        return locations.find(loc => loc.id === locationId)
    }, [locations])

    return {
        locations,
        cities,
        isLoading,
        error,
        fetchLocations,
        getLocationsByCity,
        fetchLocationsByCity,
        getLocationById,
    }
}
