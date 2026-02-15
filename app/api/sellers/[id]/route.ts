import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { sellerSchema } from '@/lib/validators';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const seller = await prisma.seller.findUnique({
      where: { id: params.id },
      include: {
        shifts: { orderBy: { date: 'desc' } },
        notes: { orderBy: { date: 'desc' }, include: { createdBy: true } },
        aiRecommendations: { orderBy: { createdAt: 'desc' }, take: 3 }
      }
    });
    return NextResponse.json(seller);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN']);
    const parsed = sellerSchema.partial().parse(await req.json());
    const seller = await prisma.seller.update({ where: { id: params.id }, data: parsed });
    return NextResponse.json(seller);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
