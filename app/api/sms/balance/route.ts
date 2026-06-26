import { NextResponse } from "next/server";
import { getSmsBalance } from "@/lib/smsHelper";

export async function GET() {
  try {
    const result = await getSmsBalance();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("SMS Balance Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération du solde SMS." },
      { status: 500 }
    );
  }
}
