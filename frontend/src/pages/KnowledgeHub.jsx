import Layout from '../components/Layout';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

export default function KnowledgeHub() {
  const resources = [
    {
      id: 'investors-look-for',
      title: 'What Investors Look For',
      img: 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/knowledge-hub-ifdp-1536x1536.png',
      desc: 'Before you pitch to investors, it’s critical to understand what they really want. This guide outlines six essential factors: market size, traction, founder credibility, financials, investment thesis, and network fit — with insights from the Pakistan Startup Ecosystem Report that highlight the outsized importance of founder strength.',
      file: '/assets/docs/what-investors-look-for.pdf',
    },
    {
      id: 'choosing-funding',
      title: 'Choosing the Right Funding Instrument',
      img: 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/knowledge-hub-ifdp-1536x1536.png',
      desc: 'Choose the right funding for your stage and goals. This guide breaks down equity, convertible notes & SAFEs, revenue‑based financing, grants, and debt — covering pros, cons, dilution, repayment risk, and when each instrument makes sense.',
      file: '/assets/docs/choosing-the-right-funding-instrument.pdf',
    },
    {
      id: 'starting-startup',
      title: 'All You Need to Know When Starting a Startup',
      img: 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/knowledge-hub-ifdp-1536x1536.png',
      desc: 'A practical playbook for founders: validate ideas, build a lean MVP, find early traction, manage finances, and learn when and how to approach investors. Ideal for first‑time founders seeking a clear step‑by‑step roadmap.',
      file: '/assets/docs/all-you-need-to-know-starting-a-startup.pdf',
    },
    {
      id: 'starter-guide-small',
      title: 'Starter Guide: ANGEL INVESTING IN PAKISTAN',
      img: 'https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Starter-Guide-ANGEL-INVESTING-IN-PAKISTAN.jpeg',
      desc: 'A practical guide for aspiring angel investors in Pakistan — covering due diligence, portfolio construction, legal/tax considerations, and how to support founders beyond capital.',
      file: '/assets/docs/angel-investing-in-pakistan.pdf',
    },
  ];

  return (
    <Layout>
      <main className="bg-white text-slate-900">
        <section className="bg-[#2b2b2b] text-white">
          <div className="mx-auto max-w-[1200px] px-5 py-20">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded bg-[#ffebe8] px-3 py-1 text-sm font-semibold text-[#b24f45]">
                  <span className="h-3 w-3 rounded-full bg-[#b24f45] block" />
                  Everything you need, right where you need it.
                </div>
                <h1 className="mt-6 text-5xl font-bold leading-tight">Knowledge Hub</h1>
                <p className="mt-4 max-w-lg text-base text-white/85">Welcome to our Knowledge Hub — essential resources to help you navigate your startup journey.</p>
                <div className="mt-8 flex items-center gap-4">
                  <Link to="/register"><Button className="bg-[#d8e75f] px-5 py-3">Get Started</Button></Link>
                  <a href="/assets/docs/angel-investing-in-pakistan.pdf" target="_blank" rel="noreferrer" className="rounded border bg-white/5 px-4 py-3 text-sm text-white">Download Guide</a>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/knowledge-hub-ifdp-1536x1536.png" alt="Knowledge Hub" className="w-full max-w-[520px] object-contain" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {resources.slice(0,3).map((r) => (
              <article key={r.id} className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="overflow-hidden rounded-md bg-[#111]">
                  <img src={r.img} alt={r.title} className="h-40 w-full object-cover opacity-95" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{r.desc}</p>
                <div className="mt-6">
                  <a href={r.file} className="mx-auto block w-36 rounded bg-[#f18f80] px-4 py-2 text-sm text-white text-center">Download PDF</a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-lg border bg-white p-6">
            <div className="grid gap-6 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold">Starter Guide: ANGEL INVESTING IN PAKISTAN</h3>
                <p className="mt-4 text-sm text-slate-600">Pakistan’s evolving startup ecosystem offers a unique opportunity for angel investors to support early-stage startups while potentially earning high returns. This guidebook demystifies the process, covering risks, due diligence, legal/tax basics, and practical steps for new angels.</p>
                <div className="mt-6">
                  <a href="/assets/docs/angel-investing-in-pakistan.pdf" target="_blank" rel="noreferrer" className="rounded bg-[#f18f80] px-4 py-2 text-sm text-white">Download PDF</a>
                </div>
              </div>
              <div className="flex justify-end">
                <img src="https://ifdp.invest2innovate.com/wp-content/uploads/2025/06/Starter-Guide-ANGEL-INVESTING-IN-PAKISTAN.jpeg" alt="Starter Guide" className="w-full max-w-[280px] object-cover rounded-md shadow-md" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
