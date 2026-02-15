import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NavBar } from '@/components/NavBar';
import { SellerDetailClient } from '@/components/SellerDetailClient';

export default async function SellerDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/manager');

  const seller = await prisma.seller.findUnique({
    where: { id: params.id },
    include: {
      shifts: { orderBy: { date: 'desc' } },
      notes: { orderBy: { date: 'desc' } },
      aiRecommendations: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (!seller) redirect('/admin');

  return (
    <div>
      <NavBar role={user.role} />
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Seller Detail: {seller.fullName}</h1>
        <SellerDetailClient seller={JSON.parse(JSON.stringify(seller))} />
      </main>
    </div>
  );
}
