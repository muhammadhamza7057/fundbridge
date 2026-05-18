import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardShell from '../components/DashboardShell';
import { useAuth } from '../context/AuthContext';
import { investorNavItems } from '../data/dashboardNavigation';
import TrustPanel from '../components/TrustPanel';

const startupFeed = [
  { name: 'Nova Health', industry: 'HealthTech', stage: 'Seed', need: '$120k', match: 'Very High' },
  { name: 'LedgerLoop', industry: 'FinTech', stage: 'Pre-seed', need: '$80k', match: 'High' },
  { name: 'CampusFlow', industry: 'EdTech', stage: 'Growth', need: '$250k', match: 'Medium' },
];

const requests = [
  { title: 'Intro request from Nova Health', detail: 'Founder wants a 15-minute intro', state: 'New' },
  { title: 'Pitch review pending', detail: 'Deck uploaded 2 hours ago', state: 'Review' },
  { title: 'Deal terms update', detail: 'Negotiation reply requested', state: 'Action needed' },
];

export default function InvestorDashboardPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token && !user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'founder' || user?.role === 'startup_rep') {
      navigate('/dashboard/founder', { replace: true });
    }
  }, [navigate, token, user]);

  return (
    <DashboardShell
      eyebrow="Investor workspace"
      title={`Hello ${user?.name || 'investor'}`}
      subtitle="Use this workspace to review startups, filter matches, chat, and track deals."
      role="Investor"
      ctaLabel="Add Profile"
      ctaTo="/investor-profile"
      navItems={investorNavItems}
      aside={
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Priority filter</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Seed-stage FinTech and AI.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Response target</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Reply within 24 hours.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Next step</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Review the startup feed.</p>
          </div>
        </div>
      }
    >
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <TrustPanel />
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Feed items', '12', 'Startups ready to review'],
              ['Chat requests', '04', 'Waiting for your reply'],
              ['Deals', '02', 'Open deal reviews'],
              ['Match score', '91%', 'Average fit score'],
            ].map(([label, value, helper]) => (
              <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} whileHover={{ y: -6 }} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
                <p className="mt-4 text-3xl font-black tracking-tight text-[var(--text)]">{value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{helper}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
            <motion.section id="feed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)]">Startup feed</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Use these cards to quickly scan each startup.</p>
                </div>
                <span className="rounded-full bg-[#d8e75f]/25 px-3 py-1 text-xs font-semibold text-[var(--text)]">Live</span>
              </div>
              <div className="mt-5 space-y-3">
                {startupFeed.map((startup) => (
                  <article key={startup.name} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--text)]">{startup.name}</h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">{startup.industry} · {startup.stage} · Need {startup.need}</p>
                      </div>
                      <span className="rounded-full bg-[#f18f80]/15 px-3 py-1 text-xs font-semibold text-[var(--text)]">{startup.match}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                      <span>Strong product narrative and clean deck.</span>
                      <button className="font-semibold text-[#f18f80]">Open details</button>
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>

            <section className="space-y-6">
              <motion.article id="chat-requests" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Chat requests</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Review new messages from founders.</p>
                <div className="mt-5 space-y-3">
                  {requests.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[var(--text)]">{item.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{item.detail}</p>
                        </div>
                        <span className="rounded-full bg-[#d8e75f]/25 px-3 py-1 text-xs font-semibold text-[var(--text)]">{item.state}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.article>

              <motion.article id="deals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Deals</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Track active negotiations, due dates, and next steps.</p>
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                  2 deals currently under review.
                </div>
              </motion.article>
            </section>
          </div>
    </DashboardShell>
  );
}
