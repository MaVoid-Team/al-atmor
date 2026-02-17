import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// PATCH /api/address/[addressId]/default - Set address as default
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}/default`, {
            method: 'PATCH',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error setting default address:', error)
        return NextResponse.json(
            { error: 'Failed to set default address' },
            { status: 500 }
        )
    }
}
