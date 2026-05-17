import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

export default function StartupProfilePage(){
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    api.get(`/api/startup/${id}`).then(res=>{
      if(!mounted) return;
      setStartup(res.data.startup || res.data);
    }).catch(err=>{
      try {
        const cached = localStorage.getItem(`fb_startup_${id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted) setStartup(parsed);
          return;
        }
      } catch (cacheError) {}
      setError(err?.response?.data?.message || 'Failed to load startup');
    }).finally(()=> mounted && setLoading(false));
    return ()=> mounted = false;
  },[id]);

  if(loading) return <Layout><div className="mx-auto max-w-[1200px] px-5 py-12">Loading...</div></Layout>;
  if(error) return <Layout><div className="mx-auto max-w-[1200px] px-5 py-12 text-red-600">{error}</div></Layout>;
  if(!startup) return <Layout><div className="mx-auto max-w-[1200px] px-5 py-12">No startup found</div></Layout>;

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="mx-auto max-w-[900px] px-5 py-12">
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-36 flex-shrink-0">
                <img src={startup.coverImage || startup.pitchDeck || startup.userId?.avatar || 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Startup-life-cuate-1-1536x1536.png'} alt={startup.name} className="h-36 w-36 rounded-md object-cover" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{startup.name}</h1>
                <p className="mt-2 text-sm text-slate-700">{startup.industry} • {startup.stage}</p>
                <p className="mt-4 text-sm text-slate-800">{startup.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  {startup.pitchDeck && <a href={startup.pitchDeck} target="_blank" rel="noreferrer" className="rounded bg-[#d8e75f] px-4 py-2 text-sm font-semibold text-slate-900">View Pitch</a>}
                  <Link to="/startups" className="text-sm text-slate-600">Back to listings</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
