import { NextResponse } from "next/server";
import { sendSingleSms } from "@/lib/smsHelper";

export async function POST(req: Request) {
  try {
    const { contact, message } = await req.json();

    if (!contact || !message) {
      return NextResponse.json({ error: "Contact et message sont requis." }, { status: 400 });
    }

    const result = await sendSingleSms(contact, message);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("SMS Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'envoi du SMS." },
      { status: 500 }
    );
  }
}
