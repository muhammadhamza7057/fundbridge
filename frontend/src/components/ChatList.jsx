import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUsers } from '../services/usersService';
import { getOrCreateChat, getUnreadMap } from '../services/chatService';
import { useSocketContext } from '../context/SocketContext';

export default function ChatList({ role, onOpenChat }) {
  const [users, setUsers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unread, setUnread] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const targetRole = showAll ? undefined : role === 'founder' ? 'investor' : 'founder';
        const [data, map] = await Promise.all([
          listUsers(targetRole),
          getUnreadMap().catch(() => ({})),
        ]);
        if (!mounted) return;
        setUsers(data || []);
        setUnread(map || {});
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [role, showAll]);

  const { unreadMap: globalUnreadMap, markChatReadForUser } = useSocketContext();

  if (loading) return <div className="p-4 text-sm text-slate-500">Loading users...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Showing: {showAll ? 'All users' : role === 'founder' ? 'Investors' : 'Founders'}</div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          <span>Show all</span>
        </label>
      </div>
      {users.length === 0 ? (
        <div className="p-4 text-sm text-slate-500">No users found.</div>
      ) : (
        users.map((u) => (
          <div
            key={u._id}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:shadow"
            onClick={async () => {
              try {
                const chat = await getOrCreateChat(u._id);
                if (onOpenChat) onOpenChat(chat._id);
                else navigate(`?chatId=${chat._id}`);
              } catch (err) {
                console.error('Failed to open chat', err);
              }
            }}
          >
            <div className="flex items-center gap-3">
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#15172d] text-sm font-black uppercase text-white">{u.name?.charAt(0)?.toUpperCase()}</div>
              )}
              <div>
                <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                <div className="text-xs text-slate-500">{u.role === 'investor' ? 'Investor' : u.role === 'founder' ? 'Founder' : u.role === 'startup_rep' ? 'Startup Representative' : 'Guest'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {((unread && unread[u._id]) || (globalUnreadMap && globalUnreadMap[u._id])) > 0 && (
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">{(unread && unread[u._id]) || (globalUnreadMap && globalUnreadMap[u._id])}</div>
              )}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const chat = await getOrCreateChat(u._id);
                    // clear unread for this user locally
                    markChatReadForUser(u._id);
                    if (onOpenChat) onOpenChat(chat._id);
                    else navigate(`?chatId=${chat._id}`);
                  } catch (err) {
                    console.error('Failed to open chat', err);
                  }
                }}
                className="rounded-full bg-[#f18f80] px-3 py-2 text-sm font-semibold text-white"
              >
                Chat
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
