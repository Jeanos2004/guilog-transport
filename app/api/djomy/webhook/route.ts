import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/djomy';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('X-Webhook-Signature');
    const rawBody = await req.text();

    if (!signature || !verifyWebhookSignature(signature, rawBody)) {
      console.warn("Invalid webhook signature", signature);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.eventType === "payment.success" && payload.data?.status === "SUCCESS") {
      const { courseId, userId } = payload.metadata || {};

      if (courseId && userId) {
        // Enrolling student in course via Server
        const studentRef = doc(firestore, "students", userId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const profile = studentSnap.data();
          if (!profile.enrolledCourses) {
            profile.enrolledCourses = [];
          }
          if (!profile.enrolledCourses.includes(courseId)) {
            profile.enrolledCourses.push(courseId);
            await setDoc(studentRef, profile);
            console.log(`Student ${userId} enrolled in ${courseId} via Djomy webhook`);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("API /api/djomy/webhook Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
