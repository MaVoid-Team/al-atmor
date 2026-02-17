"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"

export interface Category {
    id: number
    name: string
    slug: string
    parentId: number | null
    imageUrl: string | null
    imagePublicId: string | null
}

export interface CategoriesResponse {
    data: Category[]
}

/**
 * Hook to manage admin category operations.
 * Provides functions to fetch, create, update, and delete categories.
 */
export function useCategories() {
    const { token, isAuthenticated } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Fetch list of categories
     */
    const fetchCategories = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/categories')

            if (response.ok) {
                const result: CategoriesResponse = await response.json()
                setCategories(result.data || [])
            } else {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Failed to fetch categories')
                setCategories([])
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err)
            setError('Failed to fetch categories')
            setCategories([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * Fetch a single category by ID
     */
    const fetchCategoryById = async (categoryId: number): Promise<Category | null> => {
        try {
            const response = await fetch(`/api/categories/${categoryId}`)

            if (response.ok) {
                const categoryData: Category = await response.json()
                return categoryData
            }
        } catch (error) {
            console.error('Failed to fetch category:', error)
        }
        return null
    }

    /**
     * Create a new category
     */
    const createCategory = async (formData: FormData): Promise<boolean> => {
        if (!token) return false
        if (!isAuthenticated) return false

        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                await fetchCategories() // Refresh list
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to create category:', error)
            return false
        }
    }

    /**
     * Update an existing category
     */
    const updateCategory = async (categoryId: number, formData: FormData): Promise<boolean> => {
        if (!token) return false
        if (!isAuthenticated) return false

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                await fetchCategories() // Refresh list
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to update category:', error)
            return false
        }
    }

    /**
     * Delete a category
     */
    const deleteCategory = async (categoryId: number): Promise<boolean> => {
        if (!token) return false
        if (!isAuthenticated) return false

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok || response.status === 204) {
                await fetchCategories() // Refresh list
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to delete category:', error)
            return false
        }
    }

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    return {
        categories,
        isLoading,
        error,
        fetchCategories,
        fetchCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
    }
}
