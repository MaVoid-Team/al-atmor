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
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''
        const period = searchParams.get('period') || ''
        const date = searchParams.get('date') || ''
        const startDate = searchParams.get('startDate') || ''
        const endDate = searchParams.get('endDate') || ''

        const params = new URLSearchParams({ page, limit })
        if (search) params.append('search', search)
        if (status && status !== 'all') params.append('status', status)
        if (period) params.append('period', period)
        if (date) params.append('date', date)
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await fetch(`${API_URL}/api/v1/admin/orders?${params.toString()}`, {
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
        console.error('Admin orders fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
