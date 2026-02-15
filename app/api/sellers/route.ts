import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { sellerSchema } from '@/lib/validators';

export async function GET(req: Request) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const url = new URL(req.url);
    const companyId = url.searchParams.get('companyId');
    const sellers = await prisma.seller.findMany({
      where: companyId ? { companyId } : undefined,
      include: { shifts: true, notes: true },
      orderBy: { fullName: 'asc' }
    });
    return NextResponse.json(sellers);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['ADMIN']);
    const parsed = sellerSchema.parse(await req.json());
    const seller = await prisma.seller.create({ data: parsed });
    return NextResponse.json(seller);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
