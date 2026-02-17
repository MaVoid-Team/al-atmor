import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /api/admin/categories
 * Create a new category with FormData (includes file upload)
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
        const response = await fetch(`${API_URL}/api/v1/categories`, {
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
        console.error('Create Category API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
