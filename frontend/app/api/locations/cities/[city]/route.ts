import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// GET /api/locations/cities/[city] - Get all locations in a city
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ city: string }> }
) {
    try {
        const { city } = await params
        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('activeOnly') ?? 'true'

        const response = await fetch(
            `${API_URL}/api/v1/locations/cities/${encodeURIComponent(city)}?activeOnly=${activeOnly}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error fetching locations by city:', error)
        return NextResponse.json(
            { error: 'Failed to fetch locations by city' },
            { status: 500 }
        )
    }
}
