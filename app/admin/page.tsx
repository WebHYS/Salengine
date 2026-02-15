import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NavBar } from '@/components/NavBar';
import { sumPeriodStats } from '@/lib/dashboard';

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/manager');

  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
  const selectedCompany = companies[0];

  const sellers = await prisma.seller.findMany({
    where: selectedCompany ? { companyId: selectedCompany.id } : undefined,
    include: { shifts: true },
    orderBy: { fullName: 'asc' }
  });

  return (
    <div>
      <NavBar role={user.role} />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Company Selector</h2>
          <select defaultValue={selectedCompany?.id} className="mt-2 w-80">
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex justify-between">
            <h2 className="text-xl font-semibold">Sellers Overview (Last 7 Days)</h2>
            <Link href="/admin/leaderboard" className="text-blue-600">
              Open Leaderboard
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th>Name</th>
                <th>Hours</th>
                <th>Sales</th>
                <th>Conversion</th>
                <th>Total Cost</th>
                <th>Performance Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => {
                const stats = sumPeriodStats(seller.shifts, 7);
                return (
                  <tr key={seller.id} className="border-t">
                    <td className="py-2">{seller.fullName}</td>
                    <td>{stats.hours.toFixed(1)}</td>
                    <td>{stats.sales}</td>
                    <td>{(stats.conversion * 100).toFixed(1)}%</td>
                    <td>${stats.totalCost.toFixed(2)}</td>
                    <td>{stats.score}</td>
                    <td>
                      <Link href={`/admin/sellers/${seller.id}`} className="text-blue-600">
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
