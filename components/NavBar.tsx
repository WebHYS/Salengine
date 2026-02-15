import Link from 'next/link';

export function NavBar({ role }: { role: 'ADMIN' | 'MANAGER' }) {
  return (
    <nav className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="font-semibold">SalesCoach Dashboard</div>
      <div className="flex gap-3 text-sm">
        {role === 'ADMIN' ? (
          <>
            <Link href="/admin" className="text-blue-600">
              Admin Dashboard
            </Link>
            <Link href="/admin/leaderboard" className="text-blue-600">
              Leaderboard
            </Link>
          </>
        ) : (
          <Link href="/manager" className="text-blue-600">
            Manager View
          </Link>
        )}
        <form action="/api/auth/logout" method="post">
          <button className="bg-slate-100">Logout</button>
        </form>
      </div>
    </nav>
  );
}
