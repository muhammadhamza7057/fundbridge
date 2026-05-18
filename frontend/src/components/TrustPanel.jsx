import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TrustPanel() {
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [busy, setBusy] = useState(false);

  const loadTrust = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/trust/me');
      setTrust(data.trust || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load trust summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrust();
  }, []);

  const flash = (nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 5000);
  };

  const handleRequestEmail = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/trust/me/email/request');
      flash(`Email code generated for testing: ${data.devCode}`);
      await loadTrust();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request email verification');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (!emailCode.trim()) {
      setError('Enter the email code first');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post('/api/trust/me/email/confirm', { code: emailCode.trim() });
      setEmailCode('');
      flash('Email verified successfully');
      await loadTrust();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to confirm email verification');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestPhone = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/trust/me/phone/request');
      flash(`Phone code generated for testing: ${data.devCode}`);
      await loadTrust();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request phone verification');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmPhone = async () => {
    if (!phoneCode.trim()) {
      setError('Enter the phone code first');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post('/api/trust/me/phone/confirm', { code: phoneCode.trim() });
      setPhoneCode('');
      flash('Phone verified successfully');
      await loadTrust();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to confirm phone verification');
    } finally {
      setBusy(false);
    }
  };

  const handleRecalculate = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/trust/me/recalculate');
      flash(`Trust recalculated: ${data.trustScore}`);
      await loadTrust();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to recalculate trust');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6f1e6_100%)] p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a0a04f]">Trust system</p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-900">Trust System</h2>
          <p className="mt-1 text-sm text-slate-500">Test email, phone, profile, and score signals from one place.</p>
        </div>
        <button type="button" onClick={handleRecalculate} disabled={busy} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
          Recalculate
        </button>
      </div>

      {loading ? (
        <div className="mt-5 text-sm text-slate-500">Loading trust summary...</div>
      ) : error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {message ? <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}

      {trust ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Trust score</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{trust.trustScore}</p>
            <p className="mt-1 text-sm text-slate-600">Profile + verification + activity + reviews</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Profile completeness</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{trust.profileCompleteness}%</p>
            <p className="mt-1 text-sm text-slate-600">Keep name, avatar, phone, and role filled</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Email: {trust.emailVerified ? 'Verified' : 'Pending'}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Phone: {trust.phoneVerified ? 'Verified' : 'Pending'}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Admin: {trust.adminApproved ? 'Approved' : 'Waiting'}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Relation: {trust.adminRelationStatus || 'pending'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Score breakdown</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Profile', value: `${trust.breakdown?.profile ?? 0}`, tone: 'slate' },
                { label: 'Email', value: `${trust.breakdown?.email ?? 0}`, tone: trust.emailVerified ? 'green' : 'amber' },
                { label: 'Phone', value: `${trust.breakdown?.phone ?? 0}`, tone: trust.phoneVerified ? 'green' : 'amber' },
                { label: 'Admin', value: `${trust.breakdown?.admin ?? 0}`, tone: trust.adminApproved ? 'green' : 'amber' },
                { label: 'Relation', value: `${trust.breakdown?.relation ?? 0}`, tone: trust.adminRelationStatus === 'verified' ? 'green' : 'amber' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-[#f7f2e7] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                  <p className={`mt-2 text-2xl font-black ${item.tone === 'green' ? 'text-emerald-600' : item.tone === 'amber' ? 'text-amber-600' : 'text-slate-900'}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Your score rises when profile fields are complete, email and phone are verified, the admin relation is verified, and admin approval is granted. It can also move with activity and reviews.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Email verification</h3>
              <p className="mt-1 text-sm text-slate-600">Generate a dev code, then paste it here to confirm.</p>
            </div>
            <button type="button" onClick={handleRequestEmail} disabled={busy} className="rounded-full border border-slate-300 bg-[#faf7ef] px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60">
              Get code
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <input value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="Enter email code" className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm" />
            <button type="button" onClick={handleConfirmEmail} disabled={busy} className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
              Confirm
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Phone verification</h3>
              <p className="mt-1 text-sm text-slate-600">Generate a dev code, then paste it here to confirm.</p>
            </div>
            <button type="button" onClick={handleRequestPhone} disabled={busy} className="rounded-full border border-slate-300 bg-[#faf7ef] px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60">
              Get code
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder="Enter phone code" className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm" />
            <button type="button" onClick={handleConfirmPhone} disabled={busy} className="rounded bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
              Confirm
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-900">How trust score is calculated</p>
        <p className="mt-2">Profile completeness contributes the most. Email verification, phone verification, admin approval, activity, and reviews all add to the score on the backend.</p>
      </div>
    </section>
  );
}
