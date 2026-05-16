import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateStartupPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(token || user);
  const [form, setForm] = useState({ name: '', industry: '', fundingNeeded: '', description: '', pitchUpload: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const heading = useMemo(() => 'Create Startup Profile', []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('industry', form.industry);
      payload.append('fundingNeeded', form.fundingNeeded);
      payload.append('description', form.description);
      if (form.pitchUpload) {
        payload.append('pitchUpload', form.pitchUpload);
      }

      const { data } = await api.post('/api/startup/create', payload);
      setSuccess(data.message || 'Startup profile saved successfully');
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to save startup profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="bg-[#2c2c2c] px-5 py-14 text-white md:px-12 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Founder Workspace</p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{heading}</h1>
            <p className="mt-4 max-w-3xl text-white/80">
              Tell investors what you are building and attach your pitch deck so the profile is ready to share.
            </p>
          </div>
        </section>

        <section className="px-5 py-10 md:px-12 md:py-16">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={submit} className="rounded-[3px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="grid gap-5">
                <Input label="Startup Name" id="startupName" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Startup name" required />
                <Input label="Industry" id="industry" value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} placeholder="Industry" required />
                <Input label="Funding Needed" id="fundingNeeded" type="number" min="0" value={form.fundingNeeded} onChange={(event) => setForm({ ...form, fundingNeeded: event.target.value })} placeholder="Funding needed" required />
                <label className="block space-y-2 text-sm text-slate-600" htmlFor="description">
                  <span className="font-medium text-slate-700">Description</span>
                  <textarea
                    id="description"
                    rows="6"
                    className="w-full rounded-sm border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-[#f18f80] focus:ring-2 focus:ring-[#f18f80]/20"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Describe your startup"
                    required
                  />
                </label>
                <label className="block space-y-2 text-sm text-slate-600" htmlFor="pitchUpload">
                  <span className="font-medium text-slate-700">Pitch Upload</span>
                  <input
                    id="pitchUpload"
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
                    className="block w-full rounded-sm border border-slate-300 bg-white px-4 py-2 text-[15px] text-slate-900 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#d8e75f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-[#cfe04e]"
                    onChange={(event) => setForm({ ...form, pitchUpload: event.target.files?.[0] || null })}
                  />
                </label>
              </div>

              {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
              {success ? <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button type="submit" className="bg-[#f18f80] px-8 py-3 text-white hover:bg-[#ef7f6d]" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Startup Profile'}
                </Button>
                <Button as="a" href="/dashboard" className="bg-slate-100 px-8 py-3 text-slate-700 hover:bg-slate-200">
                  Back to Dashboard
                </Button>
              </div>
            </form>

            <aside className="rounded-[3px] border border-slate-200 bg-[#2c2c2c] p-6 text-white shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">Founder profile tips</h2>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-white/75">
                <li>Keep the description short and specific.</li>
                <li>Use a pitch file that is easy to scan on mobile.</li>
                <li>Funding should be a single numeric value in PKR or USD.</li>
                <li>Uploaded files are served from the backend uploads folder.</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
