import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="mt-4 text-4xl font-black text-slate-900">
            {user?.name ? `Welcome, ${user.name}` : 'Welcome to FundBridge'}
          </h1>
          <p className="mt-3 text-slate-600">
            This is the redirect target after login or registration.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900">
              Back to landing
            </Link>
            <button onClick={logout} className="rounded-full bg-[#d8e75f] px-5 py-3 text-sm font-semibold text-slate-900">
              Logout
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}