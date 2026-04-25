import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Phone, MapPin, Clock, RefreshCw, ChefHat, CheckCircle2, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const STATUS_FLOW = ["new", "in_progress", "completed"];
const STATUS_LABELS = { new: "New", in_progress: "Preparing", completed: "Completed", cancelled: "Cancelled" };
const STATUS_BADGE = {
  new:         "bg-brand-orange text-white",
  in_progress: "bg-amber-500 text-white",
  completed:   "bg-brand-green text-white",
  cancelled:   "bg-gray-500 text-white",
};

export default function DashboardOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const knownIds = useRef(new Set());

  const playPing = () => {
    try {
      // Tiny ping using WebAudio (avoid bundling an mp3)
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.start(); o.stop(ctx.currentTime + 0.42);
    } catch { /* ignore */ }
  };

  const fetchOrders = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["new", "in_progress"])
      .order("created_at", { ascending: false });
    if (error) { setError(error.message); setLoading(false); return; }
    setOrders(data || []);
    (data || []).forEach((o) => knownIds.current.add(o.id));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    if (!supabase) return;

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        const evt = payload.eventType;
        if (evt === "INSERT" && payload.new) {
          if (!knownIds.current.has(payload.new.id)) {
            knownIds.current.add(payload.new.id);
            playPing();
          }
          setOrders((prev) => {
            if (prev.find((o) => o.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (evt === "UPDATE" && payload.new) {
          setOrders((prev) => {
            // Remove if no longer active
            if (!["new", "in_progress"].includes(payload.new.status)) {
              return prev.filter((o) => o.id !== payload.new.id);
            }
            return prev.map((o) => (o.id === payload.new.id ? payload.new : o));
          });
        } else if (evt === "DELETE" && payload.old) {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id, status) => {
    if (!supabase) return;
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) alert(error.message);
  };

  const counts = useMemo(() => {
    const c = { new: 0, in_progress: 0 };
    orders.forEach((o) => { if (c[o.status] !== undefined) c[o.status] += 1; });
    return c;
  }, [orders]);

  return (
    <div data-testid="dashboard-orders">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-black">Live Orders</h1>
          <p className="font-body text-sm text-brand-text">Real-time stream from Supabase</p>
        </div>
        <button
          onClick={fetchOrders}
          data-testid="refresh-orders-btn"
          className="inline-flex items-center gap-1.5 bg-white border border-brand-border hover:border-brand-orange text-sm font-body px-3 py-2 rounded-md transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Stat title="New"         value={counts.new}         icon={Bell}        accent="bg-brand-orange" />
        <Stat title="Preparing"   value={counts.in_progress} icon={ChefHat}     accent="bg-amber-500" />
        <Stat title="Active"      value={orders.length}      icon={Clock}       accent="bg-brand-green" />
        <Stat title="Realtime"    value="ON"                 icon={CheckCircle2} accent="bg-brand-gold" />
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>}
      {loading ? (
        <div className="text-brand-text font-body text-sm">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-2xl p-12 text-center">
          <Bell className="mx-auto mb-3 text-brand-border" size={36} />
          <p className="font-body text-brand-text">No active orders right now. Newly placed orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, icon: Icon, accent }) {
  return (
    <div className="bg-white border border-brand-border rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${accent} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="font-body text-xs text-brand-text">{title}</p>
        <p className="font-heading text-2xl font-bold text-brand-black leading-tight">{value}</p>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }) {
  const created = new Date(order.created_at);
  const items = Array.isArray(order.items) ? order.items : [];
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  return (
    <div data-testid={`order-card-${order.id}`} className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-heading text-lg font-bold text-brand-black">{order.customer_name}</div>
          <div className="text-xs font-body text-brand-text mt-0.5">{created.toLocaleString()}</div>
        </div>
        <span className={`text-[10px] font-body font-bold uppercase tracking-wider px-2 py-1 rounded-md ${STATUS_BADGE[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-1 text-sm font-body text-brand-text mb-3">
        <div className="flex items-center gap-1.5">
          <Phone size={12} className="text-brand-gold" /> {order.customer_phone}
        </div>
        {order.order_type === "delivery" && order.delivery_address && (
          <div className="flex items-start gap-1.5">
            <MapPin size={12} className="text-brand-gold mt-0.5 flex-shrink-0" />
            <span>{order.delivery_address}</span>
          </div>
        )}
        <div className="text-xs">
          <span className="font-semibold text-brand-black">{order.order_type === "delivery" ? "Delivery" : "Pickup"}</span>
          {order.notes && <span className="ml-2 italic">— {order.notes}</span>}
        </div>
      </div>

      <div className="border-t border-brand-border pt-3 mb-3 space-y-1">
        {items.map((i, idx) => (
          <div key={idx} className="flex justify-between text-sm font-body">
            <span className="text-brand-black">{i.quantity}× {i.name}</span>
            <span className="text-brand-text">${(Number(i.unit_price) * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-brand-border">
          <span className="font-body font-semibold text-brand-black">Total</span>
          <span className="font-heading font-bold text-brand-orange">${Number(order.subtotal).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {nextStatus && (
          <button
            onClick={() => onUpdate(order.id, nextStatus)}
            data-testid={`advance-${order.id}`}
            className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-body font-semibold py-2 rounded-md transition-colors"
          >
            {nextStatus === "in_progress" ? "Start Preparing" : "Mark Completed"}
          </button>
        )}
        <button
          onClick={() => onUpdate(order.id, "cancelled")}
          data-testid={`cancel-${order.id}`}
          className="bg-white hover:bg-red-50 border border-brand-border hover:border-red-300 text-red-600 text-sm font-body px-3 py-2 rounded-md transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
