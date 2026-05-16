import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InvestorProfilePage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(token || user);
  const [form, setForm] = useState({ budgetMin: '', budgetMax: '', industries: '', riskLevel: 'medium' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const heading = useMemo(() => 'Investor Profile', []);

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
      const { data } = await api.post('/api/investor/create', {
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        industries: form.industries,
        riskLevel: form.riskLevel,
      });
      setSuccess(data.message || 'Investor profile saved successfully');
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to save investor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="bg-[#2c2c2c] px-5 py-14 text-white md:px-12 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Investor Workspace</p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{heading}</h1>
            <p className="mt-4 max-w-3xl text-white/80">
              Set your budget, interest areas, and risk appetite so matching can stay focused.
            </p>
          </div>
        </section>

        <section className="px-5 py-10 md:px-12 md:py-16">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={submit} className="rounded-[3px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input label="Budget Min" id="budgetMin" type="number" min="0" value={form.budgetMin} onChange={(event) => setForm({ ...form, budgetMin: event.target.value })} placeholder="Minimum budget" required />
                  <Input label="Budget Max" id="budgetMax" type="number" min="0" value={form.budgetMax} onChange={(event) => setForm({ ...form, budgetMax: event.target.value })} placeholder="Maximum budget" required />
                </div>
                <Input label="Industries" id="industries" value={form.industries} onChange={(event) => setForm({ ...form, industries: event.target.value })} placeholder="FinTech, AI, SaaS" required />
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Risk Level</span>
                  <select
                    value={form.riskLevel}
                    onChange={(event) => setForm({ ...form, riskLevel: event.target.value })}
                    className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              {error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
              {success ? <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button type="submit" className="bg-[#f18f80] px-8 py-3 text-white hover:bg-[#ef7f6d]" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Investor Profile'}
                </Button>
                <Button as="a" href="/dashboard" className="bg-slate-100 px-8 py-3 text-slate-700 hover:bg-slate-200">
                  Back to Dashboard
                </Button>
              </div>
            </form>

            <aside className="rounded-[3px] border border-slate-200 bg-[#2c2c2c] p-6 text-white shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">Investor profile tips</h2>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-white/75">
                <li>Separate industries with commas for better matching.</li>
                <li>Budget range can be in PKR or USD as long as you stay consistent.</li>
                <li>Risk level helps the platform filter better opportunities.</li>
                <li>Profiles can be edited later by submitting the form again.</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
