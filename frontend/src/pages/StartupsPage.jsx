import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function StartupsPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/startup/list')
      .then((res) => {
        if (!mounted) return;
        setStartups(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load startups', err?.response || err.message);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <div className="mx-auto max-w-[1200px] px-5 py-16">
          <h1 className="text-3xl font-semibold">Startups</h1>
          <p className="mt-4 text-slate-600">Browse startup profiles, explore stages, industries, and connect with founders.</p>

          <div className="mt-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading startups...</div>
            ) : startups.length === 0 ? (
              <div className="text-sm text-slate-500">No startups found yet.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {startups.map((s) => (
                  <div key={s._id} className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <img src={s.userId?.avatar || '/assets/avatar-placeholder.png'} alt={s.name} className="h-14 w-14 rounded-md object-cover" />
                      <div>
                        <h3 className="text-lg font-semibold">{s.name}</h3>
                        <div className="mt-1 text-sm text-slate-500">{s.industry} • {s.stage}</div>
                        <div className="mt-2 text-sm text-slate-600">{s.description?.slice(0, 160)}{s.description && s.description.length > 160 ? '…' : ''}</div>
                        <div className="mt-4 flex items-center gap-3">
                          <Link to={`/startup/${s._id}`} className="rounded bg-[#d8e75f] px-4 py-2 text-sm font-semibold">View Profile</Link>
                          {s.userId?.trustScore >= 50 && (
                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
