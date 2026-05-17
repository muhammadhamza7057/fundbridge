import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiHelpCircle, FiMessageCircle, FiSliders, FiTool } from 'react-icons/fi';
import DashboardShell from '../components/DashboardShell';
import { useAuth } from '../context/AuthContext';
import { founderNavItems, investorNavItems } from '../data/dashboardNavigation';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useSearchParams } from 'react-router-dom';
import { createDeal, updateDeal, getDeal, listDeals } from '../services/dealService';

function DealManager({ role, config }) {
  const [deals, setDeals] = useState([]);
  const [form, setForm] = useState({ startupId: '', investorId: '', amount: '', title: '', description: '', equity: '', contact: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.startupId || !form.investorId || !form.amount) return;
    setLoading(true);
    try {
      const payload = {
        startupId: form.startupId,
        investorId: form.investorId,
        amount: Number(form.amount),
        title: form.title,
        description: form.description,
        // lightweight fields for display; equity/contact saved in description for now
      };
      const created = await createDeal(payload);
      setDeals((d) => [created, ...d]);
      setForm({ startupId: '', investorId: '', amount: '', title: '', description: '', equity: '', contact: '' });
    } catch (err) {
      console.error('Create deal failed', err);
    } finally {
      setLoading(false);
    }
  };

  // load persisted deals for user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await listDeals();
        if (!mounted) return;
        setDeals(list || []);
      } catch (err) {
        console.error('Failed to load deals', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleStageChange = async (dealId, stage) => {
    try {
      const updated = await updateDeal(dealId, { stage });
      setDeals((prev) => prev.map((d) => (String(d._id) === String(updated._id) ? updated : d)));
    } catch (err) {
      console.error('Update deal failed', err);
    }
  };

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{config.primaryTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">Create and manage deals for testing.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-5 grid gap-3">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Deal title (e.g., Seed round)" className="rounded border p-2" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description for the other party" className="rounded border p-2 h-24" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input name="startupId" value={form.startupId} onChange={handleChange} placeholder="Startup ObjectId" className="rounded border p-2" />
            <input name="investorId" value={form.investorId} onChange={handleChange} placeholder="Investor ObjectId" className="rounded border p-2" />
            <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" type="number" className="rounded border p-2" />
          </div>
          <div className="mt-2 flex gap-2">
            <button disabled={loading} className="rounded bg-[#d8e75f] px-4 py-2">Create Deal</button>
          </div>
        </form>

        <div className="mt-6">
          {deals.length === 0 ? (
            <div className="text-sm text-slate-500">No deals yet. Create one with the form above.</div>
          ) : (
            <ul className="space-y-3">
              {deals.map((d) => (
                <li key={d._id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Deal {d._id}</div>
                      <div className="text-sm text-slate-500">Amount: ${d.amount}</div>
                      <div className="text-sm text-slate-500">Stage: {d.stage}</div>
                    </div>
                    <div className="space-y-2">
                      <select value={d.stage} onChange={(e) => handleStageChange(d._id, e.target.value)} className="rounded border p-2 text-sm">
                        <option>Interested</option>
                        <option>Pitch Shared</option>
                        <option>Negotiation</option>
                        <option>Funded</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="space-y-6">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-semibold">Summary</h3>
          <p className="mt-2 text-sm text-slate-500">{config.subtitle}</p>
        </article>
      </div>
    </div>
  );
}

const sectionContent = {
  founder: {
    chat: {
      eyebrow: 'Founder workspace',
      title: 'Chat',
      subtitle: 'Keep founder and investor messages in one inbox.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/founder',
      summary: [
        { label: 'Open threads', value: '12', detail: '4 need a reply today' },
        { label: 'Unread', value: '03', detail: 'Newest intros are waiting' },
        { label: 'Avg response', value: '1h 24m', detail: 'Fast replies build trust' },
      ],
      primaryTitle: 'Recent chats',
      items: [
        { title: 'Blue Ridge Ventures', detail: 'Intro request, due today', state: 'Priority' },
        { title: 'Northstar Capital', detail: 'Follow-up after pitch call', state: 'Waiting' },
        { title: 'SeedSpark Angels', detail: 'Deck shared 2 hours ago', state: 'New' },
      ],
      secondaryTitle: 'Reply tip',
      secondaryDetail: 'Keep each reply short and clear.',
      secondaryBadge: 'Reply fast',
      tertiaryTitle: 'Quick actions',
      tertiaryItems: ['Pin important chats', 'Mark responses complete', 'Share deck updates quickly'],
    },
    deals: {
      eyebrow: 'Founder workspace',
      title: 'Deals',
      subtitle: 'Track deal updates, due dates, and next steps.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/founder',
      summary: [
        { label: 'Active deals', value: '03', detail: '2 in negotiation' },
        { label: 'Pending tasks', value: '07', detail: 'Docs and follow-ups' },
        { label: 'Close window', value: '14 days', detail: 'Average time to decision' },
      ],
      primaryTitle: 'Deal stages',
      items: [
        { title: 'Intro review', detail: 'Warm lead and first deck review', state: 'Stage 1' },
        { title: 'Term discussion', detail: 'Negotiation and diligence prep', state: 'Stage 2' },
        { title: 'Closing', detail: 'Final approval and signatures', state: 'Stage 3' },
      ],
      secondaryTitle: 'Next action',
      secondaryDetail: 'Highlight the one step that matters most.',
      secondaryBadge: 'Focused',
      tertiaryTitle: 'Checklist',
      tertiaryItems: ['Validate documents', 'Confirm timeline', 'Send follow-up summary'],
    },
    settings: {
      eyebrow: 'Founder workspace',
      title: 'Settings',
      subtitle: 'Update profile, alerts, and workspace defaults.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/founder',
      summary: [
        { label: 'Profile', value: 'Ready', detail: 'Public startup details are visible' },
        { label: 'Notifications', value: 'On', detail: 'Reply reminders are enabled' },
        { label: 'Security', value: 'Protected', detail: 'Session and login are secured' },
      ],
      primaryTitle: 'Workspace preferences',
      items: [
        { title: 'Profile information', detail: 'Name, role, and startup details', state: 'Editable' },
        { title: 'Notification rules', detail: 'Email updates and reminder timing', state: 'Active' },
        { title: 'Privacy controls', detail: 'Visibility for profile and messages', state: 'Review' },
      ],
      secondaryTitle: 'Appearance',
      secondaryDetail: 'The dashboard stays light and clean.',
      secondaryBadge: 'Light UI',
      tertiaryTitle: 'Security',
      tertiaryItems: ['Use a strong password', 'Keep your email verified', 'Sign out on shared devices'],
    },
    help: {
      eyebrow: 'Founder workspace',
      title: 'Help',
      subtitle: 'Find answers and support steps quickly.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/founder',
      summary: [
        { label: 'FAQs', value: '08', detail: 'Most common questions' },
        { label: 'Support', value: '24/7', detail: 'Guides and contact options' },
        { label: 'Tutorials', value: '06', detail: 'Quick usage walkthroughs' },
      ],
      primaryTitle: 'Common answers',
      items: [
        { title: 'How do I update my startup?', detail: 'Open your profile and edit the details.', state: 'Guide' },
        { title: 'How do I start a chat?', detail: 'Use the chat page from the sidebar.', state: 'Quick help' },
        { title: 'How do I track a deal?', detail: 'Open the deal page and update the stage.', state: 'Tip' },
      ],
      secondaryTitle: 'Need help now?',
      secondaryDetail: 'Use the guide cards for a fast answer.',
      secondaryBadge: 'Support',
      tertiaryTitle: 'Support channels',
      tertiaryItems: ['FAQ cards', 'Workspace guides', 'Contact support'],
    },
  },
  investor: {
    filters: {
      eyebrow: 'Investor workspace',
      title: 'Filters',
      subtitle: 'Narrow the startup feed by stage, sector, and fit.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/investor',
      summary: [
        { label: 'Applied', value: '06', detail: 'Saved as your current stack' },
        { label: 'Matched', value: '14', detail: 'High-fit opportunities' },
        { label: 'Saved views', value: '03', detail: 'Reusable filter presets' },
      ],
      primaryTitle: 'Filter presets',
      items: [
        { title: 'Seed-stage AI', detail: 'High-priority startup matches', state: 'Active' },
        { title: 'FinTech growth', detail: 'Mid-market companies', state: 'Saved' },
        { title: 'Health and SaaS', detail: 'Broad discovery view', state: 'Optional' },
      ],
      secondaryTitle: 'Filter chips',
      secondaryDetail: 'Use chips to refine the feed fast.',
      secondaryBadge: 'Clean filter',
      tertiaryTitle: 'Recommended controls',
      tertiaryItems: ['Stage', 'Sector', 'Geography', 'Funding need'],
    },
    chat: {
      eyebrow: 'Investor workspace',
      title: 'Chat',
      subtitle: 'Review founder requests and keep the inbox sorted.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/investor',
      summary: [
        { label: 'Requests', value: '04', detail: '2 marked high priority' },
        { label: 'Unread', value: '02', detail: 'New founder intros' },
        { label: 'Response target', value: '24h', detail: 'Suggested reply window' },
      ],
      primaryTitle: 'Request queue',
      items: [
        { title: 'Nova Health', detail: 'Intro request and deck upload', state: 'New' },
        { title: 'LedgerLoop', detail: 'Follow-up after pitch review', state: 'Waiting' },
        { title: 'CampusFlow', detail: 'Response requested today', state: 'Priority' },
      ],
      secondaryTitle: 'Conversation tip',
      secondaryDetail: 'Keep your reply short and actionable.',
      secondaryBadge: 'Fast reply',
      tertiaryTitle: 'Chat actions',
      tertiaryItems: ['Accept intro', 'Request more details', 'Close the loop'],
    },
    deals: {
      eyebrow: 'Investor workspace',
      title: 'Deals',
      subtitle: 'Keep active negotiations and next steps visible.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/investor',
      summary: [
        { label: 'Live deals', value: '02', detail: 'In active review' },
        { label: 'Due actions', value: '05', detail: 'Docs and replies pending' },
        { label: 'Average score', value: '91%', detail: 'Strong pipeline match' },
      ],
      primaryTitle: 'Pipeline status',
      items: [
        { title: 'Term sheet prep', detail: 'Latest revisions under review', state: 'Stage 1' },
        { title: 'Diligence checklist', detail: 'Documents and signals verified', state: 'Stage 2' },
        { title: 'Closing timeline', detail: 'Final approvals scheduled', state: 'Stage 3' },
      ],
      secondaryTitle: 'Deal summary',
      secondaryDetail: 'Show the next decision clearly.',
      secondaryBadge: 'Focused',
      tertiaryTitle: 'Priority tasks',
      tertiaryItems: ['Review documents', 'Send follow-up', 'Confirm next meeting'],
    },
    settings: {
      eyebrow: 'Investor workspace',
      title: 'Settings',
      subtitle: 'Adjust profile, alerts, and workspace preferences.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/investor',
      summary: [
        { label: 'Profile', value: 'Ready', detail: 'Investor profile is visible' },
        { label: 'Alerts', value: 'On', detail: 'New intros and deal updates' },
        { label: 'Access', value: 'Secure', detail: 'Login state is protected' },
      ],
      primaryTitle: 'Workspace preferences',
      items: [
        { title: 'Profile summary', detail: 'Sector focus and stage preference', state: 'Editable' },
        { title: 'Notification rules', detail: 'Inbox alerts and review reminders', state: 'Active' },
        { title: 'Privacy controls', detail: 'Public profile and message visibility', state: 'Review' },
      ],
      secondaryTitle: 'Appearance',
      secondaryDetail: 'The interface stays light and clean.',
      secondaryBadge: 'Light UI',
      tertiaryTitle: 'Security',
      tertiaryItems: ['Refresh your session periodically', 'Review connected email', 'Log out when finished'],
    },
    help: {
      eyebrow: 'Investor workspace',
      title: 'Help',
      subtitle: 'Find answers, support actions, and workflow tips.',
      ctaLabel: 'Back to overview',
      ctaTo: '/dashboard/investor',
      summary: [
        { label: 'FAQs', value: '08', detail: 'Common investor questions' },
        { label: 'Support', value: '24/7', detail: 'Guides and contact options' },
        { label: 'Tips', value: '06', detail: 'Quick product walkthroughs' },
      ],
      primaryTitle: 'Help topics',
      items: [
        { title: 'How do I apply filters?', detail: 'Open the filter page from the sidebar.', state: 'Guide' },
        { title: 'Where are chat requests?', detail: 'Use the chat page for incoming messages.', state: 'Quick help' },
        { title: 'How do I track deals?', detail: 'Open the deal tracker and update stages.', state: 'Tip' },
      ],
      secondaryTitle: 'Need support now?',
      secondaryDetail: 'Use the cards or contact support directly.',
      secondaryBadge: 'Support',
      tertiaryTitle: 'Support channels',
      tertiaryItems: ['FAQ cards', 'Platform guides', 'Contact support'],
    },
  },
};

function SummaryCard({ label, value, detail }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </article>
  );
}

function ItemCard({ title, detail, state }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <span className="rounded-full bg-[#d8e75f]/20 px-3 py-1 text-xs font-semibold text-slate-900">{state}</span>
      </div>
    </article>
  );
}

function DetailCard({ section, role, badge, detail, items }) {
  const icon = section === 'filters' ? <FiSliders className="text-[#f18f80]" /> : section === 'chat' ? <FiMessageCircle className="text-[#f18f80]" /> : section === 'help' ? <FiHelpCircle className="text-[#f18f80]" /> : <FiTool className="text-[#f18f80]" />;

  return (
    <article className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Quick note</h2>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{badge}</span>
      </div>
      <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
        <div className="flex items-center gap-3 text-slate-900">
          {icon}
          <span className="font-semibold">{role === 'founder' ? 'Founder tip' : 'Investor tip'}</span>
        </div>
        <p className="mt-3">
          {role === 'founder' && section === 'chat' ? 'Use short updates, one clear ask, and a single next step.' : null}
          {role === 'founder' && section === 'deals' ? 'Keep the timeline visible and avoid burying the latest action.' : null}
          {role === 'founder' && section === 'settings' ? 'Profile, notification, and security controls are grouped for quick edits.' : null}
          {role === 'founder' && section === 'help' ? 'Support cards keep answers compact and easy to scan.' : null}
          {role === 'investor' && section === 'filters' ? 'Use just enough filters to keep discovery fast and focused.' : null}
          {role === 'investor' && section === 'chat' ? 'Reply quickly, classify urgency, and keep intros organized.' : null}
          {role === 'investor' && section === 'deals' ? 'A simple stage view helps you scan pipeline health at a glance.' : null}
          {role === 'investor' && section === 'settings' ? 'The dashboard keeps preferences in a quiet, uncluttered panel.' : null}
          {role === 'investor' && section === 'help' ? 'Quick help cards reduce friction when a user needs a fast answer.' : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function DashboardSectionPage({ role, section }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token && !user) {
      navigate('/login', { replace: true });
      return;
    }
    if (role === 'founder' && user?.role === 'investor') {
      navigate('/dashboard/investor', { replace: true });
    }
    if (role === 'investor' && (user?.role === 'founder' || user?.role === 'startup_rep')) {
      navigate('/dashboard/founder', { replace: true });
    }
  }, [navigate, role, token, user]);

  const config = sectionContent[role]?.[section];
  const navItems = role === 'founder' ? founderNavItems : investorNavItems;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeChatId, setActiveChatId] = useState(() => searchParams.get('chatId') || null);

  useEffect(() => {
    setActiveChatId(searchParams.get('chatId') || null);
  }, [searchParams]);

  const content = useMemo(() => {
    if (!config) return null;

    // Special handling for chat section: show list of opposite-role users and chat window
    if (section === 'chat') {
      return (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{config.primaryTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">Start a conversation with matched users or available profiles.</p>
              </div>
            </div>
            <div className="mt-5">
              <ChatList role={role} onOpenChat={(chatId) => setSearchParams({ chatId })} />
            </div>
          </section>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              {activeChatId ? (
                <ChatWindow chatId={activeChatId} title={config.title} />
              ) : (
                <div className="flex h-96 items-center justify-center text-slate-500">Select a user to open chat</div>
              )}
            </div>
          </div>
        </div>
      );
    }
    // Special handling for deals section: provide create/list/update UI
    if (section === 'deals') {
      return <DealManager role={role} config={config} />;
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-3">
          {config.summary.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{config.primaryTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">A clean overview of the current workspace section.</p>
              </div>
              <span className="rounded-full bg-[#f18f80]/15 px-3 py-1 text-xs font-semibold text-slate-900">Live</span>
            </div>
            <div className="mt-5 space-y-3">
              {config.items.map((item) => (
                <ItemCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <DetailCard section={section} role={role} badge={config.secondaryBadge} detail={config.secondaryDetail} items={config.tertiaryItems} />
            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-xl font-semibold text-slate-900">{config.tertiaryTitle}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {config.tertiaryItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <FiArrowUpRight className="mt-1 shrink-0 text-[#f18f80]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </>
    );
  }, [config, role, section, activeChatId, setSearchParams]);

  if (!config) {
    return (
      <DashboardShell
        eyebrow="Dashboard"
        title="Workspace"
        subtitle="The section you requested could not be found. Use the sidebar to return to an available page."
        role={role === 'founder' ? 'Founder' : 'Investor'}
        ctaLabel="Back to overview"
        ctaTo={role === 'founder' ? '/dashboard/founder' : '/dashboard/investor'}
        navItems={navItems}
      >
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">This route is not configured yet.</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      eyebrow={config.eyebrow}
      title={config.title}
      subtitle={config.subtitle}
      role={role === 'founder' ? 'Founder' : 'Investor'}
      ctaLabel={config.ctaLabel}
      ctaTo={config.ctaTo}
      navItems={navItems}
      searchPlaceholder={role === 'founder' ? 'Search founders, deals, and chats' : 'Search startups, filters, and deals'}
    >
      {content}
    </DashboardShell>
  );
}
