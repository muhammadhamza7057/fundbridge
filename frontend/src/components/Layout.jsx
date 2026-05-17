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
      <header className="border-b border-[var(--border)] bg-[var(--hero)] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-12">
          <Link to="/" className="flex items-center gap-3 text-white">
            <img src={logo} alt={`${projectName} logo`} className="h-9 w-auto" />
            <span className="text-2xl font-black tracking-tight">{projectName}</span>
          </Link>
          <nav className="hidden lg:block">
            <div className="flex items-center gap-8 rounded-full bg-white px-10 py-4 text-[15px] font-semibold text-slate-900 shadow-sm">
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
                <Link to={dashboardPath} className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-slate-900">
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="text-sm font-medium text-white/90 hover:text-white">
                  Logout
                </button>
              </>
            ) : (
              !isDashboardRoute ? (
                <Link to="/register" className="text-sm font-medium text-white/90 hover:text-white">
                  Get Started
                </Link>
              ) : null
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-[var(--hero)] px-5 py-12 text-white md:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} alt={`${projectName} logo`} className="h-9 w-auto" />
              <span className="text-2xl font-black tracking-tight">{projectName}</span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-7 text-white/75">
              The {projectName} is a curated repository of startups, investors, and founders, where verified profiles of innovative startups, their founders, and keen investors are actively maintained.
            </p>
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold">Explore the Network</h3>
            <ul className="space-y-5 text-sm text-white/75">
              <li>Investors Directory</li>
              <li>Startups Directory</li>
              <li>Founders Directory</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold">Get Involved</h3>
            <ul className="space-y-5 text-sm text-white/75">
              <li>Join as Investor</li>
              <li>Join as Startup</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold">Resources</h3>
            <ul className="space-y-5 text-sm text-white/75">
              <li><Link to="/knowledge">Knowledge Hub</Link></li>
              <li>Blogs</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold">About Us</h3>
            <a href="https://hamza.engineer" target="_blank" rel="noreferrer" className="text-sm text-white/75 hover:text-white">
              About Us
            </a>
            <p className="mt-4 text-sm text-white/75">Contact:<br />hamzashinwari002@gmail.com</p>
            <p className="mt-6 text-sm font-semibold">Subscribe to our Newsletter</p>
            <div className="mt-3 flex gap-2">
              <input className="w-full rounded-sm px-3 py-2 text-sm text-slate-900 outline-none" placeholder="Your email" />
              <button className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1440px] flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
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
      </footer>
    </div>
  );
}