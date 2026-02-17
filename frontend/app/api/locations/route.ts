import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// GET /api/locations - Get all active locations (public)
export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${API_URL}/api/v1/locations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error fetching locations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch locations' },
            { status: 500 }
        )
    }
}
