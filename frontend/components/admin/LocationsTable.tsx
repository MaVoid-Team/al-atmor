"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useAdminLocations, CreateLocationInput, UpdateLocationInput, AdminLocation } from "@/hooks/useAdminLocations"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, MapPin, Pencil, Trash2 } from "lucide-react"

import { AddLocationDialog } from "./locations/AddLocationDialog"
import { EditLocationDialog } from "./locations/EditLocationDialog"
import { DeleteLocationDialog } from "./locations/DeleteLocationDialog"

export default function LocationsTable() {
    const t = useTranslations("Admin.Locations")
    const { locations, isLoading, createLocation, updateLocation, deleteLocation } = useAdminLocations()

    // Dialog states
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Selected location for edit/delete
    const [selectedLocation, setSelectedLocation] = useState<AdminLocation | null>(null)

    const handleCreateLocation = async (input: CreateLocationInput) => {
        await createLocation(input)
        toast.success(t("createSuccess"))
    }

    const handleUpdateLocation = async (id: number, input: UpdateLocationInput) => {
        await updateLocation(id, input)
        toast.success(t("updateSuccess"))
    }

    const handleDeleteLocation = async (id: number) => {
        await deleteLocation(id)
        toast.success(t("deleteSuccess"))
    }

    const openEditDialog = (location: AdminLocation) => {
        setSelectedLocation(location)
        setShowEditDialog(true)
    }

    const openDeleteDialog = (location: AdminLocation) => {
        setSelectedLocation(location)
        setShowDeleteDialog(true)
    }

    // Calculate stats
    const totalLocations = locations.length
    const activeLocations = locations.filter(l => l.active).length
    const uniqueCities = [...new Set(locations.map(l => l.city))].length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 me-2" />
                    {t("addLocation")}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("stats.totalLocations")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLocations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("stats.activeLocations")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{activeLocations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("stats.cities")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueCities}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Locations Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">{t("noLocations")}</h3>
                            <p className="text-muted-foreground mb-4">{t("noLocationsDescription")}</p>
                            <Button onClick={() => setShowAddDialog(true)}>
                                <Plus className="h-4 w-4 me-2" />
                                {t("addFirstLocation")}
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-start">{t("table.name")}</TableHead>
                                        <TableHead className="text-start">{t("table.city")}</TableHead>
                                        <TableHead className="text-center">{t("table.taxRate")}</TableHead>
                                        <TableHead className="text-center">{t("table.shippingRate")}</TableHead>
                                        <TableHead className="text-center">{t("table.status")}</TableHead>
                                        <TableHead className="text-end">{t("table.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    {location.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{location.city}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {(parseFloat(location.taxRate) * 100).toFixed(0)}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {(parseFloat(location.shippingRate) * 100).toFixed(0)}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={location.active ? "default" : "secondary"}>
                                                    {location.active ? t("table.active") : t("table.inactive")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(location)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(location)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddLocationDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSubmit={handleCreateLocation}
            />

            <EditLocationDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                location={selectedLocation}
                onSubmit={handleUpdateLocation}
            />

            <DeleteLocationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                location={selectedLocation}
                onConfirm={handleDeleteLocation}
            />
        </div>
    )
}
