import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(companies);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
