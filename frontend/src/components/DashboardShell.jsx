import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiBell, FiChevronRight, FiLogOut, FiMenu, FiSearch, FiX, FiUser } from 'react-icons/fi';
import logo from '../../assets/logo.png';
import { useAuth } from '../context/AuthContext';

function SidebarLink({ to, label, icon: Icon, active = false, onClick }) {
  const baseClass = `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    active ? 'bg-[var(--brand)] text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.22)]' : 'text-white/75 hover:bg-white/8 hover:text-white'
  }`;
  const iconClass = `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
    active ? 'bg-[#e7ef94] text-slate-950' : 'bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white'
  }`;

  if (to.startsWith('#')) {
    return (
      <a href={to} onClick={onClick} className={baseClass}>
        <span className={iconClass}>{Icon ? <Icon className="text-lg" /> : '•'}</span>
        <span className="flex-1">{label}</span>
      </a>
    );
  }

  return (
    <Link to={to} onClick={onClick} className={baseClass}>
      <span className={iconClass}>{Icon ? <Icon className="text-lg" /> : '•'}</span>
      <span className="flex-1">{label}</span>
      {active ? <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-slate-950">Active</span> : <FiChevronRight className="text-white/35" />}
    </Link>
  );
}

export default function DashboardShell({
  eyebrow,
  title,
  subtitle,
  children,
  aside,
  role,
  navItems = [],
  ctaLabel = 'Add Profile',
  ctaTo = '/',
  searchPlaceholder = 'Search for people, jobs, and more',
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const pathname = location.pathname.replace(/\/$/, '') || '/';

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

  const groupedNavItems = useMemo(() => {
    const groups = { main: [], workspace: [], bottom: [] };
    navItems.forEach((item) => {
      const group = item.group || 'workspace';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });
    return groups;
  }, [navItems]);

  const isActive = (item) => pathname === item.to || (item.to !== '/' && pathname.startsWith(`${item.to}/`));

  const renderGroup = (items, titleText) => {
    if (!items.length) return null;

    return (
      <div className="space-y-3">
        {titleText ? <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/35">{titleText}</p> : null}
        <div className="space-y-2">
          {items.map((item) => (
            <SidebarLink
              key={item.label}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActive(item)}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(199,219,79,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(246,176,166,0.12),transparent_24%),linear-gradient(180deg,#f5f1e8_0%,#efe8db_100%)] text-slate-900 lg:flex">
      {menuOpen ? <button type="button" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close sidebar" /> : null}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[300px] flex-col border-r border-white/10 bg-[#2d2d2d] text-white shadow-[18px_0_50px_rgba(15,23,42,0.18)] lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/45">FundBridge</p>
            <p className="mt-1 text-lg font-black tracking-tight text-white">Workspace</p>
          </div>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {renderGroup(groupedNavItems.main, 'Main')}
          {renderGroup(groupedNavItems.workspace, 'Workspace')}
        </div>

        <div className="border-t border-white/10 px-4 py-6">
          {renderGroup(groupedNavItems.bottom, 'Support')}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-white/60 bg-white/85 px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl md:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:-translate-y-0.5 lg:hidden"
                aria-expanded={menuOpen}
                aria-label="Toggle dashboard menu"
              >
                {menuOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
              </button>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Home &nbsp;›&nbsp; Dashboard</p>
                <h1 className="mt-1 truncate text-xl font-extrabold text-slate-900 md:text-2xl">{role} workspace</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm md:flex md:w-[360px] lg:w-[420px]">
                <FiSearch className="text-slate-400" />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5">
                <FiBell />
              </button>
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#15172d] text-sm font-black uppercase text-white">
                    {userInitial}
                  </div>
                  <div className="hidden min-w-0 md:block">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Account'}</p>
                    <p className="truncate text-xs text-slate-500">{role}</p>
                  </div>
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user?.name || 'Account'}</p>
                      <p className="text-xs text-slate-500">{user?.email || role}</p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 font-semibold text-slate-700"><FiUser /> Profile score</span>
                        <span className="font-semibold text-slate-900">{user?.profileCompleteness ?? 0}%</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span>Trust score</span>
                        <span className="font-semibold text-slate-900">{user?.trustScore ?? 0}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span>Verified</span>
                        <span className="font-semibold text-slate-900">{user?.emailVerified ? 'Email' : 'Email pending'}</span>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <FiUser className="text-lg" />
                      Profile summary
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FiLogOut className="text-lg" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-[1520px]">
            <div className="rounded-[30px] border border-slate-200 bg-white/92 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-5 md:rounded-[34px] md:p-8">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">{eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-5xl">{title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 md:text-[15px]">{subtitle}</p>
                </div>
                <Link to={ctaTo} className="inline-flex w-full items-center justify-center rounded-full border border-[#f6b0a6] bg-[#f6b0a6] px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(246,176,166,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ef9e92] sm:w-auto">
                  {ctaLabel} <span className="ml-2">+</span>
                </Link>
              </div>

              {aside ? <div className="mb-6 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6f1e6_100%)] p-5 md:p-6">{aside}</div> : null}

              <div>{children}</div>
            </div>

            {menuOpen ? (
              <div className="fixed inset-0 z-50 lg:hidden">
                <button type="button" className="absolute inset-0 bg-slate-950/35" onClick={() => setMenuOpen(false)} aria-label="Close sidebar" />
                <div className="absolute inset-y-0 left-0 w-[300px] max-w-[88vw] flex flex-col bg-[#2c2c2c] text-white shadow-[20px_0_40px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/45">FundBridge</p>
                        <p className="text-sm font-semibold text-white">{role} menu</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                      <FiX />
                    </button>
                  </div>

                  <div className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
                    {renderGroup(groupedNavItems.main, 'Main')}
                    {renderGroup(groupedNavItems.workspace, 'Workspace')}
                  </div>

                  <div className="border-t border-white/10 px-4 py-6">
                    {renderGroup(groupedNavItems.bottom, 'Support')}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </section>
  );
}
