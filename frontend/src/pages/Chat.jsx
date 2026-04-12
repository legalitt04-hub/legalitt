import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Phone, Send, Plus, X,
  FileText, Mic, Image, Paperclip
} from 'lucide-react';

const MOCK_MESSAGES = [
  { id: 1, from: 'advocate', text: 'Hello you can now message me with any case concerns or upload any relevent documents here...',  time: '10:00 AM' },
  { id: 2, from: 'user',     text: 'Yes I can Easily send message and upload documents easily',                                    time: '10:01 AM' },
  { id: 3, from: 'advocate', text: 'Hello you can now message me with any case concerns or upload any relevent documents here...',  time: '10:02 AM' },
  { id: 4, from: 'user',     text: 'Yes ia can easily send message',                                                               time: '10:03 AM' },
];

function ChatBubble({ msg, advocateImg }) {
  const isAdv = msg.from === 'advocate';
  return (
    <div className={`flex items-end gap-2 ${isAdv ? '' : 'flex-row-reverse'}`}>
      {isAdv && (
        <img
          src={advocateImg || 'https://ui-avatars.com/api/?name=A&background=0d7a5f&color=fff&size=32'}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1"
          alt=""
        />
      )}
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isAdv
          ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
          : 'bg-primary-500 text-white rounded-br-sm'
      }`}>
        {msg.file ? (
          <div className="flex items-center gap-2">
            <FileText size={16} className={isAdv ? 'text-gray-500' : 'text-white/80'} />
            <div>
              <p className="font-semibold text-xs">{msg.file.name}</p>
              <p className={`text-[10px] ${isAdv ? 'text-gray-400' : 'text-white/70'}`}>{msg.file.size} • Tap to view</p>
            </div>
          </div>
        ) : (
          msg.text
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const advocate  = location.state?.advocate || { name: 'Ajay Chohan', fees: 800 };
  const advocateImg = location.state?.advocateImg;

  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput]       = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour in seconds
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: input.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages(m => [...m, {
      id: Date.now(), from: 'user',
      file: { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` },
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }]);
    setShowAttach(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <img
            src={advocateImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=40`}
            className="w-10 h-10 rounded-full object-cover"
            alt={advocate.name}
          />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-gray-900 text-sm">{advocate.name}</h1>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#0d7a5f"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Phone size={20} />
          </button>
        </div>

        {/* Timer banner */}
        <div className="mx-4 mb-3 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-semibold text-primary-700">Chat Valid Upto 1 Hours From Now</span>
          </div>
          <span className="text-xs font-bold text-primary-600 font-mono">{formatTime(timeLeft)} min</span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <ChatBubble key={msg.id} msg={msg} advocateImg={advocateImg} />
        ))}
        {/* Typing dots */}
        <div className="flex items-center gap-2">
          <img
            src={advocateImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=32`}
            className="w-8 h-8 rounded-full object-cover"
            alt=""
          />
          <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
        <div ref={bottomRef} />
      </div>

      {/* ── Attachment picker ── */}
      {showAttach && (
        <div className="bg-white border-t border-gray-100 px-6 py-5 animate-fade-in">
          <div className="flex justify-around">
            {[
              { icon: FileText, label: 'Document', accept: '.pdf,.doc,.docx' },
              { icon: Image,    label: 'Image',    accept: 'image/*' },
            ].map(({ icon: Icon, label, accept }) => (
              <button
                key={label}
                onClick={() => { fileRef.current.accept = accept; fileRef.current.click(); }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <Icon size={24} className="text-primary-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 safe-area-pb">
        <button
          onClick={() => setShowAttach(a => !a)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            showAttach
              ? 'bg-red-100 text-red-500'
              : 'bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600'
          }`}
        >
          {showAttach ? <X size={18} /> : <Plus size={18} />}
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50"
        />

        <button className="text-gray-400 hover:text-primary-500 transition-colors">
          <Phone size={20} />
        </button>

        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center disabled:opacity-40 hover:bg-primary-600 transition-all active:scale-90"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
