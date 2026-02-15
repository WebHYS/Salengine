'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@salescoach.local');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      setError('Invalid email or password');
      return;
    }

    const data = await res.json();
    router.push(data.role === 'MANAGER' ? '/manager' : '/admin');
    router.refresh();
  }

  return (
    <main className="mx-auto mt-20 max-w-md rounded-lg bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">SalesCoach Dashboard Login</h1>
      <p className="mt-2 text-sm text-slate-600">Use seeded accounts to test roles.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            className="w-full"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full bg-blue-600 text-white" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
