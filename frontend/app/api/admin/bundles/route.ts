import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/admin/bundles
 * Fetch paginated list of bundles (admin view)
 */
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters for pagination and filtering
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';
        const activeOnly = searchParams.get('activeOnly') || 'false';
        const search = searchParams.get('search');

        // Build query string
        const params = new URLSearchParams({ page, limit, activeOnly });
        if (search) params.append('search', search);

        const response = await fetch(
            `${API_URL}/api/v1/admin/bundles?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        const data = await response.json();
        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        console.error('Fetch Bundles API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/bundles
 * Create a new bundle with FormData (supports image upload)
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get FormData from request
        const formData = await request.formData();

        // Forward FormData to backend
        const response = await fetch(`${API_URL}/api/v1/admin/bundles`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
            },
            body: formData,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Create Bundle API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
