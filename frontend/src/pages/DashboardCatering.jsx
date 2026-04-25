import { useEffect, useMemo, useState } from "react";
import { Phone, Mail, Calendar, Users, PartyPopper, Search, Filter, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

const STATUS_OPTIONS = [
  { id: "new",        label: "New",        color: "bg-brand-orange text-white" },
  { id: "contacted",  label: "Contacted",  color: "bg-amber-500 text-white" },
  { id: "quoted",     label: "Quoted",     color: "bg-purple-500 text-white" },
  { id: "booked",     label: "Booked",     color: "bg-brand-green text-white" },
  { id: "completed",  label: "Completed",  color: "bg-brand-gold text-white" },
  { id: "cancelled",  label: "Cancelled",  color: "bg-gray-400 text-white" },
];

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export default function DashboardCatering() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchRequests = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    let q = supabase.from("catering_requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setError(error.message);
    else setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    if (!supabase) return;
    const channel = supabase
      .channel("catering-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "catering_requests" }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    if (!supabase) return;
    const { data, error } = await supabase.from("catering_requests").update({ status }).eq("id", id).select().single();
    if (error) { alert(error.message); return; }
    setRequests((prev) => prev.map((r) => (r.id === id ? data : r)));
    if (selected?.id === id) setSelected(data);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter((r) =>
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.event_type?.toLowerCase().includes(q) ||
      r.message?.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div data-testid="dashboard-catering">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-black">Catering Requests</h1>
          <p className="font-body text-sm text-brand-text">Inquiries from the public catering form{newCount > 0 ? ` — ${newCount} new` : ""}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => { setFilter("all"); setLoading(true); }}
            data-testid="catering-filter-all"
            className={`px-3 py-1.5 rounded-md text-xs font-body font-semibold whitespace-nowrap transition-colors ${filter === "all" ? "bg-brand-orange text-white" : "bg-white text-brand-text border border-brand-border hover:border-brand-orange"}`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setFilter(opt.id); setLoading(true); }}
              data-testid={`catering-filter-${opt.id}`}
              className={`px-3 py-1.5 rounded-md text-xs font-body font-semibold whitespace-nowrap transition-colors ${filter === opt.id ? "bg-brand-orange text-white" : "bg-white text-brand-text border border-brand-border hover:border-brand-orange"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, event…"
            data-testid="catering-search"
            className="w-full bg-white border border-brand-border rounded-md pl-9 pr-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>}

      {loading ? (
        <div className="text-brand-text font-body text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-2xl p-10 text-center">
          <PartyPopper className="mx-auto mb-3 text-brand-border" size={32} />
          <p className="font-body text-brand-text">{requests.length === 0 ? "No catering requests yet." : "No matches."}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((r) => {
              const statusOpt = STATUS_OPTIONS.find((s) => s.id === r.status) || STATUS_OPTIONS[0];
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  data-testid={`catering-row-${r.id}`}
                  className={`w-full text-left bg-white border rounded-xl p-3 transition-all hover:border-brand-orange ${selected?.id === r.id ? "border-brand-orange ring-2 ring-brand-orange/20" : "border-brand-border"} ${r.status === "new" ? "border-l-4 border-l-brand-orange" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-body font-semibold text-sm text-brand-black truncate">{r.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusOpt.color}`}>{statusOpt.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-text">
                    {r.event_type && <span className="font-semibold text-brand-orange truncate max-w-[140px]">{r.event_type}</span>}
                    {r.event_date && <span className="inline-flex items-center gap-1"><Calendar size={10}/> {fmtDate(r.event_date)}</span>}
                    {r.guest_count && <span className="inline-flex items-center gap-1"><Users size={10}/> {r.guest_count}</span>}
                  </div>
                  <div className="font-body text-[10px] text-brand-text/70 mt-1">Submitted {new Date(r.created_at).toLocaleString()}</div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div data-testid="catering-detail" className="bg-white border border-brand-border rounded-2xl p-6 sticky top-32">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-brand-black">{selected.name}</h2>
                    <p className="font-body text-sm text-brand-text mt-1">Submitted {new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Event facts */}
                <div className="grid sm:grid-cols-3 gap-3 mb-5">
                  <Fact icon={PartyPopper} label="Event Type" value={selected.event_type || "—"} />
                  <Fact icon={Calendar} label="Date" value={fmtDate(selected.event_date)} />
                  <Fact icon={Users} label="Guests" value={selected.guest_count ?? "—"} />
                </div>

                {/* Contact */}
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 bg-brand-cream rounded-lg p-3 hover:bg-brand-cream-secondary transition-colors text-sm font-body text-brand-black truncate">
                    <Mail size={14} className="text-brand-gold flex-shrink-0" /> <span className="truncate">{selected.email}</span>
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 bg-brand-cream rounded-lg p-3 hover:bg-brand-cream-secondary transition-colors text-sm font-body text-brand-black">
                      <Phone size={14} className="text-brand-gold" /> {selected.phone}
                    </a>
                  )}
                </div>

                {/* Message */}
                {selected.message && (
                  <div className="bg-brand-cream rounded-xl p-4 whitespace-pre-wrap font-body text-sm text-brand-black leading-relaxed mb-5">
                    {selected.message}
                  </div>
                )}

                {/* Status flow */}
                <div className="border-t border-brand-border pt-4">
                  <p className="text-xs font-body font-semibold text-brand-text uppercase tracking-wider mb-2 flex items-center gap-1.5"><Filter size={12}/> Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => updateStatus(selected.id, opt.id)}
                        data-testid={`catering-set-${opt.id}`}
                        className={`px-3 py-1.5 rounded-md text-xs font-body font-semibold transition-all ${selected.status === opt.id ? opt.color + " ring-2 ring-offset-1 ring-brand-orange/40" : "bg-white text-brand-text border border-brand-border hover:border-brand-orange"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Catering inquiry — Chala Le Gouter Antillais")}`}
                    data-testid="catering-reply-btn"
                    className="inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-body font-semibold px-4 py-2 rounded-md transition-colors"
                  >
                    <Mail size={14} /> Reply by email
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1.5 bg-white border border-brand-border hover:border-brand-orange text-brand-black text-sm font-body font-semibold px-4 py-2 rounded-md transition-colors"
                    >
                      <Phone size={14} /> Call
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-brand-border border-dashed rounded-2xl p-12 text-center sticky top-32">
                <PartyPopper className="mx-auto mb-3 text-brand-border" size={32} />
                <p className="font-body text-brand-text">Select a catering request to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="bg-brand-cream rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-body font-semibold text-brand-text uppercase tracking-wider mb-1">
        <Icon size={11} className="text-brand-gold" /> {label}
      </div>
      <div className="font-body text-sm font-semibold text-brand-black">{value}</div>
    </div>
  );
}
