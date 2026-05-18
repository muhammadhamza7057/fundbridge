import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const projectName = 'FundBridge';
  const location = useLocation();
  const { user, logout } = useAuth();
  const dashboardPath = user?.role === 'investor' ? '/dashboard/investor' : '/dashboard/founder';
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-black/5 bg-white/90 text-[var(--text)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-12">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="text-3xl font-black tracking-tight leading-none md:text-4xl">
              <span className="text-[var(--text)]">Fund</span>
              <span className="ml-1 text-[var(--brand)]">Bridge</span>
            </span>
          </Link>
          <nav className="hidden lg:block">
            <div className="flex items-center gap-6 rounded-full border border-black/5 bg-white px-8 py-3 text-[15px] font-semibold text-[var(--text)] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <Link to="/">Home</Link>
              <Link to="/startups">Startups</Link>
              <Link to="/investors">Investors</Link>
              <Link to="/knowledge">Knowledge Hub</Link>
              {user ? <Link to={dashboardPath}>Dashboard</Link> : null}
            </div>
          </nav>
          <div className="flex items-center gap-3">
            {!isDashboardRoute && user ? (
              <>
                <Link to={dashboardPath} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[var(--text)] shadow-sm">
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]">
                  Logout
                </button>
              </>
            ) : (
              !isDashboardRoute ? (
                <Link to="/register" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]">
                  Get Started
                </Link>
              ) : null
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-[var(--hero)] px-5 py-12 text-white md:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 md:grid-cols-5 items-start">
            <div className="md:col-span-2 text-left">
              <div className="flex items-start gap-2">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight leading-none">
                  <span className="text-white">Fund</span>
                  <span className="ml-1 text-[#d8e75f]">Bridge</span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70 max-w-[400px]">
                The {projectName} is a curated repository of startups, investors, and founders — verified profiles of innovative teams and the investors who back them.
              </p>
            </div>
            <div className="text-left">
              <h3 className="mb-3 text-base font-semibold text-white">Explore the Network</h3>
              <ul className="list-none p-0 text-sm text-white/70">
                <li className="mb-2">Investors Directory</li>
                <li className="mb-2">Startups Directory</li>
                <li className="mb-2">Founders Directory</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="mb-3 text-base font-semibold text-white">Get Involved</h3>
              <ul className="list-none p-0 text-sm text-white/70">
                <li className="mb-2">Join as Investor</li>
                <li className="mb-2">Join as Startup</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="mb-3 text-base font-semibold text-white">Resources</h3>
              <ul className="list-none p-0 text-sm text-white/70">
                <li className="mb-2"><Link to="/knowledge" className="hover:underline">Knowledge Hub</Link></li>
                <li className="mb-2">Blogs</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="mb-3 text-base font-semibold text-white">About Us</h3>
              <a href="https://hamza.engineer" target="_blank" rel="noreferrer" className="text-sm text-white/75 hover:text-white block">
                About Us
              </a>
              <p className="mt-2 text-sm text-white/75">Contact:<br />hamzashinwari002@gmail.com</p>
              <p className="mt-3 text-sm font-semibold">Subscribe</p>
              <div className="mt-3 flex gap-2">
                <input className="flex-1 rounded-sm px-3 py-2 text-sm text-slate-900 outline-none" placeholder="Your email" />
                <button className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-10 flex max-w-[1440px] items-center justify-between border-t border-white/10 pt-6 text-sm text-white/70">
            <div className="flex gap-8">
              <span>Terms & Conditions</span>
              <span>Privacy Policy</span>
            </div>
            <span>Copyright ©2026</span>
            <div className="flex gap-4">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}