import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/admin/products
 * Fetch paginated list of products (admin view)
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
        const categoryId = searchParams.get('categoryId');
        const manufacturerId = searchParams.get('manufacturerId');
        const productTypeId = searchParams.get('productTypeId');
        const search = searchParams.get('search');

        // Build query string
        const params = new URLSearchParams({ page, limit });
        if (categoryId) params.append('categoryId', categoryId);
        if (manufacturerId) params.append('manufacturerId', manufacturerId);
        if (productTypeId) params.append('productTypeId', productTypeId);
        if (search) params.append('search', search);

        const response = await fetch(
            `${API_URL}/api/v1/products?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store', // Disable caching to always get fresh data
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
        console.error('Fetch Products API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/products
 * Create a new product with FormData (includes file upload)
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
        const response = await fetch(`${API_URL}/api/v1/products`, {
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
        console.error('Create Product API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
