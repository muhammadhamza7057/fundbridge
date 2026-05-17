import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function InvestorsPage() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/investor/list')
      .then((res) => {
        if (!mounted) return;
        setInvestors(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load investors', err?.response || err.message);
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
          <h1 className="text-3xl font-semibold">Investors</h1>
          <p className="mt-4 text-slate-600">Discover investors, funds, and angel networks active in the ecosystem. View investment focus, stage, and contact options.</p>

          <div className="mt-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading investors...</div>
            ) : investors.length === 0 ? (
              <div className="text-sm text-slate-500">No investors found yet.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {investors.map((i) => (
                  <div key={i._id} className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <img src={i.userId?.avatar || '/assets/avatar-placeholder.png'} alt={i.userId?.name} className="h-14 w-14 rounded-md object-cover" />
                      <div>
                        <h3 className="text-lg font-semibold">{i.userId?.name || 'Investor'}</h3>
                        <div className="mt-1 text-sm text-slate-500">Focus: {i.industries?.join(', ') || 'General'}</div>
                        <div className="mt-2 text-sm text-slate-600">Range: {i.investmentRange?.min ?? '-'} - {i.investmentRange?.max ?? '-'}</div>
                        <div className="mt-4 flex items-center gap-3">
                          <Link to={`/investor/${i._id}`} className="rounded bg-[#d8e75f] px-4 py-2 text-sm font-semibold">View Profile</Link>
                          {i.userId?.trustScore >= 50 && (
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
