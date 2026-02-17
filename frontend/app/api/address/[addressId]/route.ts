import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// GET /api/address/[addressId] - Get specific address
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error fetching address:', error)
        return NextResponse.json(
            { error: 'Failed to fetch address' },
            { status: 500 }
        )
    }
}

// PUT /api/address/[addressId] - Update address
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error updating address:', error)
        return NextResponse.json(
            { error: 'Failed to update address' },
            { status: 500 }
        )
    }
}

// DELETE /api/address/[addressId] - Delete address
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error deleting address:', error)
        return NextResponse.json(
            { error: 'Failed to delete address' },
            { status: 500 }
        )
    }
}
