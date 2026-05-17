import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'founder' || user?.role === 'startup_rep') {
      navigate('/dashboard/founder', { replace: true });
      return;
    }

    if (user?.role === 'investor') {
      navigate('/dashboard/investor', { replace: true });
    }
  }, [navigate, user]);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--muted)]">Dashboard hub</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] md:text-5xl">
            {user?.name ? `Welcome, ${user.name}` : 'Welcome to FundBridge'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">
            Choose your workspace based on your role. Founders get startup, match, chat, and deal tools. Investors get startup feed, filters, chat requests, and deals.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link to="/dashboard/founder" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--text)]">Founder Dashboard</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Create startup, view investors, matches, chat, and deals.</p>
            </Link>
            <Link to="/dashboard/investor" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--text)]">Investor Dashboard</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Startup feed, filters, chat requests, and deals in one place.</p>
            </Link>
            <Link to="/" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--text)]">Back to landing</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Return to the public home page.</p>
            </Link>
            <button onClick={logout} className="rounded-3xl bg-[var(--brand)] px-5 py-5 text-left text-sm font-semibold text-slate-900 transition hover:brightness-95">
              Logout
              <span className="mt-2 block text-sm font-normal text-slate-900/70">End your session securely.</span>
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}