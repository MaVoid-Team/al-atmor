import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params

        const response = await fetch(`${API_URL}/api/v1/admin/orders/${id}`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Admin order fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()

        const response = await fetch(`${API_URL}/api/v1/admin/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Admin order update error:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params

        const response = await fetch(`${API_URL}/api/v1/admin/orders/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        })

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 })
        }

        if (!response.ok) {
            const data = await response.json()
            return NextResponse.json(data, { status: response.status })
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Admin order delete error:', error)
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }
}
