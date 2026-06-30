import { NextResponse } from 'next/server';
import { initiateDirectPayment, initiateGatewayPayment } from '@/lib/djomy';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentMethod, amount, phone, courseId, userId } = body;

    if (!amount || !courseId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const merchantPaymentReference = `Guilogtrans-${userId.substring(0,5)}-${courseId.substring(0,5)}-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/payment-return`;

    // metadata to be returned in webhook
    const metadata = {
      courseId,
      userId
    };

    // For all methods, we use the Djomy Gateway (Payment Link interface)
    let allowedPaymentMethods = ["CARD", "OM", "MOMO"];
    if (paymentMethod === "om") allowedPaymentMethods = ["OM"];
    if (paymentMethod === "momo") allowedPaymentMethods = ["MOMO"];
    if (paymentMethod === "card") allowedPaymentMethods = ["CARD"];

    let formattedPhone = phone || "0022400000000";
    if (phone) {
      if (!formattedPhone.startsWith('00224') && !formattedPhone.startsWith('+224')) {
        formattedPhone = `00224${formattedPhone.replace(/\s+/g, '')}`;
      } else if (formattedPhone.startsWith('+224')) {
        formattedPhone = formattedPhone.replace('+', '00');
      }
    }

    const result = await initiateGatewayPayment({
      amount,
      payerNumber: formattedPhone,
      allowedPaymentMethods,
      description: `Inscription au module ${courseId}`,
      merchantPaymentReference,
      returnUrl,
      cancelUrl: returnUrl,
      metadata
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/djomy/init Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
