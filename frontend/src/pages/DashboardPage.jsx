import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBarChart2, FiBriefcase, FiShield, FiUsers } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const shellVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

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
        <motion.div variants={shellVariants} initial="hidden" animate="visible" className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--muted)]">Dashboard hub</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] md:text-5xl">
            {user?.name ? `Welcome, ${user.name}` : 'Welcome to FundBridge'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">
            Choose your workspace based on your role. Founders get startup, match, chat, and deal tools. Investors get startup feed, filters, chat requests, and deals.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { to: '/dashboard/founder', title: 'Founder Dashboard', desc: 'Create startup, view investors, matches, chat, and deals.', icon: FiBriefcase },
              { to: '/dashboard/investor', title: 'Investor Dashboard', desc: 'Startup feed, filters, chat requests, and deals in one place.', icon: FiUsers },
              { to: '/', title: 'Back to landing', desc: 'Return to the public home page.', icon: FiArrowRight },
              { to: null, title: 'Logout', desc: 'End your session securely.', icon: FiShield, action: logout },
            ].map((item) => (
              <motion.div key={item.title} variants={cardVariants} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
                {item.to ? (
                  <Link to={item.to} className="flex h-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-lg">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.desc}</p>
                    </div>
                    <span className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                      <item.icon />
                    </span>
                  </Link>
                ) : (
                  <button onClick={item.action} className="flex h-full w-full rounded-3xl bg-[var(--brand)] px-5 py-5 text-left text-sm font-semibold text-slate-900 transition hover:brightness-95">
                    <div>
                      {item.title}
                      <span className="mt-2 block text-sm font-normal text-slate-900/70">{item.desc}</span>
                    </div>
                    <span className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50 text-slate-900">
                      <item.icon />
                    </span>
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Workspace ready', value: '100%', helper: 'Responsive across devices', icon: FiShield },
              { label: 'Connect faster', value: '24/7', helper: 'Access chat and deals', icon: FiBarChart2 },
              { label: 'Trusted profiles', value: 'Live', helper: 'Trust data updates in realtime', icon: FiUsers },
              { label: 'Actions', value: '1 tap', helper: 'Jump to your role dashboard', icon: FiBriefcase },
            ].map((item) => (
              <motion.article key={item.label} variants={cardVariants} whileHover={{ y: -4 }} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</p>
                    <p className="mt-4 text-3xl font-black tracking-tight text-[var(--text)]">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.helper}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <item.icon />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}