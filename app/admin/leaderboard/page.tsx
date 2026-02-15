import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NavBar } from '@/components/NavBar';
import { sumPeriodStats } from '@/lib/dashboard';

export default async function LeaderboardPage({
  searchParams
}: {
  searchParams: { sort?: 'sales' | 'conversion' | 'score' };
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/manager');

  const sort = searchParams.sort || 'score';

  const sellers = await prisma.seller.findMany({ include: { shifts: true } });
  const rows = sellers
    .map((seller) => ({ seller, stats: sumPeriodStats(seller.shifts, 30) }))
    .sort((a, b) => {
      if (sort === 'sales') return b.stats.sales - a.stats.sales;
      if (sort === 'conversion') return b.stats.conversion - a.stats.conversion;
      return b.stats.score - a.stats.score;
    });

  return (
    <div>
      <NavBar role={user.role} />
      <main className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg bg-white p-4 shadow">
          <h1 className="text-xl font-semibold">Leaderboard (Last 30 Days)</h1>
          <div className="mt-2 flex gap-3 text-sm">
            <Link href="?sort=sales" className="text-blue-600">
              Sort by Sales
            </Link>
            <Link href="?sort=conversion" className="text-blue-600">
              Sort by Conversion
            </Link>
            <Link href="?sort=score" className="text-blue-600">
              Sort by Score
            </Link>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th>Seller</th>
                <th>Sales</th>
                <th>Conversion</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.seller.id} className="border-t">
                  <td className="py-2">{row.seller.fullName}</td>
                  <td>{row.stats.sales}</td>
                  <td>{(row.stats.conversion * 100).toFixed(1)}%</td>
                  <td>{row.stats.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
