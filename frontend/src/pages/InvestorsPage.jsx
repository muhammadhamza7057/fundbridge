import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

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
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#16a34a] text-sm font-semibold text-white md:h-12 md:w-12 z-10 shadow-md">
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

export default function InvestorsPage() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/investor/list')
      .then((res) => {
        if (!mounted) return;
        setInvestors(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load investors', err?.response || err.message);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="bg-[#2c2c2c] text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h1 className="text-4xl font-semibold md:text-5xl">Investors</h1>
                <p className="mt-4 max-w-lg text-base text-white/85">Discover investors, funds, and angel networks active in the ecosystem. View investment focus, stage, and contact options.</p>
                <div className="mt-6 flex items-center gap-4">
                  <Link to="/register"><button className="rounded bg-[#d8e75f] px-5 py-3 text-sm font-semibold text-slate-900">Get Started</button></Link>
                  <Link to="/knowledge" className="rounded border bg-white/5 px-4 py-3 text-sm text-white">Knowledge Hub</Link>
                </div>
                <div className="mt-8 grid max-w-md grid-cols-3 gap-8 text-center md:text-left">
                  <div>
                    <div className="text-3xl font-semibold">{investors.length || '—'}</div>
                    <div className="mt-1 text-sm text-white/80">Investors</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">500+</div>
                    <div className="mt-1 text-sm text-white/80">Startups</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">700+</div>
                    <div className="mt-1 text-sm text-white/80">Founders</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/05/i2i_Scale_KV_Horizontal-wo-BG-1536x916.png" alt="Investors" className="w-full max-w-[520px] object-contain" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-12 md:py-16">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Explore Investors</h2>
            <p className="mt-2 text-sm text-slate-600">Browse verified investor profiles and discover who is investing in what.</p>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading investors...</div>
            ) : investors.length === 0 ? (
              <div className="text-sm text-slate-500">No investors found yet.</div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {investors.map((i) => (
                  <article key={i._id} className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="overflow-hidden rounded-md bg-[#f3f3f3] p-4 flex items-center gap-4">
                      <img src={i.userId?.avatar || '/assets/avatar-placeholder.png'} alt={i.userId?.name} className="h-20 w-20 rounded-md object-cover" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{i.userId?.name || 'Investor'}</h3>
                        <div className="mt-1 text-sm text-slate-500">{i.industries?.slice(0,3).join(', ') || 'General'}</div>
                        <div className="mt-2 text-sm text-slate-600">Range: {i.investmentRange?.min ?? '-'} — {i.investmentRange?.max ?? '-'}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Link to={`/investor/${i._id}`} className="rounded bg-[#f18f80] px-4 py-2 text-sm text-white">View Profile</Link>
                      {i.userId?.trustScore >= 50 ? (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Verified</span>
                      ) : (
                        <span className="text-sm text-slate-500">Not Verified</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-[1200px] text-center">
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
                to="/register"
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
            <div className="hidden md:flex">
              <div className="relative mx-auto h-full w-12">
                <div className="absolute left-1/2 top-6 bottom-6 w-1 bg-[#16a34a] transform -translate-x-1/2" />
              </div>
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
              <button className="bg-[#d8e75f] px-5 py-2 text-sm font-semibold text-slate-900">Get Started</button>
            </Link>
          </div>
        </section>

        <section className="px-5 py-12 md:px-12">
          <div className="mx-auto max-w-[1200px]">
            <h3 className="text-xl font-semibold">i2i Made This Possible</h3>
            <p className="mt-4 text-slate-600">IFDP is proud to be a part of i2i, connecting innovators, entrepreneurs, and investors across the globe to create meaningful impact.</p>
            <div className="mt-8 flex items-center justify-center gap-8">
              <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2024/08/invest2innovate.png" alt="i2i" className="h-20 md:h-24 object-contain" />
              <div className="h-px w-24 bg-slate-200" />
              <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/05/Visa-Foundation.jpg" alt="Visa" className="h-20 md:h-24 object-contain" />
            </div>
            <div className="mt-8 flex justify-center">
              <button className="rounded bg-[#d8e75f] px-5 py-2 text-sm font-semibold text-slate-900">Learn More About i2i</button>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <h3 className="text-xl font-semibold">Our Amazing Partners</h3>
            <p className="mt-4 text-slate-600">Invest2Innovate has launched Investor Founder Discovery Platform (IFDP) supported by Visa Foundation.</p>
            <div className="mt-8 flex items-center gap-12 justify-center">
              <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2024/08/invest2innovate.png" alt="i2i" className="h-20 md:h-24 object-contain" />
              <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/05/Visa-Foundation.jpg" alt="Visa" className="h-20 md:h-24 object-contain" />
            </div>
          </div>
        </section>

        <section className="px-5 py-12 md:px-12">
          <div className="mx-auto max-w-[1200px]">
            <a href="https://medium.com/kahloonjournal/deep-dive-into-pakistans-investment-landscape-42f87ac5da76" target="_blank" rel="noreferrer" className="block">
              <div
                className="relative overflow-hidden rounded-md"
                style={{
                  backgroundImage: "url('https://miro.medium.com/v2/resize:fit:1400/1*8Bb51hyKmtYmfvKz2Lf95w.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/55" />
                <div className="relative px-6 py-20 text-center text-white">
                  <h3 className="text-3xl font-semibold md:text-4xl">i2i Community</h3>
                  <p className="mx-auto mt-4 max-w-2xl text-base">Join a thriving community of investors and founders who support innovation</p>
                  <div className="mt-6">
                    <button className="rounded bg-[#d8e75f] px-6 py-3 text-sm font-semibold text-slate-900">Join Our Community</button>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>
    </Layout>
  );
}
