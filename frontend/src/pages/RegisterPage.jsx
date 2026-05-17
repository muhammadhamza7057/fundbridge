import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, updateUser, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ username: '', firstName: '', lastName: '', name: '', email: '', password: '', confirmPassword: '', role: '', phone: '', agreePrivacy: false, agreeTerms: false });
  const [error, setError] = useState('');
  const [tab, setTab] = useState('register');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (!form.agreePrivacy || !form.agreeTerms) {
        setError('You must agree to the Privacy Policy and Terms and Conditions');
        return;
      }
      if (!form.role) {
        setError('Please select a role');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const payload = { ...form };
      // keep legacy `name` field as full name for backend compatibility
      payload.name = form.name || `${form.firstName || ''} ${form.lastName || ''}`.trim();
      const data = await register(payload);
      updateUser({ ...data.user, role: form.role });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Layout>
      <main>
        <section className="bg-[#f7f7f7] px-5 py-14 md:px-12 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <h1 className="text-4xl font-normal text-slate-800 md:text-5xl">Register to FundBridge</h1>
              <p className="text-sm text-slate-400">Investor Founder Discovery Platform  &nbsp;›&nbsp;  Register to FundBridge</p>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto max-w-3xl">
              <div className="flex gap-8 border-b border-slate-200 text-[15px] font-medium">
                <Link to="/login" className="pb-4 text-slate-500">Log In</Link>
                <button onClick={() => setTab('register')} className={`pb-4 ${tab === 'register' ? 'border-b-2 border-[#f18f80] text-[#f18f80]' : 'text-slate-500'}`}>
                  Register
                </button>
              </div>

              <form onSubmit={submit} className="mt-14 max-w-[620px] space-y-6">
                <div className="grid gap-5">
                  <Input label="Username" id="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Username" required />
                  <Input label="Email Address" id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email Address" required />
                  <Input label="Password" id="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required />
                  <Input label="Confirm Password" id="confirmPassword" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Confirm Password" required />
                  <Input label="First Name" id="firstName" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="First Name" />
                  <Input label="Last Name" id="lastName" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Last Name" />
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">I am registering as…</span>
                    <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none">
                      <option value="" disabled>Choose a role</option>
                      <option value="investor">Investor</option>
                      <option value="founder">Founder</option>
                      <option value="startup_rep">Startup Representative</option>
                      <option value="guest">Guest</option>
                    </select>
                  </label>
                  <Input label="Phone" id="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone" />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="inline-flex items-center gap-3">
                    <input type="checkbox" checked={form.agreePrivacy} onChange={(e) => setForm({ ...form, agreePrivacy: e.target.checked })} />
                    <span className="text-sm">I agree to the <a href="#" className="text-[#f18f80]">Privacy Policy</a></span>
                  </label>
                  <label className="inline-flex items-center gap-3">
                    <input type="checkbox" checked={form.agreeTerms} onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })} />
                    <span className="text-sm">I agree to the <a href="#" className="text-[#f18f80]">Terms and Conditions</a></span>
                  </label>
                </div>

                {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

                <div className="flex items-center gap-4">
                  <button type="button" onClick={async () => {
                    setError('');
                    if (!form.role) {
                      setError('Please select a role before continuing with Google');
                      return;
                    }
                    if (!form.agreePrivacy || !form.agreeTerms) {
                      setError('You must agree to the Privacy Policy and Terms and Conditions');
                      return;
                    }
                    try {
                      const googlePayload = {
                        ...form,
                        name: form.name || `${form.firstName || ''} ${form.lastName || ''}`.trim(),
                      };
                      const gdata = await signInWithGoogle(googlePayload);
                      const role = gdata?.data?.user?.role || gdata?.user?.role || form.role;
                      if (role === 'admin') {
                        navigate('/dashboard/admin/users', { replace: true });
                      } else {
                        navigate('/dashboard', { replace: true });
                      }
                    } catch (e) {
                      setError(e?.response?.data?.error || e?.response?.data?.message || 'Google sign-in failed');
                    }
                  }} className="inline-flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.6 12.227c0-.74-.066-1.451-.19-2.14H12v4.047h5.43c-.234 1.263-.94 2.335-2.005 3.049v2.54h3.24c1.896-1.743 2.93-4.318 2.93-7.496z" fill="#4285F4"/>
                      <path d="M12 22c2.7 0 4.97-.896 6.63-2.428l-3.24-2.54c-.9.605-2.048.966-3.39.966-2.606 0-4.816-1.76-5.606-4.128H3.02v2.59C4.68 19.978 8.04 22 12 22z" fill="#34A853"/>
                      <path d="M6.394 13.87A6.997 6.997 0 0 1 6 12c0-.68.096-1.338.274-1.957V7.454H3.02A9.998 9.998 0 0 0 2 12c0 1.63.37 3.174 1.02 4.546l3.374-2.676z" fill="#FBBC05"/>
                      <path d="M12 6.5c1.47 0 2.8.506 3.844 1.497l2.877-2.877C16.965 3.196 14.694 2.5 12 2.5 8.04 2.5 4.68 4.522 3.02 7.01l3.374 2.59C7.184 8.26 9.394 6.5 12 6.5z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <Button type="submit" className="min-w-40 bg-[#f18f80] px-10 py-4 text-base text-white hover:bg-[#ef7f6d]" disabled={loading || !form.agreePrivacy || !form.agreeTerms}>
                    {loading ? 'Creating account...' : 'Register'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}