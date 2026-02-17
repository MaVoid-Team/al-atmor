import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page') || '1'
        const limit = searchParams.get('limit') || '10'

        const response = await fetch(`${API_URL}/api/v1/orders?page=${page}&limit=${limit}`, {
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
        console.error('User orders fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
