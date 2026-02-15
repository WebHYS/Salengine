import { PrismaClient, CoachingStage, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { id: 'mvp-company' },
    update: {},
    create: { id: 'mvp-company', name: 'SalesCoach Demo Co.' }
  });

  const adminPasswordHash = await bcrypt.hash('admin1234', 10);
  const managerPasswordHash = await bcrypt.hash('manager1234', 10);

  await prisma.user.upsert({
    where: { email: 'admin@salescoach.local' },
    update: {},
    create: { email: 'admin@salescoach.local', passwordHash: adminPasswordHash, role: UserRole.ADMIN }
  });

  await prisma.user.upsert({
    where: { email: 'manager@salescoach.local' },
    update: {},
    create: { email: 'manager@salescoach.local', passwordHash: managerPasswordHash, role: UserRole.MANAGER }
  });

  const sellerNames = ['Ava Johnson', 'Noah Martinez', 'Liam Walker', 'Sophia Clark'];

  for (const name of sellerNames) {
    const seller = await prisma.seller.upsert({
      where: { id: `seller-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `seller-${name.toLowerCase().replace(/\s+/g, '-')}`,
        companyId: company.id,
        fullName: name,
        active: true
      }
    });

    const start = new Date();
    start.setDate(start.getDate() - 35);

    for (let i = 0; i < 20; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i * 2);
      await prisma.shift.create({
        data: {
          sellerId: seller.id,
          date,
          hoursWorked: 4 + Math.random() * 4,
          conversations: 15 + Math.floor(Math.random() * 40),
          salesCount: 1 + Math.floor(Math.random() * 8),
          totalCost: Math.random() > 0.4 ? 20 + Math.random() * 60 : null
        }
      });
    }

    await prisma.coachingNote.createMany({
      data: [
        {
          sellerId: seller.id,
          date: new Date(),
          stage: CoachingStage.OPENING,
          reason: 'Weak opener consistency',
          details: 'Needs to improve confidence in first 10 seconds.',
          createdByUserId: (await prisma.user.findUniqueOrThrow({ where: { email: 'admin@salescoach.local' } })).id
        },
        {
          sellerId: seller.id,
          date: new Date(),
          stage: CoachingStage.OBJECTIONS,
          reason: 'Rushing rebuttals',
          details: 'Responds too quickly without clarifying concern.',
          createdByUserId: (await prisma.user.findUniqueOrThrow({ where: { email: 'admin@salescoach.local' } })).id
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
