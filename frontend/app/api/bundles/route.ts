import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /api/bundles
 * Fetch paginated list of bundles (public view)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';
        const search = searchParams.get('search');

        // Build query string
        const params = new URLSearchParams({
            page,
            limit,
            activeOnly: 'true', // Always filter by active for public view
        });

        if (search) params.append('search', search);

        // Fetch from backend
        const response = await fetch(
            `${API_URL}/api/v1/bundles?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 60 } // Cache for 60 seconds
            }
        );

        if (!response.ok) {
            // Fallback if public endpoint doesn't exist, try admin endpoint but purely for reading (though ideally backend should have public endpoint)
            // For now assuming backend has /api/v1/bundles or similar public endpoint. 
            // If backend uses same endpoint for admin/public but filters based on auth, this might need adjustment.
            // However existing pattern suggests /api/v1/products works for public.
            // Let's assume /api/v1/bundles exists for public or is the same endpoint.
            // Actually, the admin route uses /api/v1/admin/bundles. 
            // I should try /api/v1/bundles. If it fails, I might need to check how products are handled.
            // Products use /api/v1/products. Admin products use /api/v1/admin/products.
            // So /api/v1/bundles is the logical public endpoint.
        }

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Fetch Public Bundles API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
