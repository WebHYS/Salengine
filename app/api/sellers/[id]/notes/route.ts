import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { coachingNoteSchema } from '@/lib/validators';
import { z } from 'zod';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole(['ADMIN']);
    const parsed = coachingNoteSchema.parse(await req.json());
    const note = await prisma.coachingNote.create({
      data: {
        sellerId: params.id,
        date: new Date(parsed.date),
        stage: parsed.stage,
        reason: parsed.reason,
        details: parsed.details,
        createdByUserId: user.id
      }
    });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireRole(['ADMIN']);
    const parsed = coachingNoteSchema.extend({ id: z.string() }).parse(await req.json());
    const note = await prisma.coachingNote.update({
      where: { id: parsed.id },
      data: {
        date: new Date(parsed.date),
        stage: parsed.stage,
        reason: parsed.reason,
        details: parsed.details
      }
    });
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole(['ADMIN']);
    const { id } = await req.json();
    await prisma.coachingNote.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
