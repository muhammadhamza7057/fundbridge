import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { useChat } from '../hooks/useChat';
import { getChat } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { uploadAttachment } from '../services/chatService';

export default function ChatWindow({ chatId, title }) {
  const { user } = useAuth();
  const { messages, participants, typingUsers, sendMessage, startTyping, stopTyping, isConnected, loading } = useChat(chatId);
  const [initialMessages, setInitialMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxAttachment, setLightboxAttachment] = useState(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, initialMessages]);

  // Fetch chat via API as a fallback to show history immediately
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!chatId) return;
      try {
        const data = await getChat(chatId);
        if (!mounted) return;
        setInitialMessages(data.messages || []);
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [chatId]);

  const { setCurrentOpenChatId, markChatReadForUser } = useSocketContext();

  // When chat opens, set currentOpenChatId and mark as read locally for the other user
  useEffect(() => {
    if (!chatId) return;
    setCurrentOpenChatId(chatId);
    try {
      const currentId = user?.uid || user?._id || user?.id;
      const other = participants?.length ? participants.find((p) => String(p._id) !== String(currentId)) : null;
      if (other) markChatReadForUser(other._id);
    } catch (e) {
      // ignore
    }
    return () => setCurrentOpenChatId(null);
  }, [chatId, participants]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;

    sendMessage(inputValue);
    setInputValue('');
    setIsTyping(false);
    stopTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex h-[min(78vh,760px)] flex-col overflow-hidden rounded-[30px] border border-emerald-100 bg-[#efeae2] shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-emerald-900/10 bg-[#075e54] px-5 py-4 text-white md:px-6">
        {(() => {
          const currentId = user?.uid || user?._id || user?.id;
          const other = participants?.length ? participants.find((p) => String(p._id) !== String(currentId)) : null;
          return (
            <>
              {other?.avatar ? (
                <img src={other.avatar} alt={other.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold">{other?.name?.charAt(0)?.toUpperCase()}</div>
              )}
              <div>
                <div className="text-sm font-semibold text-white">{other?.name || title || 'Chat'}</div>
                <div className="text-xs text-white/75">{other?.role === 'investor' ? 'Investor' : other?.role === 'founder' ? 'Founder' : other?.role === 'startup_rep' ? 'Startup Representative' : 'Guest'}</div>
              </div>
              <div className="ml-auto flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-300' : 'bg-rose-300'}`} />
                {isConnected ? 'Online' : 'Connecting'}
              </div>
            </>
          );
        })()}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,231,95,0.18),transparent_24%)] px-4 py-4 md:px-6">
        {((messages && messages.length) || (initialMessages && initialMessages.length)) === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          (messages.length ? messages : initialMessages).map((msg, index) => {
            const currentId = user?.uid || user?._id || user?.id;
            const isMine = String(msg.sender._id) === String(currentId);
            const attachments = msg.attachments || [];
            const onlyImages = (!msg.content || String(msg.content).trim() === '') && attachments.length > 0 && attachments.every((a) => a.mimetype && a.mimetype.startsWith('image/'));
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.18) }}
                className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  <div>
                    {msg.sender.avatar ? (
                      <img src={msg.sender.avatar} alt={msg.sender.name} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#075e54] text-xs font-bold text-white">{msg.sender.name?.charAt(0)?.toUpperCase()}</div>
                    )}
                  </div>
                )}

                <div className={`${onlyImages ? '' : 'max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm md:max-w-lg'} ${isMine ? (onlyImages ? '' : 'bg-[#dcf8c6] text-slate-900') : (onlyImages ? '' : 'border border-slate-200 bg-white text-slate-900')}`}>
                  {!isMine && (
                    <p className="text-xs font-semibold text-slate-600 mb-1">{msg.sender.name} <span className="text-[10px] text-slate-400">· {msg.sender.role ? (msg.sender.role === 'investor' ? 'Investor' : msg.sender.role === 'founder' ? 'Founder' : msg.sender.role === 'startup_rep' ? 'Startup Representative' : 'Guest') : ''}</span></p>
                  )}
                  <p>{msg.content}</p>
                  {attachments && attachments.length > 0 && (
                    <div className={`${onlyImages ? 'mt-2 flex flex-wrap gap-2' : 'mt-2 space-y-2'}`}>
                      {attachments.map((att, idx) => {
                        const href = att.url && att.url.startsWith('http') ? att.url : `${API_BASE}${att.url}`;
                        if (att.mimetype && att.mimetype.startsWith('image/')) {
                          // image rendering
                          return (
                            <div key={idx} className={`${onlyImages ? '' : ''}`}>
                              <img
                                src={href}
                                alt={att.filename}
                                className={`${onlyImages ? 'max-h-48 w-auto rounded-lg cursor-pointer' : 'max-h-48 w-auto rounded'}`}
                                onClick={() => { setLightboxAttachment({ ...att, href }); setLightboxOpen(true); }}
                              />
                            </div>
                          );
                        }

                        // non-image: show open + download
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 underline">{att.filename || 'Open file'}</a>
                            <a href={href} download={att.filename || true} className="text-sm text-slate-500 underline">Download</a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Typing indicator */}
          <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 px-6 py-2">
              {typingUsers.map((u) => (
                <div key={u.userId} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-200" />
                  <div className="text-xs text-slate-500">{u.userName} is typing…</div>
                </div>
              ))}
            </motion.div>
          )}
          </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Lightbox modal for images */}
      {lightboxOpen && lightboxAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setLightboxOpen(false)}>
          <div className="relative max-w-3xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxAttachment.href} alt={lightboxAttachment.filename} className="max-h-[80vh] w-auto rounded" />
            <div className="mt-3 flex gap-3 justify-end">
              <a href={lightboxAttachment.href} target="_blank" rel="noopener noreferrer" className="rounded bg-white px-3 py-2 text-sm">Open in new tab</a>
              <a href={lightboxAttachment.href} download={lightboxAttachment.filename || true} className="rounded bg-white px-3 py-2 text-sm">Save as</a>
              <button onClick={() => setLightboxOpen(false)} className="rounded bg-white px-3 py-2 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-emerald-900/10 bg-[#f0f2f5] p-3 md:p-4">
        <div className="flex gap-3 rounded-[24px] border border-white/70 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <div className="relative">
              <button type="button" onClick={() => setShowUploadMenu((s) => !s)} disabled={uploading} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60">
                Upload
              </button>
              {showUploadMenu && (
                <div className="absolute left-0 top-[52px] z-20 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <button type="button" onClick={() => { setShowUploadMenu(false); imageInputRef.current?.click(); }} className="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50">Photo</button>
                  <button type="button" onClick={() => { setShowUploadMenu(false); fileInputRef.current?.click(); }} className="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50">File</button>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !chatId) return;
              setUploading(true);
              try {
                const res = await uploadAttachment(chatId, file);
                const base = API_BASE;
                const url = res.url && res.url.startsWith('http') ? res.url : `${base}${res.url}`;
                const attachment = { url, filename: res.filename, mimetype: res.mimetype };
                sendMessage('', [attachment]);
              } catch (err) {
                console.error('Upload failed', err);
              } finally {
                setUploading(false);
                e.target.value = '';
              }
            }} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !chatId) return;
              setUploading(true);
              try {
                const res = await uploadAttachment(chatId, file);
                const base = API_BASE;
                const url = res.url && res.url.startsWith('http') ? res.url : `${base}${res.url}`;
                const attachment = { url, filename: res.filename, mimetype: res.mimetype };
                // send message with attachment
                sendMessage('', [attachment]);
              } catch (err) {
                console.error('Upload failed', err);
              } finally {
                setUploading(false);
                // reset file input so same file can be uploaded again
                e.target.value = '';
              }
            }} />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!isConnected}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
          />
            <button
              type="submit"
              disabled={!inputValue.trim() || !isConnected}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#075e54] text-white transition hover:bg-[#064e46] disabled:bg-slate-200 disabled:text-slate-400"
            >
              <FiSend className="text-lg" />
            </button>
        </div>
      </form>
    </div>
  );
}
