"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { allCountries } from "country-region-data"
import { useMemo } from "react"

// country-region-data v4.0.0 format: [countryName, countryCode, [[regionName, regionCode], ...]]
type CountryTuple = [string, string, [string, string][]]

interface RegionSelectProps {
    countryCode: string
    value?: string
    onChange?: (value: string) => void
    className?: string
    placeholder?: string
    disabled?: boolean
}

/**
 * Region/Province select component that displays regions for a given country.
 * Hardcoded for Egypt (EG) in address forms.
 */
export function RegionSelect({
    countryCode,
    value,
    onChange = () => { },
    className,
    placeholder = "Select region",
    disabled = false,
}: RegionSelectProps) {
    // Get regions synchronously using useMemo
    const regions = useMemo(() => {
        // v4.0.0 format: array of [countryName, countryCode, regions]
        const country = (allCountries as unknown as CountryTuple[]).find(
            (c) => c[1] === countryCode
        )
        if (!country) return []

        // Regions format: [[regionName, regionCode], ...]
        return country[2].map(([name, code]) => ({ name, shortCode: code }))
    }, [countryCode])

    return (
        <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled || regions.length === 0}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {regions.map((region) => (
                    <SelectItem key={region.shortCode || region.name} value={region.name}>
                        {region.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

/**
 * Get the list of Egypt regions for display purposes
 */
export function getEgyptRegions() {
    const egypt = (allCountries as unknown as CountryTuple[]).find(
        (c) => c[1] === "EG"
    )
    if (!egypt) return []
    return egypt[2].map(([name, code]) => ({ name, shortCode: code }))
}
