"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface ProductSearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function ProductSearchBar({
    value,
    onChange,
    placeholder,
    className = ""
}: ProductSearchBarProps) {
    const t = useTranslations('ProductsPage')
    // Local state to prevent parent re-renders from causing focus loss
    const [localValue, setLocalValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync local value with parent value only when parent value changes externally
    // (e.g., when clearing filters)
    useEffect(() => {
        if (value !== localValue && document.activeElement !== inputRef.current) {
            setLocalValue(value)
        }
    }, [value])

    const handleChange = (newValue: string) => {
        setLocalValue(newValue)
        onChange(newValue)
    }

    const handleClear = () => {
        setLocalValue('')
        onChange('')
    }

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder || t('searchPlaceholder')}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                className="ps-10 pe-10 h-12 text-base"
            />
            {localValue && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleClear}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}

