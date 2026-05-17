import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardShell from '../components/DashboardShell';
import { useAuth } from '../context/AuthContext';
import { founderNavItems } from '../data/dashboardNavigation';
import TrustPanel from '../components/TrustPanel';

const quickStats = [
  { label: 'Startups', value: '08', helper: 'Saved in your pipeline' },
  { label: 'Matches', value: '14', helper: 'People you can contact' },
  { label: 'Deals', value: '03', helper: 'Open negotiations' },
  { label: 'Replies', value: '97%', helper: 'Typical response rate' },
];

const investorCards = [
  { name: 'Blue Ridge Ventures', focus: 'AI, SaaS', stage: 'Lead investor', status: 'Available for intros' },
  { name: 'Northstar Capital', focus: 'FinTech, Health', stage: 'Growth rounds', status: 'Meeting next week' },
  { name: 'SeedSpark Angels', focus: 'Seed-stage', stage: 'Founders network', status: 'Open to warm leads' },
];

const matches = [
  { title: 'Product-market fit review', time: 'Today · 10:30 AM', state: 'Ready' },
  { title: 'Investor intro request', time: 'Today · 01:00 PM', state: 'Pending' },
  { title: 'Deal follow-up', time: 'Tomorrow · 09:15 AM', state: 'Urgent' },
];

export default function FounderDashboardPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token && !user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'investor') {
      navigate('/dashboard/investor', { replace: true });
    }
  }, [navigate, token, user]);

  return (
    <DashboardShell
      eyebrow="Founder workspace"
      title={`Hello ${user?.name || 'founder'}`}
      subtitle="Use this workspace to manage your startup, review investors, chat, and track deals."
      role="Founder"
      ctaLabel="Add Profile"
      ctaTo="/create-startup"
      navItems={founderNavItems}
      aside={
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Quick note</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Complete profiles get better matches.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Account status</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Your workspace is active.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Next step</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Add or update your startup profile.</p>
          </div>
        </div>
      }
    >
          <TrustPanel />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((item) => (
              <article key={item.label} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</p>
                <p className="mt-4 text-3xl font-black tracking-tight text-[var(--text)]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.helper}</p>
                {item.label === 'Startups' && (
                  <div className="mt-4">
                    <Link to="/create-startup" className="inline-block rounded bg-[#d8e75f] px-3 py-2 text-sm font-semibold text-slate-900">Add Startup</Link>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <section id="investors" className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Investors</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">See your best-fit investor list.</p>
                </div>
                <span className="rounded-full bg-[#d8e75f]/25 px-3 py-1 text-xs font-semibold text-[var(--text)]">3 active</span>
              </div>
              <div className="mt-5 grid gap-3">
                {investorCards.map((investor) => (
                  <article key={investor.name} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--text)]">{investor.name}</h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">Focus: {investor.focus}</p>
                      </div>
                      <span className="rounded-full bg-[#f18f80]/15 px-3 py-1 text-xs font-semibold text-[var(--text)]">{investor.stage}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                      <span>{investor.status}</span>
                      <button className="font-semibold text-[#f18f80]">View profile</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <article id="matches" className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Matches</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Track the conversations that are already in progress.</p>
                <div className="mt-5 space-y-3">
                  {matches.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[var(--text)]">{item.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{item.time}</p>
                        </div>
                        <span className="rounded-full bg-[#d8e75f]/20 px-3 py-1 text-xs font-semibold text-[var(--text)]">{item.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article id="chat" className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Chat</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Keep messages short and reply quickly.</p>
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                  No unread messages. New intros will appear here.
                </div>
              </article>

              <article id="deals" className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Deals</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Keep terms, dates, and next steps in one place.</p>
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                  3 deals are active in your pipeline.
                </div>
              </article>
            </section>
          </div>
    </DashboardShell>
  );
}
