import { useEffect, useState } from "react";
import { Mail, Phone, Calendar, Search } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function DashboardMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchMessages = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    let q = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter === "unread") q = q.eq("is_read", false);
    if (filter === "read")   q = q.eq("is_read", true);
    const { data, error } = await q;
    if (error) setError(error.message);
    else setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    if (!supabase) return;
    const channel = supabase
      .channel("contact-messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, (payload) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const toggleRead = async (m) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("contact_messages")
      .update({ is_read: !m.is_read })
      .eq("id", m.id)
      .select()
      .single();
    if (error) { alert(error.message); return; }
    setMessages((prev) => prev.map((x) => (x.id === m.id ? data : x)));
    if (selected?.id === m.id) setSelected(data);
  };

  const filtered = messages.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div data-testid="dashboard-messages">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-black">Messages</h1>
          <p className="font-body text-sm text-brand-text">Contact form & catering inquiries{unreadCount > 0 ? ` — ${unreadCount} unread` : ""}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: "all",    label: "All" },
            { id: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
            { id: "read",   label: "Read" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setLoading(true); }}
              data-testid={`messages-filter-${f.id}`}
              className={`px-3 py-1.5 rounded-md text-xs font-body font-semibold whitespace-nowrap transition-colors ${filter === f.id ? "bg-brand-orange text-white" : "bg-white text-brand-text border border-brand-border hover:border-brand-orange"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            data-testid="messages-search"
            className="w-full bg-white border border-brand-border rounded-md pl-9 pr-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>}

      {loading ? (
        <div className="text-brand-text font-body text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-2xl p-10 text-center">
          <Mail className="mx-auto mb-3 text-brand-border" size={32} />
          <p className="font-body text-brand-text">{messages.length === 0 ? "No messages yet." : "No matches."}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                data-testid={`message-row-${m.id}`}
                className={`w-full text-left bg-white border rounded-xl p-3 transition-all hover:border-brand-orange ${selected?.id === m.id ? "border-brand-orange ring-2 ring-brand-orange/20" : "border-brand-border"} ${!m.is_read ? "border-l-4 border-l-brand-orange" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-body font-semibold text-sm ${!m.is_read ? "text-brand-black" : "text-brand-text"}`}>{m.name}</span>
                  {!m.is_read && <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-orange text-white px-1.5 py-0.5 rounded">NEW</span>}
                </div>
                <div className="font-body text-xs text-brand-orange truncate">{m.subject}</div>
                <div className="font-body text-xs text-brand-text truncate mt-0.5">{m.message}</div>
                <div className="font-body text-[10px] text-brand-text/70 mt-1">{new Date(m.created_at).toLocaleString()}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div data-testid="message-detail" className="bg-white border border-brand-border rounded-2xl p-6 sticky top-32">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-brand-black">{selected.subject}</h2>
                    <p className="font-body text-sm text-brand-text mt-1 flex items-center gap-3">
                      <span><span className="font-semibold text-brand-black">{selected.name}</span></span>
                      <span className="inline-flex items-center gap-1"><Calendar size={11}/> {new Date(selected.created_at).toLocaleString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRead(selected)}
                    data-testid="message-toggle-read"
                    className={`text-xs font-body font-semibold px-3 py-1.5 rounded-md transition-colors ${selected.is_read ? "bg-brand-cream text-brand-text border border-brand-border hover:border-brand-orange" : "bg-brand-orange text-white hover:bg-brand-orange-dark"}`}
                  >
                    {selected.is_read ? "Mark as unread" : "Mark as read"}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 bg-brand-cream rounded-lg p-3 hover:bg-brand-cream-secondary transition-colors text-sm font-body text-brand-black">
                    <Mail size={14} className="text-brand-gold" /> {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 bg-brand-cream rounded-lg p-3 hover:bg-brand-cream-secondary transition-colors text-sm font-body text-brand-black">
                      <Phone size={14} className="text-brand-gold" /> {selected.phone}
                    </a>
                  )}
                </div>

                <div className="bg-brand-cream rounded-xl p-4 whitespace-pre-wrap font-body text-sm text-brand-black leading-relaxed">
                  {selected.message}
                </div>

                <div className="mt-5 flex gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    data-testid="reply-email-btn"
                    className="inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-body font-semibold px-4 py-2 rounded-md transition-colors"
                  >
                    <Mail size={14} /> Reply by email
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-brand-border border-dashed rounded-2xl p-12 text-center sticky top-32">
                <Mail className="mx-auto mb-3 text-brand-border" size={32} />
                <p className="font-body text-brand-text">Select a message to view it.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
