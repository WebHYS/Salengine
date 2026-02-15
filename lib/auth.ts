import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const COOKIE_NAME = 'salescoach_session';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');

export type SessionUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
};

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;
  return { id: user.id, email: user.email, role: user.role } as SessionUser;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as SessionUser['role']
    };
  } catch {
    return null;
  }
}

export async function requireRole(roles: SessionUser['role'][]) {
  const user = await getSessionUser();
  if (!user || !roles.includes(user.role)) {
    throw new Error('Unauthorized');
  }
  return user;
}
