"use client"

import { useState, useCallback } from "react"
import { useAuth, User, Address } from "@/context/AuthContext"

// Re-export types for convenience
export type { User, Address }

/**
 * Hook to retrieve the logged-in user's data and manage addresses.
 * 
 * @returns The user object with id, email, role information,
 * along with authentication state, loading status, and address management functions.
 */
export function useUser() {
    const { user, isAuthenticated, isLoading, token } = useAuth()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

    // Fetch all addresses for the user
    const fetchAddresses = useCallback(async (): Promise<Address[]> => {
        if (!token) return []

        setIsLoadingAddresses(true)
        try {
            const response = await fetch('/api/address', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                const addressList = data.addresses || []
                setAddresses(addressList)
                return addressList
            }
            return []
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
            return []
        } finally {
            setIsLoadingAddresses(false)
        }
    }, [token])

    // Fetch user's default address
    const fetchDefaultAddress = useCallback(async (): Promise<Address | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/address/default', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                return data.address || null
            }
            return null
        } catch (error) {
            console.error('Failed to fetch default address:', error)
            return null
        }
    }, [token])

    // Create a new address
    const createAddress = async (addressData: Partial<Address>): Promise<Address | null> => {
        if (!token) return null

        try {
            const response = await fetch('/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            })

            if (response.ok) {
                const data = await response.json()
                const createdAddress = data.address
                // Refresh addresses list
                await fetchAddresses()
                return createdAddress
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to create address:', response.status, errorData)
            return null
        } catch (error) {
            console.error('Failed to create address:', error)
            return null
        }
    }

    // Update an existing address
    const updateAddress = async (addressId: number, addressData: Partial<Address>): Promise<Address | null> => {
        if (!token) return null

        try {
            const response = await fetch(`/api/address/${addressId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            })

            if (response.ok) {
                const data = await response.json()
                const updatedAddress = data.address
                // Refresh addresses list
                await fetchAddresses()
                return updatedAddress
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to update address:', response.status, errorData)
            return null
        } catch (error) {
            console.error('Failed to update address:', error)
            return null
        }
    }

    // Delete an address
    const deleteAddress = async (addressId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/address/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Refresh addresses list
                await fetchAddresses()
                return true
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to delete address:', response.status, errorData)
            return false
        } catch (error) {
            console.error('Failed to delete address:', error)
            return false
        }
    }

    // Set an address as default
    const setDefaultAddress = async (addressId: number): Promise<boolean> => {
        if (!token) return false

        try {
            const response = await fetch(`/api/address/${addressId}/default`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Refresh addresses list
                await fetchAddresses()
                return true
            }

            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to set default address:', response.status, errorData)
            return false
        } catch (error) {
            console.error('Failed to set default address:', error)
            return false
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        token,
        // Convenience getters for common user properties
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        userRole: user?.role ?? null,
        // Address management
        addresses,
        isLoadingAddresses,
        fetchAddresses,
        fetchDefaultAddress,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    }
}
