import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { shiftSchema } from '@/lib/validators';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN']);
    const parsed = shiftSchema.parse(await req.json());
    const shift = await prisma.shift.create({
      data: {
        sellerId: params.id,
        date: new Date(parsed.date),
        hoursWorked: parsed.hoursWorked,
        conversations: parsed.conversations,
        salesCount: parsed.salesCount,
        totalCost: parsed.totalCost
      }
    });
    return NextResponse.json(shift);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await req.json();
    const parsed = shiftSchema.extend({ id: z.string() }).parse(body);
    const shift = await prisma.shift.update({
      where: { id: parsed.id },
      data: {
        date: new Date(parsed.date),
        hoursWorked: parsed.hoursWorked,
        conversations: parsed.conversations,
        salesCount: parsed.salesCount,
        totalCost: parsed.totalCost
      }
    });
    return NextResponse.json(shift);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole(['ADMIN']);
    const { id } = await req.json();
    await prisma.shift.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
