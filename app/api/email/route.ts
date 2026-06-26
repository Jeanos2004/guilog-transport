import { NextResponse } from "next/server";
import { emailHelper } from "@/lib/emailHelper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data || !data.email) {
      return NextResponse.json({ error: "Type and data.email are required" }, { status: 400 });
    }

    let result;

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n================================`);
      console.log(`📧 [EMAIL INTERCEPTÉ EN LOCAL]`);
      console.log(`Type: ${type}`);
      console.log(`Destinataire: ${data.email}`);
      if (data.tempPassword) console.log(`Mot de passe généré: ${data.tempPassword}`);
      if (data.courseName) console.log(`Formation: ${data.courseName}`);
      console.log(`================================\n`);
    }

    switch (type) {
      case "welcome":
        if (!data.name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
        result = await emailHelper.sendWelcomeEmail(data.email, data.name);
        break;

      case "devis":
        if (!data.name || !data.courseName) return NextResponse.json({ error: "Missing name or courseName" }, { status: 400 });
        result = await emailHelper.sendDevisAcknowledgment(data.email, data.name, data.courseName);
        break;

      case "conversion":
        if (!data.name || !data.tempPassword || !data.courseName) {
          return NextResponse.json({ error: "Missing conversion data" }, { status: 400 });
        }
        result = await emailHelper.sendAdminConversionEmail(data.email, data.name, data.tempPassword, data.courseName);
        break;

      case "invoice":
        if (!data.name || !data.courseName || data.amount === undefined) {
          return NextResponse.json({ error: "Missing invoice data" }, { status: 400 });
        }
        result = await emailHelper.sendInvoiceEmail(data.email, data.name, data.courseName, data.amount);
        break;

      case "new_admin":
        if (!data.tempPassword) {
          return NextResponse.json({ error: "Missing new_admin data" }, { status: 400 });
        }
        result = await emailHelper.sendNewAdminCredentials(data.email, data.tempPassword);
        break;

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: "Email sending skipped (check RESEND_API_KEY)" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Email API Route Error:", error);
    return NextResponse.json({ error: "Failed to send email", details: error.message }, { status: 500 });
  }
}
