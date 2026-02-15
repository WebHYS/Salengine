import { NextResponse } from 'next/server';
import { createSession, verifyUser } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = loginSchema.parse(json);
    const user = await verifyUser(parsed.email, parsed.password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user);
    return NextResponse.json({ ok: true, role: user.role });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
