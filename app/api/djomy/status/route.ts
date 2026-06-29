import { NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/djomy';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const statusData = await checkPaymentStatus(transactionId);
    return NextResponse.json(statusData);
  } catch (error: any) {
    console.error("API /api/djomy/status Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
