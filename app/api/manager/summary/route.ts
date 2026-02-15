import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const sellers = await prisma.seller.findMany({ include: { shifts: true, notes: true } });

    const totals = sellers.map((seller) => {
      const hours = seller.shifts.reduce((sum, s) => sum + s.hoursWorked, 0);
      const sales = seller.shifts.reduce((sum, s) => sum + s.salesCount, 0);
      return { id: seller.id, name: seller.fullName, hours, sales };
    });

    const underperformers = totals
      .filter((s) => s.hours > 30 && s.sales < 10)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    const topPerformers = totals.sort((a, b) => b.sales - a.sales).slice(0, 5);

    const stageMap = sellers
      .flatMap((s) => s.notes)
      .reduce<Record<string, number>>((acc, note) => {
        acc[note.stage] = (acc[note.stage] || 0) + 1;
        return acc;
      }, {});

    const failureStages = Object.entries(stageMap)
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ underperformers, topPerformers, failureStages });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
