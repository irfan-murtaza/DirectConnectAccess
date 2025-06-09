import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      price: process.env.PRODUCT_PRICE || '20',
      currency: process.env.PRODUCT_CURRENCY || 'USD',
      productName: process.env.PRODUCT_NAME || 'Direct Connect Access',
    });
  } catch (error) {
    console.error('Error getting config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 