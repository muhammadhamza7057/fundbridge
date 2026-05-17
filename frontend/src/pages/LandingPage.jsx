import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

function FeatureCard({ icon, title, text, buttonText, tone, to }) {
  return (
    <article className="rounded-[3px] border border-slate-200 bg-white p-6 shadow-sm">
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
    </article>
  );
}

function StepRow({ number, title, text }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-4 md:grid-cols-[56px_1fr]">
      <div className="flex justify-center">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f18f80] bg-[#f6a192] text-sm font-semibold text-slate-900 md:h-12 md:w-12">
          {number}
        </div>
      </div>
      <div className="rounded-sm border border-slate-200 bg-white px-5 py-4">
        <h4 className="text-[18px] font-medium text-slate-800">{title}</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="bg-[#2c2c2c] pb-14 pt-20 text-white md:pb-20 md:pt-24">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 md:grid-cols-2 md:px-12">
            <div>
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] md:text-6xl">Investor Founder Discovery Platform</h1>
              <p className="mt-5 max-w-lg text-[17px] leading-8 text-white/85">
                Pakistan’s first verified digital repository of startups, investors, and founders, enabling curated discovery and visibility.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-white/90 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button className="bg-[#d8e75f] px-5 py-3 text-sm font-semibold text-slate-900">Get Started</Button>
                </Link>
              </div>
              <p className="mt-6 text-[17px] text-white/90">The Go-To Repository for Startups, Investors, and Founders</p>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-8 text-center md:text-left">
                {[
                  ['500+', 'Investors'],
                  ['500+', 'Startups'],
                  ['700+', 'Founders'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <div className="text-4xl font-semibold">{value}</div>
                    <div className="mt-1 text-sm text-white/80">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-[620px] overflow-hidden rounded-[26px]">
                <img
                  src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/05/i2i_Scale_KV_Horizontal-wo-BG-1536x916.png"
                  alt="FundBridge hero visual"
                  className="h-auto w-full object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-[1440px] text-center">
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
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20" id="how-it-works">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-800 md:text-4xl">How it Works</h2>
            <p className="mx-auto mt-4 max-w-4xl text-[15px] leading-7 text-slate-600 md:text-[16px]">
              Our verification process ensures that all community members are genuine, creating a trusted environment for meaningful connections.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-[110px_1fr]">
            <div className="hidden md:block">
              <div className="mx-auto h-full w-px bg-slate-400" />
            </div>
            <div className="grid gap-4">
              <StepRow number="1" title="Submit your Request" text="Tell us about your startup, firm, or organization by filling out a quick form to get started." />
              <StepRow number="2" title="Review & Follow-Up" text="Our team will review your submission and reach out if we need any additional details." />
              <StepRow number="3" title="Get Verified & Go Live" text="Once approved, your profile goes live and becomes part of our verified network." />
              <StepRow number="4" title="Curated Matchmaking" text="If you opt in, we’ll connect you with relevant startups, founders, or investors for collaboration." />
            </div>
          </div>

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