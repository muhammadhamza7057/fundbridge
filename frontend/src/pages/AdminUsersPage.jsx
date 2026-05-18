import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiMail, FiRefreshCw, FiShield, FiSmartphone, FiUsers, FiSend, FiX } from 'react-icons/fi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';

const chartColors = ['#0f172a', '#d8e75f', '#f18f80'];

const adminNavItems = [
  { to: '/dashboard/admin/users', label: 'Overview', icon: FiUsers, group: 'main' },
  { to: '#needs-attention', label: 'Needs Attention', icon: FiAlertCircle, group: 'workspace' },
  { to: '#verified', label: 'Verified Users', icon: FiCheckCircle, group: 'workspace' },
  { to: '#all-users', label: 'All Users', icon: FiShield, group: 'bottom' },
];

const filterOptions = [
  { key: 'all', label: 'All users' },
  { key: 'needs_attention', label: 'Needs attention' },
  { key: 'email_pending', label: 'Email pending' },
  { key: 'phone_pending', label: 'Phone pending' },
  { key: 'unapproved', label: 'Not approved' },
  { key: 'verified', label: 'Verified' },
];

function StatusPill({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}

function UserCard({ user, onAction, busyId }) {
  const emailReady = Boolean(user.emailVerified);
  const phoneReady = Boolean(user.phoneVerified);
  const approved = Boolean(user.adminApproved);
  const relationStatus = user.adminRelationStatus || 'pending';
  const missingCount = [!emailReady, !phoneReady, !approved].filter(Boolean).length;
  const statusTone = missingCount === 0 ? 'green' : missingCount === 1 ? 'amber' : 'red';
  const lastNotice = user.lastAdminEmailTemplate
    ? `${user.lastAdminEmailTemplate}${user.lastAdminEmailReason ? `: ${user.lastAdminEmailReason}` : ''}`
    : '';

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black uppercase text-white">
              {(user.name || user.email || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">{user.name || 'Unnamed user'}</h3>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
        <StatusPill tone={statusTone}>{missingCount === 0 ? 'Fully checked' : `${missingCount} pending`}</StatusPill>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Role</p>
          <p className="mt-1 font-semibold text-slate-900">{user.role}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Trust</p>
          <p className="mt-1 font-semibold text-slate-900">{user.trustScore ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</p>
          <p className={`mt-1 font-semibold ${emailReady ? 'text-emerald-600' : 'text-amber-600'}`}>{emailReady ? 'Verified' : 'Pending'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Phone</p>
          <p className={`mt-1 font-semibold ${phoneReady ? 'text-emerald-600' : 'text-amber-600'}`}>{phoneReady ? 'Verified' : 'Pending'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {emailReady ? <StatusPill tone="green">Email verified</StatusPill> : <StatusPill tone="amber">Email not verified</StatusPill>}
        {phoneReady ? <StatusPill tone="green">Phone verified</StatusPill> : <StatusPill tone="amber">Phone not verified</StatusPill>}
        {approved ? <StatusPill tone="green">Admin approved</StatusPill> : <StatusPill tone="red">Awaiting approval</StatusPill>}
        <StatusPill tone={relationStatus === 'verified' ? 'green' : relationStatus === 'rejected' ? 'red' : 'amber'}>
          Relation {relationStatus}
        </StatusPill>
        <StatusPill tone={user.profileCompleteness >= 80 ? 'green' : user.profileCompleteness >= 50 ? 'amber' : 'red'}>
          Profile {user.profileCompleteness ?? 0}%
        </StatusPill>
      </div>

      {lastNotice ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Last email notice</p>
          <p className="mt-2 font-semibold text-slate-900">{user.lastAdminEmailSubject || 'Stored admin email'}</p>
          <p className="mt-1 leading-7">{lastNotice}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAction('compose', user._id)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#f18f80] hover:text-[#f18f80]"
        >
          <FiMail />
          Email actions
        </button>
        <button
          type="button"
          onClick={() => onAction('recalc', user._id)}
          disabled={busyId === `recalc:${user._id}`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw />
          Recalculate trust
        </button>
        <button
          type="button"
          onClick={() => onAction('verifyEmail', user._id)}
          disabled={busyId === `verifyEmail:${user._id}` || emailReady}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCheckCircle />
          Verify email
        </button>
        <button
          type="button"
          onClick={() => onAction('verifyPhone', user._id)}
          disabled={busyId === `verifyPhone:${user._id}` || phoneReady}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSmartphone />
          Verify phone
        </button>
      </div>

      <button
        type="button"
        onClick={() => onAction('approve', user._id)}
        disabled={busyId === `approve:${user._id}` || approved}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f18f80] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea7c6c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiShield />
        {approved ? 'Already approved' : 'Approve user'}
      </button>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onAction('verifyRelation', user._id)}
          disabled={busyId === `verifyRelation:${user._id}` || relationStatus === 'verified'}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verify relation
        </button>
        <button
          type="button"
          onClick={() => onAction('rejectRelation', user._id)}
          disabled={busyId === `rejectRelation:${user._id}` || relationStatus === 'rejected'}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reject relation
        </button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('pending');
  const [emailReason, setEmailReason] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/users/admin');
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        setNotice(error?.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, user]);

  const stats = useMemo(() => {
    const emailPending = users.filter((u) => !u.emailVerified).length;
    const phonePending = users.filter((u) => !u.phoneVerified).length;
    const unapproved = users.filter((u) => !u.adminApproved).length;
    const verified = users.filter((u) => u.emailVerified && u.phoneVerified && u.adminApproved).length;
    const pendingEmailNotice = users.filter((u) => !u.emailVerified || u.lastAdminEmailTemplate === 'pending').length;
    return {
      total: users.length,
      emailPending,
      phonePending,
      unapproved,
      verified,
      pendingEmailNotice,
    };
  }, [users]);

  const relationChartData = useMemo(
    () => [
      { name: 'Verified', value: users.filter((u) => u.adminRelationStatus === 'verified').length },
      { name: 'Pending', value: users.filter((u) => !u.adminRelationStatus || u.adminRelationStatus === 'pending').length },
      { name: 'Rejected', value: users.filter((u) => u.adminRelationStatus === 'rejected').length },
    ],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((entry) => {
      const matchesSearch = !q || [entry.name, entry.email, entry.role].some((field) => String(field || '').toLowerCase().includes(q));
      const matchesFilter =
        filter === 'all' ||
        (filter === 'needs_attention' && (!entry.emailVerified || !entry.phoneVerified || !entry.adminApproved)) ||
        (filter === 'email_pending' && !entry.emailVerified) ||
        (filter === 'phone_pending' && !entry.phoneVerified) ||
        (filter === 'unapproved' && !entry.adminApproved) ||
        (filter === 'verified' && entry.emailVerified && entry.phoneVerified && entry.adminApproved);
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, users]);

  const runAction = async (action, userId) => {
    const key = `${action}:${userId}`;
    setBusyId(key);
    setNotice('');

    try {
      if (action === 'compose') {
        setSelectedUserId(userId);
        setNotice('Choose an email template below and send it from the composer.');
        return;
      }

      if (action === 'sendEmail') {
        const { data } = await api.post(`/api/trust/admin/email/send/${userId}`, {
          template: emailTemplate,
          reason: emailReason,
        });
        setNotice(`Email stored for ${data?.user?.email || 'user'}: ${data?.subject}`);
      }

      if (action === 'verifyEmail') {
        await api.patch(`/api/trust/admin/email/verify/${userId}`);
        setNotice('Email marked as verified.');
      }

      if (action === 'verifyPhone') {
        await api.patch(`/api/trust/admin/phone/verify/${userId}`);
        setNotice('Phone marked as verified.');
      }

      if (action === 'approve') {
        await api.patch(`/api/trust/admin/approve/${userId}`);
        setNotice('User approved by admin.');
      }

      if (action === 'verifyRelation') {
        await api.patch(`/api/trust/admin/relation/${userId}`, { status: 'verified', note: 'Verified through admin relation review' });
        setNotice('Admin relation verified.');
      }

      if (action === 'rejectRelation') {
        await api.patch(`/api/trust/admin/relation/${userId}`, { status: 'rejected', note: 'Relation rejected during admin review' });
        setNotice('Admin relation rejected.');
      }

      if (action === 'recalc') {
        await api.patch('/api/trust/admin/metrics', { userId });
        setNotice('Trust score recalculated.');
      }

      const { data } = await api.get('/api/users/admin');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice(error?.response?.data?.message || 'Action failed');
    } finally {
      setBusyId('');
    }
  };

  const selectedUser = useMemo(() => users.find((entry) => entry._id === selectedUserId) || null, [selectedUserId, users]);

  if (!user || user.role !== 'admin') return null;

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin control center"
      title="Manage users, verifications, and trust in one place"
      subtitle="A responsive dashboard for checking who is verified, who still needs confirmation, and which users need approval or a trust recalculation."
      ctaLabel="Refresh users"
      ctaTo="/dashboard/admin/users"
      navItems={adminNavItems}
      searchPlaceholder="Search name, email, or role"
      aside={
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total users', value: stats.total, tone: 'slate' },
            { label: 'Email pending', value: stats.emailPending, tone: 'amber' },
            { label: 'Phone pending', value: stats.phonePending, tone: 'amber' },
            { label: 'Fully verified', value: stats.verified, tone: 'green' },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className={`mt-2 text-3xl font-black ${item.tone === 'green' ? 'text-emerald-600' : item.tone === 'amber' ? 'text-amber-600' : 'text-slate-900'}`}>
                {item.value}
              </p>
            </div>
          ))}
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Verification notifications</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Emails needing action</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{stats.pendingEmailNotice}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pending approvals</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{stats.unapproved}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Verified users</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{stats.verified}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Verified relations</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{users.filter((u) => u.adminRelationStatus === 'verified').length}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Relationship breakdown</p>
                <div className="mt-3 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={relationChartData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84} paddingAngle={4}>
                        {relationChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">How to use this</p>
                <p className="mt-3 leading-7">Use the chart to quickly spot who still needs relationship verification, who is approved, and where to send the next email template. This helps the admin manage trust without leaving the dashboard.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Verified', tone: 'green' },
                    { label: 'Pending', tone: 'amber' },
                    { label: 'Rejected', tone: 'red' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white p-3">
                      <p className={`text-sm font-semibold ${item.tone === 'green' ? 'text-emerald-600' : item.tone === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quick sidebar</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">Status categories</h3>
          </div>

          <div className="space-y-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  filter === option.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{option.label}</span>
                <span className="text-xs opacity-70">{option.key === 'all' ? users.length : 'Filter'}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setSearch('');
              setNotice('Filters cleared.');
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#f18f80] hover:text-[#f18f80]"
          >
            <FiX />
            Clear all filters
          </button>

          <div className="rounded-[24px] bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Need email?</p>
            <p className="mt-2 text-sm text-slate-600">Select a user card to open the email composer. You can send verified, rejection, or pending-query messages.</p>
          </div>
        </aside>

        <div className="space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</div>
        ) : null}

          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="slate">All categories</StatusPill>
              <StatusPill tone="green">Verified</StatusPill>
              <StatusPill tone="amber">Not verified</StatusPill>
              <StatusPill tone="red">Pending review</StatusPill>
            </div>

            <label className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm lg:w-[320px]">
              <FiUsers className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Email composer</h3>
                <p className="text-sm text-slate-500">Send verified, rejection, or pending-query emails from one clear control panel.</p>
              </div>
              {selectedUser ? <StatusPill tone="blue">Selected: {selectedUser.email}</StatusPill> : <StatusPill tone="amber">No user selected</StatusPill>}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Choose template</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { key: 'verified', label: 'Verified', tone: 'green' },
                    { key: 'rejected', label: 'Rejection', tone: 'red' },
                    { key: 'pending', label: 'Pending query', tone: 'amber' },
                    { key: 'notification', label: 'Verification notice', tone: 'blue' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setEmailTemplate(item.key)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        emailTemplate === item.key
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Reason or note</span>
                  <textarea
                    value={emailReason}
                    onChange={(event) => setEmailReason(event.target.value)}
                    rows={4}
                    placeholder="Add a short reason, e.g. pending queries, missing documents, or approval note."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f18f80] focus:bg-white"
                  />
                </label>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">{emailTemplate === 'verified' ? 'Account verified' : emailTemplate === 'rejected' ? 'Rejection notice' : 'Pending query notice'}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {emailTemplate === 'verified' && 'Use this when the user has completed verification and is approved to continue.'}
                  {emailTemplate === 'rejected' && 'Use this when the account cannot be approved or needs corrections before review.'}
                  {emailTemplate === 'pending' && 'Use this to request missing information or explain why the account is not verified yet.'}
                  {emailTemplate === 'notification' && 'Use this to notify the user that their verification is still pending review.'}
                </p>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Current selected user</p>
                  <p className="mt-2 font-semibold text-slate-900">{selectedUser?.name || selectedUser?.email || 'Pick a user card first'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => selectedUser && runAction('sendEmail', selectedUser._id)}
                  disabled={!selectedUser || busyId === `sendEmail:${selectedUser?._id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f18f80] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea7c6c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSend />
                  Send email template
                </button>
              </div>
            </div>
          </div>

        <div id="needs-attention" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">User cards</h3>
              <p className="text-sm text-slate-500">See missing confirmations, trust score, and manage each account fast.</p>
            </div>
            <StatusPill tone="blue">{filteredUsers.length} shown</StatusPill>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[320px] animate-pulse rounded-[28px] bg-slate-100" />
              ))}
            </div>
          ) : filteredUsers.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((entry) => (
                <UserCard key={entry._id} user={entry} onAction={runAction} busyId={busyId} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No users match the current filter.
            </div>
          )}
        </div>

        <div id="verified" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Verification overview</h3>
              <p className="text-sm text-slate-500">Quick status snapshot for email, phone, profile, and approval.</p>
            </div>
            <StatusPill tone="green">Trust workflow</StatusPill>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Email verification', value: `${stats.total - stats.emailPending}/${stats.total}`, note: 'Confirmed emails', tone: 'green' },
              { title: 'Phone verification', value: `${stats.total - stats.phonePending}/${stats.total}`, note: 'Confirmed phones', tone: 'green' },
              { title: 'Admin approval', value: `${stats.total - stats.unapproved}/${stats.total}`, note: 'Approved users', tone: 'blue' },
              { title: 'Needs attention', value: stats.unapproved + stats.emailPending + stats.phonePending > 0 ? 'Yes' : 'No', note: 'Pending work', tone: stats.unapproved + stats.emailPending + stats.phonePending > 0 ? 'amber' : 'green' },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.title}</p>
                <p className={`mt-3 text-3xl font-black ${item.tone === 'green' ? 'text-emerald-600' : item.tone === 'amber' ? 'text-amber-600' : 'text-blue-600'}`}>{item.value}</p>
                <p className="mt-2 text-sm text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </DashboardShell>
  );
}