import { NextResponse } from 'next/server';
import { initiateDirectPayment, initiateGatewayPayment } from '@/lib/djomy';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentMethod, amount, phone, courseId, userId } = body;

    if (!amount || !courseId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const merchantPaymentReference = `CFIG-${userId.substring(0,5)}-${courseId.substring(0,5)}-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/student/payment-return`;

    // metadata to be returned in webhook
    const metadata = {
      courseId,
      userId
    };

    if (paymentMethod === "card") {
      // Gateway Payment
      const result = await initiateGatewayPayment({
        amount,
        payerNumber: phone || "0022400000000",
        description: `Inscription au module ${courseId}`,
        merchantPaymentReference,
        returnUrl,
        cancelUrl: returnUrl,
        metadata
      });

      return NextResponse.json(result);
    } else {
      // Direct Payment (OM / MOMO)
      if (!phone) {
        return NextResponse.json({ error: "Phone number required for mobile money" }, { status: 400 });
      }

      // Ensure international format (assuming Guinea for now, fallback to generic if provided without prefix)
      // The Djomy documentation says: "Le numero de compte payeur. Il peut être un numéro de téléphone... au format international. Ex : 00224623707722"
      let formattedPhone = phone;
      if (!formattedPhone.startsWith('00224') && !formattedPhone.startsWith('+224')) {
        // If they enter 622..., prepend 00224
        formattedPhone = `00224${formattedPhone.replace(/\s+/g, '')}`;
      } else if (formattedPhone.startsWith('+224')) {
        formattedPhone = formattedPhone.replace('+', '00');
      }

      const djomyMethod = paymentMethod.toUpperCase(); // "OM" or "MOMO"
      
      const result = await initiateDirectPayment({
        paymentMethod: djomyMethod as "OM" | "MOMO",
        payerIdentifier: formattedPhone,
        amount,
        description: `Inscription au module ${courseId}`,
        merchantPaymentReference,
        metadata
      });

      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error("API /api/djomy/init Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
