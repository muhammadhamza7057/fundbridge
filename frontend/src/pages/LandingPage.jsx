import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBarChart2, FiShield, FiUsers, FiTrendingUp } from 'react-icons/fi';
import Layout from '../components/Layout';
import Button from '../components/Button';

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function FeatureCard({ icon, title, text, buttonText, tone, to }) {
  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition"
    >
      <div className={`mb-10 inline-flex h-12 w-12 items-center justify-center rounded-[4px] ${tone} text-2xl`}>
        {icon}
      </div>
      <h3 className="text-[22px] font-semibold text-slate-900">{title}</h3>
      <p className="mt-4 min-h-[96px] text-[15px] leading-7 text-slate-700">{text}</p>
      {to ? (
        <Link to={to} className={`mt-6 inline-block rounded-sm px-4 py-2 text-sm font-medium ${tone} text-slate-900`}>
          {buttonText} →
        </Link>
      ) : (
        <button className={`mt-6 rounded-sm px-4 py-2 text-sm font-medium ${tone} text-slate-900`}>
          {buttonText} →
        </button>
      )}
    </motion.article>
  );
}

function StepRow({ number, title, text }) {
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-[40px_1fr] gap-4 md:grid-cols-[56px_1fr]">
      <div className="flex justify-center">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f18f80] bg-[#f6a192] text-sm font-semibold text-slate-900 md:h-12 md:w-12">
          {number}
        </div>
      </div>
      <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h4 className="text-[18px] font-medium text-slate-800">{title}</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="relative overflow-hidden bg-[#1f2430] pb-14 pt-20 text-white md:pb-20 md:pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,231,95,0.28),transparent_22%),radial-gradient(circle_at_top_right,rgba(241,143,128,0.22),transparent_24%),linear-gradient(180deg,rgba(18,24,38,0.2),rgba(18,24,38,0.8))]" />
          <motion.div
            aria-hidden="true"
            className="absolute -left-24 top-14 h-56 w-56 rounded-full bg-[#d8e75f]/20 blur-3xl"
            animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#f18f80]/18 blur-3xl"
            animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div variants={pageVariants} initial="hidden" animate="visible" className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 md:grid-cols-2 md:px-12">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                <FiShield /> Verified network
              </div>
              <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.02] md:text-6xl">Investor Founder Discovery Platform</h1>
              <p className="mt-5 max-w-lg text-[17px] leading-8 text-white/80">
                Pakistan’s verified digital repository of startups, investors, founders, and admin-reviewed trust signals, enabling curated discovery and visibility.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link to="/login" className="text-sm font-semibold text-white/90 transition hover:text-white">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button className="bg-[#d8e75f] px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_30px_rgba(216,231,95,0.25)]">Get Started</Button>
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { value: '500+', label: 'Investors', icon: FiUsers },
                  { value: '500+', label: 'Startups', icon: FiBarChart2 },
                  { value: '700+', label: 'Founders', icon: FiTrendingUp },
                  { value: '100%', label: 'Verified flow', icon: FiShield },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-3xl font-black tracking-tight text-white">{item.value}</div>
                        <div className="mt-1 text-sm text-white/70">{item.label}</div>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg text-white">
                        <item.icon />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center md:justify-end">
              <div className="w-full max-w-[620px] overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur">
                <img
                  src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/05/i2i_Scale_KV_Horizontal-wo-BG-1536x916.png"
                  alt="FundBridge hero visual"
                  className="h-auto w-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={pageVariants} className="mx-auto max-w-[1440px] text-center">
            <h2 className="text-3xl font-semibold text-slate-800 md:text-4xl">Value That Drives Growth</h2>
            <p className="mx-auto mt-4 max-w-4xl text-[15px] leading-7 text-slate-600 md:text-[16px]">
              The Investor Founder Discovery Platform (FundBridge) is a curated repository of startups, investors, and founders, where verified profiles of innovative startups, their founders, and keen investors are actively maintained.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM8 13c-2.673 0-8 1.337-8 4v1h16v-1c0-2.663-5.327-4-8-4zm8 0c-.29 0-.579.01-.865.03C17.3 13.4 20 14.9 20 16v1h4v-1c0-2.663-5.327-4-8-4z" />
                  </svg>
                }
                title="Join as an Investor"
                text="Explore profiles of investors driving innovation and growth. Connect with individuals and firms supporting startups across diverse sectors."
                buttonText="Explore Investors"
                tone="bg-[#f5a79b]"
                to="/investors"
              />
              <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2l3 7h7l-5.5 4 2 8L12 17l-6.5 4 2-8L2 9h7l3-7z" />
                  </svg>
                }
                title="Join as a Startup"
                text="Browse startups at various stages across multiple industries. Discover teams solving real challenges and scaling impactful ventures."
                buttonText="Explore Startups"
                tone="bg-[#d6ccff]"
                to="/startups"
              />
              <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7V6a2 2 0 0 1 2-2h3l2 3h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 10v4M15 10v4" />
                  </svg>
                }
                title="Join as a Founder"
                text="Meet the visionary founders shaping Pakistan’s startup ecosystem. Explore their stories, expertise, and ambitions to inspire collaboration."
                buttonText="Explore Founders"
                tone="bg-[#d7eb4a]"
              />
            </div>
          </motion.div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20" id="how-it-works">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={pageVariants} className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-800 md:text-4xl">How it Works</h2>
            <p className="mx-auto mt-4 max-w-4xl text-[15px] leading-7 text-slate-600 md:text-[16px]">
              Our verification process ensures that all community members are genuine, creating a trusted environment for meaningful connections.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={pageVariants} className="mx-auto mt-10 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-[110px_1fr]">
            <div className="hidden md:block">
              <div className="mx-auto h-full w-px bg-slate-400" />
            </div>
            <div className="grid gap-4">
              <StepRow number="1" title="Submit your Request" text="Tell us about your startup, firm, or organization by filling out a quick form to get started." />
              <StepRow number="2" title="Review & Follow-Up" text="Our team will review your submission and reach out if we need any additional details." />
              <StepRow number="3" title="Get Verified & Go Live" text="Once approved, your profile goes live and becomes part of our verified network." />
              <StepRow number="4" title="Curated Matchmaking" text="If you opt in, we’ll connect you with relevant startups, founders, or investors for collaboration." />
            </div>
          </motion.div>

          <div className="mt-8 flex justify-center">
            <Link to="/register">
              <Button className="bg-[#d8e75f] px-5 py-2 text-sm font-semibold text-slate-900">Get Started</Button>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}