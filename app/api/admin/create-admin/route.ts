import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase Admin SDK not initialized." }, { status: 500 });
    }

    // Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Create Admin Auth Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create admin in Auth" }, { status: 500 });
  }
}
