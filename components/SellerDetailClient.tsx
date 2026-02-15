'use client';

import { useMemo, useState } from 'react';

type SellerPayload = {
  id: string;
  fullName: string;
  shifts: Array<{
    id: string;
    date: string;
    hoursWorked: number;
    conversations: number;
    salesCount: number;
    totalCost: number | null;
  }>;
  notes: Array<{
    id: string;
    date: string;
    stage: string;
    reason: string;
    details: string;
  }>;
  aiRecommendations: Array<{ id: string; createdAt: string; payloadJson: any }>;
};

export function SellerDetailClient({ seller }: { seller: SellerPayload }) {
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const now = Date.now();
    const inDays = (d: string, days: number) => now - new Date(d).getTime() <= days * 86400000;
    const calc = (days: number) => {
      const rows = seller.shifts.filter((s) => inDays(s.date, days));
      const hours = rows.reduce((sum, s) => sum + s.hoursWorked, 0);
      const conv = rows.reduce((sum, s) => sum + s.conversations, 0);
      const sales = rows.reduce((sum, s) => sum + s.salesCount, 0);
      return { hours, conv, sales, trend: rows.map((r) => ({ date: r.date, sales: r.salesCount })) };
    };
    return { d7: calc(7), d30: calc(30) };
  }, [seller.shifts]);

  async function submitForm(formData: FormData, path: string) {
    setLoading(true);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    if (res.ok) location.reload();
    else alert('Request failed');
  }


  async function remove(path: string, id: string) {
    const res = await fetch(path, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) location.reload();
  }

  async function editShift(shift: SellerPayload['shifts'][number]) {
    const hoursWorked = prompt('Hours worked', String(shift.hoursWorked));
    if (!hoursWorked) return;
    const conversations = prompt('Conversations', String(shift.conversations));
    if (!conversations) return;
    const salesCount = prompt('Sales count', String(shift.salesCount));
    if (!salesCount) return;

    const res = await fetch(`/api/sellers/${seller.id}/shifts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: shift.id,
        date: shift.date.slice(0, 10),
        hoursWorked,
        conversations,
        salesCount,
        totalCost: shift.totalCost ?? ''
      })
    });
    if (res.ok) location.reload();
  }

  async function editNote(note: SellerPayload['notes'][number]) {
    const reason = prompt('Reason', note.reason);
    if (!reason) return;
    const details = prompt('Details', note.details);
    if (!details) return;

    const res = await fetch(`/api/sellers/${seller.id}/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: note.id,
        date: note.date.slice(0, 10),
        stage: note.stage,
        reason,
        details
      })
    });
    if (res.ok) location.reload();
  }

  async function generateTips() {
    setLoading(true);
    const res = await fetch(`/api/sellers/${seller.id}/ai-tips`, { method: 'POST' });
    setLoading(false);
    if (res.ok) location.reload();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Stats</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border p-3">7d Hours: {stats.d7.hours.toFixed(1)}</div>
          <div className="rounded border p-3">7d Sales: {stats.d7.sales}</div>
          <div className="rounded border p-3">30d Hours: {stats.d30.hours.toFixed(1)}</div>
          <div className="rounded border p-3">30d Sales: {stats.d30.sales}</div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium">Sales Trend (recent shifts)</h3>
          <ul className="mt-2 text-sm text-slate-700">
            {stats.d30.trend.slice(0, 8).map((point) => (
              <li key={point.date}>
                {new Date(point.date).toLocaleDateString()}: {point.sales} sales
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Add Shift</h2>
        <form
          className="mt-3 grid grid-cols-5 gap-2"
          action={(fd) => submitForm(fd, `/api/sellers/${seller.id}/shifts`)}
        >
          <input name="date" type="date" required />
          <input name="hoursWorked" type="number" step="0.1" placeholder="Hours" required />
          <input name="conversations" type="number" placeholder="Convos" required />
          <input name="salesCount" type="number" placeholder="Sales" required />
          <input name="totalCost" type="number" step="0.01" placeholder="Cost optional" />
          <button disabled={loading} className="col-span-5 bg-blue-600 text-white">
            Save Shift
          </button>
        </form>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Add Coaching Note</h2>
        <form
          className="mt-3 grid grid-cols-2 gap-2"
          action={(fd) => submitForm(fd, `/api/sellers/${seller.id}/notes`)}
        >
          <input name="date" type="date" required />
          <select name="stage" required>
            <option value="OPENING">OPENING</option>
            <option value="QUALIFICATION">QUALIFICATION</option>
            <option value="PITCH">PITCH</option>
            <option value="OBJECTIONS">OBJECTIONS</option>
            <option value="CLOSE">CLOSE</option>
            <option value="FOLLOW_UP">FOLLOW_UP</option>
          </select>
          <input name="reason" placeholder="Reason" className="col-span-2" required />
          <textarea name="details" placeholder="Details" className="col-span-2" required />
          <button disabled={loading} className="col-span-2 bg-blue-600 text-white">
            Save Note
          </button>
        </form>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI Coaching Tips</h2>
          <button onClick={generateTips} className="bg-emerald-600 text-white">
            Generate AI Tips
          </button>
        </div>
        <div className="mt-3 space-y-3 text-sm">
          {seller.aiRecommendations.map((rec) => (
            <div key={rec.id} className="rounded border p-3">
              <p className="font-medium">{new Date(rec.createdAt).toLocaleString()}</p>
              <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(rec.payloadJson, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Existing Records</h2>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium">Shifts</h3>
            <ul>
              {seller.shifts.slice(0, 12).map((s) => (
                <li key={s.id} className="border-b py-1">
                  {new Date(s.date).toLocaleDateString()} | {s.hoursWorked}h | {s.salesCount} sales / {s.conversations} conv
                  <button className='ml-2 bg-slate-100 text-xs' onClick={() => editShift(s)}>Edit</button>
                  <button className='ml-2 bg-red-100 text-xs' onClick={() => remove(`/api/sellers/${seller.id}/shifts`, s.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Coaching Notes</h3>
            <ul>
              {seller.notes.slice(0, 12).map((n) => (
                <li key={n.id} className="border-b py-1">
                  {new Date(n.date).toLocaleDateString()} [{n.stage}] - {n.reason}
                  <button className='ml-2 bg-slate-100 text-xs' onClick={() => editNote(n)}>Edit</button>
                  <button className='ml-2 bg-red-100 text-xs' onClick={() => remove(`/api/sellers/${seller.id}/notes`, n.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
