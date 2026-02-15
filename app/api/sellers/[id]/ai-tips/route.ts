import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { generateAiTips } from '@/lib/ai';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN']);
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [shifts, notes] = await Promise.all([
      prisma.shift.findMany({ where: { sellerId: params.id, date: { gte: since } }, orderBy: { date: 'desc' } }),
      prisma.coachingNote.findMany({ where: { sellerId: params.id }, orderBy: { date: 'desc' }, take: 20 })
    ]);

    const payload = await generateAiTips(shifts, notes);

    const rec = await prisma.aiRecommendation.create({
      data: {
        sellerId: params.id,
        payloadJson: payload
      }
    });

    return NextResponse.json(rec);
  } catch {
    return NextResponse.json({ error: 'Unable to generate tips' }, { status: 400 });
  }
}
