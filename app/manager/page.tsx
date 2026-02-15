import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { NavBar } from '@/components/NavBar';
import { prisma } from '@/lib/db';

export default async function ManagerPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const sellers = await prisma.seller.findMany({ include: { shifts: true, notes: true } });
  const totals = sellers.map((seller) => {
    const hours = seller.shifts.reduce((sum, s) => sum + s.hoursWorked, 0);
    const sales = seller.shifts.reduce((sum, s) => sum + s.salesCount, 0);
    return { id: seller.id, name: seller.fullName, hours, sales };
  });

  const underperformers = totals.filter((s) => s.hours > 30 && s.sales < 10).sort((a, b) => b.hours - a.hours).slice(0, 5);
  const topPerformers = [...totals].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const failureStages = Object.entries(
    sellers.flatMap((s) => s.notes).reduce<Record<string, number>>((acc, n) => {
      acc[n.stage] = (acc[n.stage] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <NavBar role={user.role} />
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Manager Read-Only Dashboard</h1>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <section className="rounded-lg bg-white p-4 shadow">
            <h2 className="font-semibold">Underperformers</h2>
            <ul className="mt-2">
              {underperformers.map((s) => (
                <li key={s.id}>{s.name} ({s.sales} sales / {s.hours.toFixed(1)}h)</li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg bg-white p-4 shadow">
            <h2 className="font-semibold">Top Performers</h2>
            <ul className="mt-2">
              {topPerformers.map((s) => (
                <li key={s.id}>{s.name} ({s.sales} sales)</li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg bg-white p-4 shadow">
            <h2 className="font-semibold">Common Failure Stages</h2>
            <ul className="mt-2">
              {failureStages.map((s) => (
                <li key={s.stage}>{s.stage}: {s.count}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
