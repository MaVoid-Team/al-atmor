import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '5';
        const categoryId = searchParams.get('categoryId');
        const manufacturerId = searchParams.get('manufacturerId');
        const productTypeId = searchParams.get('productTypeId');
        const stockLabel = searchParams.get('stockLabel');
        const inStock = searchParams.get('in_stock');
        const search = searchParams.get('search');

        // Build query string
        const params = new URLSearchParams({
            page,
            limit,
        });

        if (categoryId) params.append('categoryId', categoryId);
        if (manufacturerId) params.append('manufacturerId', manufacturerId);
        if (productTypeId) params.append('productTypeId', productTypeId);
        if (stockLabel) params.append('stockLabel', stockLabel);
        if (inStock) params.append('in_stock', inStock);
        if (search) params.append('search', search);

        const response = await fetch(`${API_URL}/api/v1/products?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Products API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
