import { NextRequest, NextResponse } from 'next/server';
import { createAndProcessLabel } from '@/lib/shipping/services';

export async function POST(request: NextRequest) {
  try {
    const { orderId, carrier, customerName, customerEmail } = await request.json();
    if (!orderId || !carrier) {
      return NextResponse.json({ error: 'orderId et carrier sont requis' }, { status: 400 });
    }
    const label = await createAndProcessLabel(orderId, carrier, customerName, customerEmail);
    return NextResponse.json({ success: true, label });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}