"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Location } from "@/types/location"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPinned, Truck, Receipt } from "lucide-react"

interface LocationSelectorProps {
    locations: Location[]
    cities: string[]
    selectedLocationId: number | null
    onSelectLocation: (location: Location | null) => void
    isLoading?: boolean
}

export function LocationSelector({
    locations,
    cities,
    selectedLocationId,
    onSelectLocation,
    isLoading = false,
}: LocationSelectorProps) {
    const t = useTranslations("Checkout")
    const [selectedCity, setSelectedCity] = useState<string>("")
    const [locationsInCity, setLocationsInCity] = useState<Location[]>([])

    // Find selected location
    const selectedLocation = locations.find((loc) => loc.id === selectedLocationId)

    // Update locations when city changes
    useEffect(() => {
        if (selectedCity) {
            const filtered = locations.filter(
                (loc) => loc.city === selectedCity && loc.active
            )
            setLocationsInCity(filtered)

            // If current selection is not in the new city, clear it
            if (selectedLocation && selectedLocation.city !== selectedCity) {
                onSelectLocation(null)
            }
        } else {
            setLocationsInCity([])
        }
    }, [selectedCity, locations])

    // Pre-select city if a location is already selected
    useEffect(() => {
        if (selectedLocation && !selectedCity) {
            setSelectedCity(selectedLocation.city)
        }
    }, [selectedLocation])

    const handleCityChange = (city: string) => {
        setSelectedCity(city)
        onSelectLocation(null) // Clear location when city changes
    }

    const handleLocationChange = (locationId: string) => {
        const location = locations.find((loc) => loc.id === parseInt(locationId))
        onSelectLocation(location || null)
    }

    if (isLoading) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>{t("locationSelector.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPinned className="h-5 w-5" />
                    {t("locationSelector.title")}
                </CardTitle>
                <CardDescription>
                    {t("locationSelector.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Cascading Dropdowns */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* City Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="city-select">
                            {t("locationSelector.selectCity")}
                        </Label>
                        <Select value={selectedCity} onValueChange={handleCityChange}>
                            <SelectTrigger id="city-select">
                                <SelectValue placeholder={t("locationSelector.cityPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="location-select">
                            {t("locationSelector.selectLocation")}
                        </Label>
                        <Select
                            value={selectedLocationId?.toString() || ""}
                            onValueChange={handleLocationChange}
                            disabled={!selectedCity || locationsInCity.length === 0}
                        >
                            <SelectTrigger id="location-select">
                                <SelectValue
                                    placeholder={
                                        !selectedCity
                                            ? t("locationSelector.selectCityFirst")
                                            : locationsInCity.length === 0
                                                ? t("locationSelector.noLocations")
                                                : t("locationSelector.locationPlaceholder")
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {locationsInCity.map((location) => (
                                    <SelectItem
                                        key={location.id}
                                        value={location.id.toString()}
                                    >
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Selected Location Rates Display */}
                {selectedLocation && (
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                        <p className="font-medium text-sm">
                            {t("locationSelector.selectedLocation")}: {selectedLocation.name}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {/* Shipping Rate */}
                            <div className="flex items-center gap-3 p-3 rounded-md bg-background">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Truck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("locationSelector.shippingRate")}
                                    </p>
                                    <p className="font-semibold">
                                        {(parseFloat(selectedLocation.shippingRate) * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>

                            {/* Tax Rate */}
                            <div className="flex items-center gap-3 p-3 rounded-md bg-background">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Receipt className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("locationSelector.taxRate")}
                                    </p>
                                    <p className="font-semibold">
                                        {(parseFloat(selectedLocation.taxRate) * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validation Message */}
                {!selectedLocationId && selectedCity && (
                    <p className="text-sm text-destructive">
                        {t("locationSelector.pleaseSelect")}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
