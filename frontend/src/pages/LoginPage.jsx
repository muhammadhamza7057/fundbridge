import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, updateUser, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [tab, setTab] = useState('login');

  useEffect(() => {
    if (!loading && user?.role) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin/users', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, navigate, user]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login(form.email, form.password);
      updateUser({ ...data.user, role: data.user?.role || form.role });
      if (data?.user?.role === 'admin') {
        navigate('/dashboard/admin/users', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Layout>
      <main>
        <section className="bg-[#f7f7f7] px-5 py-14 md:px-12 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <h1 className="text-4xl font-semibold text-slate-800 md:text-5xl">Sign In to FundBridge</h1>
              <p className="text-sm text-slate-400">Investor Founder Discovery Platform  &nbsp;›&nbsp;  Sign In to FundBridge</p>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto max-w-3xl">
              <div className="flex gap-8 border-b border-slate-200 text-[15px] font-medium">
                <button onClick={() => setTab('login')} className={`pb-4 ${tab === 'login' ? 'border-b-2 border-[#f18f80] text-[#f18f80]' : 'text-slate-500'}`}>
                  Log In
                </button>
                <Link to="/register" className="pb-4 text-slate-500">
                  Register
                </Link>
              </div>

              <form onSubmit={submit} className="mt-14 max-w-[620px] space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="grid gap-5">
                  <Input label="Username/Email" id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Username/Email" required />
                  <Input label="Password" id="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required />
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Role</span>
                    <span className="text-xs text-slate-400">Select the role for this login. Admin users will be sent to the admin dashboard.</span>
                    <select
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value })}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-700 outline-none transition focus:border-[#f18f80] focus:ring-2 focus:ring-[#f18f80]/20"
                    >
                      <option value="" disabled>Choose a role</option>
                      <option value="founder">Founder</option>
                      <option value="investor">Investor</option>
                      <option value="startup_rep">Startup Representative</option>
                      <option value="guest">Guest</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <button type="button" className="hover:text-[#f18f80]">Lost Your Password?</button>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                    Remember Me
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button type="button" onClick={async () => {
                    setError('');
                    try {
                      const googlePayload = form.role ? { role: form.role } : {};
                      const gdata = await signInWithGoogle(googlePayload);
                      if (gdata?.redirected) {
                        return;
                      }
                      const role = gdata?.data?.user?.role || gdata?.user?.role;
                      if (role === 'admin') {
                        navigate('/dashboard/admin/users', { replace: true });
                      } else {
                        navigate('/dashboard', { replace: true });
                      }
                    } catch (e) {
                      const backendMessage = e?.response?.data?.message || '';
                      if (/select a role|role before continuing/i.test(backendMessage)) {
                        setError('Your Google account is not linked to a FundBridge role yet. Please register once or choose a role and try again.');
                        return;
                      }
                      setError(e?.response?.data?.error || backendMessage || 'Google sign-in failed');
                    }
                  }} className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.6 12.227c0-.74-.066-1.451-.19-2.14H12v4.047h5.43c-.234 1.263-.94 2.335-2.005 3.049v2.54h3.24c1.896-1.743 2.93-4.318 2.93-7.496z" fill="#4285F4"/>
                      <path d="M12 22c2.7 0 4.97-.896 6.63-2.428l-3.24-2.54c-.9.605-2.048.966-3.39.966-2.606 0-4.816-1.76-5.606-4.128H3.02v2.59C4.68 19.978 8.04 22 12 22z" fill="#34A853"/>
                      <path d="M6.394 13.87A6.997 6.997 0 0 1 6 12c0-.68.096-1.338.274-1.957V7.454H3.02A9.998 9.998 0 0 0 2 12c0 1.63.37 3.174 1.02 4.546l3.374-2.676z" fill="#FBBC05"/>
                      <path d="M12 6.5c1.47 0 2.8.506 3.844 1.497l2.877-2.877C16.965 3.196 14.694 2.5 12 2.5 8.04 2.5 4.68 4.522 3.02 7.01l3.374 2.59C7.184 8.26 9.394 6.5 12 6.5z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </button>
                  <Button type="submit" className="w-full min-w-40 bg-[#f18f80] px-10 py-4 text-base text-white hover:bg-[#ef7f6d] sm:w-auto" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  <label className="flex items-center gap-2 text-sm text-slate-600 md:hidden">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                    Remember Me
                  </label>
                </div>
                {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
              </form>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}