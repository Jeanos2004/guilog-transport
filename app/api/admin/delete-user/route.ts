import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    if (!adminAuth) {
      return NextResponse.json({ 
        error: 'Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables.' 
      }, { status: 500 });
    }

    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true, message: 'User deleted from Authentication successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    // If the user is already deleted or not found, we don't need to throw an error, we can just return success
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ success: true, message: 'User already deleted or not found' });
    }
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
