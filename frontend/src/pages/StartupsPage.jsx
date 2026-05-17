import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import dummyStartups from '../data/dummyStartups';
import { useAuth } from '../context/AuthContext';

export default function StartupsPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', stage: '', description: '', country: 'Pakistan', coverImage: '' });
  const [message, setMessage] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/startup/list')
      .then((res) => {
        if (!mounted) return;
        // merge server results with locally-saved startups (from guest adds)
        // dedupe by name+country (case-insensitive)
        const server = (res.data || []).map(i=> ({...i, __local:false}));
        const localSaved = (JSON.parse(localStorage.getItem('fb_local_startups') || '[]') || []).map(i=> ({...i, __local:true}));
        const map = new Map();
        function nk(it){ return `${(it.name||'').toLowerCase().trim()}|${(it.country||'').toLowerCase().trim()}`; }
        // insert server first (take precedence), then local only if missing
        server.forEach(item => map.set(nk(item), item));
        localSaved.forEach(item => { const k = nk(item); if(!map.has(k)) map.set(k, item); });
        const merged = Array.from(map.values());
        // sort server items before local ones for clearer UX
        merged.sort((a,b)=> (a.__local === b.__local) ? 0 : (a.__local ? 1 : -1));
        setStartups(merged);
      })
      .catch((err) => {
        console.error('Failed to load startups', err?.response || err.message);
        const localSaved = JSON.parse(localStorage.getItem('fb_local_startups') || '[]') || [];
        const mapped = localSaved.map(i=> ({...i, __local:true}));
        setStartups(mapped.length ? mapped : dummyStartups.map(i=> ({...i, __local:false})));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const popularPakistan = (startups.length ? startups : dummyStartups).filter(s => s.country === 'Pakistan').sort((a,b)=> (b.hits||0)-(a.hits||0)).slice(0,6);
  const otherPakistan = (startups.length ? startups : dummyStartups).filter(s => s.country === 'Pakistan' && !popularPakistan.find(p=> (p.name||'')=== (s.name||'')) ).slice(0,12);

  function saveLocalStartups(arr){
    try{ localStorage.setItem('fb_local_startups', JSON.stringify(arr || [])); }catch(e){}
  }

  function handleAddStartup(e){
    e.preventDefault();
    const normKey = `${(form.name||'').toLowerCase().trim()}|${(form.country||'').toLowerCase().trim()}`;
    // prevent duplicate name+country
    if(startups.some(s=> ((s.name||'').toLowerCase().trim() + '|' + (s.country||'').toLowerCase().trim()) === normKey)){
      setMessage('A startup with this name and country already exists.');
      setTimeout(()=>setMessage(''),4000);
      return; // duplicate - ignore
    }
    const newItem = { _id: Date.now().toString(), ...form, userId: { name: user?.name||'Guest', trustScore: 0 }, hits: 0, __local: true };
    setStartups(s=> [newItem, ...s]);
    setShowForm(false);
    setForm({ name: '', industry: '', stage: '', description: '', country: 'Pakistan', coverImage: '' });

    if(user){
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('industry', form.industry);
      payload.append('stage', form.stage);
      payload.append('description', form.description);
      payload.append('country', form.country);
      if(form.coverImage) payload.append('coverImage', form.coverImage);
      api.post('/api/startup/create', payload).then(res=>{
        const created = res.data;
        if(created){
          setStartups(prev => [created, ...prev.filter(x=> x._id !== created._id)]);
          try {
            localStorage.setItem(`fb_startup_${created._id}`, JSON.stringify(created));
          } catch (e) {}
          // remove any temp local entry
          const local = JSON.parse(localStorage.getItem('fb_local_startups') || '[]').filter(x=> x._id !== newItem._id);
          saveLocalStartups(local);
          setMessage('Startup added successfully.');
          setTimeout(()=>setMessage(''),4000);
        }
      }).catch(()=>{
        // on failure, persist locally so user can retrieve
        const local = JSON.parse(localStorage.getItem('fb_local_startups') || '[]');
        local.unshift(newItem);
        saveLocalStartups(local);
        setMessage('Saved locally (server unavailable).');
        setTimeout(()=>setMessage(''),4000);
      });
    } else {
      // guest - persist locally
      const local = JSON.parse(localStorage.getItem('fb_local_startups') || '[]');
      local.unshift(newItem);
      saveLocalStartups(local);
      setMessage('Saved locally (you are not signed in).');
      setTimeout(()=>setMessage(''),4000);
    }
  }

  function openAddFromSide(){
    if(!user) return;
    if(!['founder','startup_rep'].includes(user.role)) return;
    setShowForm(true);
    setTimeout(()=>{
      if(formRef.current) formRef.current.scrollIntoView({behavior:'smooth', block:'center'});
    }, 200);
  }

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="bg-[#2c2c2c] text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-3 rounded bg-[#d8e75f]/10 px-3 py-1 text-sm font-semibold text-[#d8e75f]">Get your startup in front of verified investors</div>
                <h1 className="mt-6 text-4xl font-extrabold md:text-5xl">Join the IFDP network and gain visibility</h1>
                <p className="mt-4 max-w-lg text-base text-white/85">Showcase your startup to verified investors across the ecosystem.</p>
                <div className="mt-6">
                  <Link to="/register"><button className="rounded bg-[#d8e75f] px-5 py-3 text-sm font-semibold text-slate-900">Join as Startup</button></Link>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Startup-life-cuate-1-1536x1536.png" alt="Startup illustration" className="w-full max-w-[520px] object-contain" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-8">
          <div className="flex justify-center">
            <div className="mt-[-28px] w-full max-w-3xl rounded-full bg-white px-4 py-2 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="layout-switcher inline-flex items-center gap-2">
                    <button onClick={()=>setLayout('grid')} className={`grid rounded-full p-2 ${layout==='grid' ? 'bg-slate-100' : ''}`} aria-label="Grid view">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${layout==='grid' ? 'text-slate-700' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>
                    </button>
                    <button onClick={()=>setLayout('list')} className={`list rounded-full p-2 ${layout==='list' ? 'bg-slate-100' : ''}`} aria-label="List view">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${layout==='list' ? 'text-slate-700' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="sort-by-select">
                    <select className="rounded border px-3 py-2 text-sm text-slate-700">
                      <option>Default Order</option>
                      <option>Verified</option>
                    </select>
                  </div>
                  <div className="panel-dropdown wide">
                    <button className="rounded border px-3 py-2 text-sm text-slate-700">More Filters ▾</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Explore Startups</h2>
            <div className="hidden md:flex items-center gap-3">
              <div className="rounded border bg-white px-3 py-2 text-sm text-slate-700">View: Grid</div>
              <div className="rounded border bg-white px-3 py-2 text-sm text-slate-700">Default Order ▾</div>
            </div>
          </div>

          {popularPakistan.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Most Popular in Pakistan</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {popularPakistan.map(p => (
                  <div key={p._id} className="rounded-md overflow-hidden bg-gray-100 shadow-sm">
                    <div style={{paddingTop:'56%'}} className="w-full relative">
                      <img src={p.coverImage || p.pitchDeck || p.userId?.avatar || 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Startup-life-cuate-1-1536x1536.png'} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{p.name}</h4>
                        <span className="text-sm text-slate-700">{p.hits || 0} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherPakistan.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Other Startups in Pakistan</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {otherPakistan.map(p => (
                  <div key={p._id || p.name} className="rounded-md overflow-hidden bg-white/90 border shadow-sm">
                    <div style={{paddingTop:'56%'}} className="w-full relative">
                      <img src={p.coverImage || p.userId?.avatar} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">{p.name}</h4>
                        <span className="text-sm text-slate-600">{p.hits || 0} views</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-700">{p.industry || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            {loading ? (
              <div className="text-sm text-slate-800">Loading startups...</div>
            ) : (startups.length === 0 ? (
              <div className="text-sm text-slate-800">No startups found yet. Showing sample listings.</div>
            ) : (
              <>
                <div className={`mt-4 grid gap-6 ${layout === 'grid' ? 'sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                  {(startups.length === 0 ? dummyStartups : startups).map((s) => (
                    layout === 'grid' ? (
                      <article key={s._id} className="relative rounded-md overflow-hidden bg-gray-100 shadow-sm">
                        <div style={{paddingTop: '70%'}} className="w-full relative">
                          <img src={s.coverImage || s.pitchDeck || s.userId?.avatar || 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Startup-life-cuate-1-1536x1536.png'} alt={s.name} className="absolute inset-0 h-full w-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                        <div className="absolute left-3 top-3">
                          <span className="inline-block rounded-full bg-[#d8e75f] px-3 py-1 text-xs font-semibold text-slate-900">Startup</span>
                        </div>
                        <Link to={`/startup/${s._id}`} className="absolute left-4 bottom-4 text-white">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{s.name}</h3>
                            {s.userId?.trustScore >= 50 && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </Link>
                        <button className="absolute right-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                          </svg>
                        </button>
                      </article>
                    ) : (
                      <div key={s._id} className="flex items-center gap-4 rounded-md border p-4">
                        <img src={s.coverImage || s.pitchDeck || s.userId?.avatar || 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Startup-life-cuate-1-1536x1536.png'} alt={s.name} className="h-28 w-28 rounded-md object-cover" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{s.name}</h3>
                            {s.userId?.trustScore >= 50 && <span className="text-green-400">✔ Verified</span>}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">{s.industry} • {s.stage}</div>
                          <p className="mt-2 text-sm text-slate-800">{s.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Link to={`/startup/${s._id}`} className="rounded bg-[#d8e75f] px-4 py-2 text-sm font-semibold">View Profile</Link>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-3">
                  <button className="h-10 w-10 rounded-full bg-slate-100">◀</button>
                  <div className="inline-flex items-center gap-2">
                    <button className="h-10 w-10 rounded-full bg-[#f3f3f3]">1</button>
                    <button className="h-10 w-10 rounded-full">2</button>
                    <button className="h-10 w-10 rounded-full">3</button>
                  </div>
                  <button className="h-10 w-10 rounded-full bg-slate-100">▶</button>
                </div>
              </>
            ))}
          </div>
          
          {/* Add startup form (client-side) */}
          <div className="mt-8 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add a Startup</h3>
              <div>
                {!user ? (
                  <div className="text-sm text-slate-600">Please <Link to="/login" className="text-[#0b6f4f]">log in</Link> to add.</div>
                ) : (['founder','startup_rep'].includes(user.role) ? (
                  <button onClick={()=> setShowForm(s=>!s)} className="text-sm text-slate-800">{showForm ? 'Close' : 'Add'}</button>
                ) : (
                  <div className="text-sm text-slate-600">Only startup accounts can add startups. <Link to="/register" className="text-[#0b6f4f]">Register as Startup</Link></div>
                ))}
              </div>
            </div>
            {showForm && (
              <div ref={formRef}>
              <form onSubmit={handleAddStartup} className="mt-4 grid gap-3">
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Startup name" className="rounded border px-3 py-2" />
                <input value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} placeholder="Industry" className="rounded border px-3 py-2" />
                <input value={form.stage} onChange={e=>setForm({...form,stage:e.target.value})} placeholder="Stage" className="rounded border px-3 py-2" />
                <input value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="Country" className="rounded border px-3 py-2" />
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short description" className="rounded border px-3 py-2" />
                <div className="flex gap-2">
                  <input value={form.coverImage} onChange={e=>setForm({...form,coverImage:e.target.value})} placeholder="Cover image URL" className="rounded border px-3 py-2 flex-1" />
                  <button type="submit" className="rounded bg-[#d8e75f] px-4 py-2 font-semibold">Add</button>
                </div>
              </form>
              </div>
            )}
            {message && <div className="mt-3 rounded bg-yellow-50 border-l-4 border-yellow-400 px-4 py-2 text-sm text-slate-800">{message}</div>}
          </div>

          {/* Floating side add button for larger screens */}
          {user && ['founder','startup_rep'].includes(user.role) && (
            <button onClick={openAddFromSide} className="fixed right-6 top-1/3 z-40 hidden lg:flex items-center gap-3 rounded-full bg-[#d8e75f] px-4 py-3 shadow-lg text-sm font-semibold text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              Add Startup
            </button>
          )}

          {/* Startup strategies / guides */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold">Startup Strategies & Guides</h3>
            <p className="mt-2 text-sm text-slate-700">Short actionable guides inspired by successful startups — read, adapt, and apply.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-md border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-slate-900">Growth Hacking Basics</h4>
                <p className="mt-2 text-sm text-slate-700">Low-cost tactics early-stage teams used to acquire initial users and validate product-market fit.</p>
                <a className="mt-3 inline-block text-sm font-semibold text-[#0b6f4f]" href="#">Read more</a>
              </div>
              <div className="rounded-md border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-slate-900">Fundraising 101</h4>
                <p className="mt-2 text-sm text-slate-700">How top startups pitched investors, structured decks, and negotiated early term sheets.</p>
                <a className="mt-3 inline-block text-sm font-semibold text-[#0b6f4f]" href="#">Read more</a>
              </div>
              <div className="rounded-md border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-slate-900">Retention Playbook</h4>
                <p className="mt-2 text-sm text-slate-700">Simple retention loops and product hooks that increased engagement in the first 90 days.</p>
                <a className="mt-3 inline-block text-sm font-semibold text-[#0b6f4f]" href="#">Read more</a>
              </div>
            </div>
          </div>

        </section>
      </main>
    </Layout>
  );
}
