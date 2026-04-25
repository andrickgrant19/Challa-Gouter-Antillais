import { useEffect, useState } from "react";
import { Phone, MapPin, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function DashboardHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    q.then(({ data, error }) => {
      if (error) setError(error.message);
      else setOrders(data || []);
      setLoading(false);
    });
  }, [filter]);

  const filters = [
    { id: "all",         label: "All" },
    { id: "completed",   label: "Completed" },
    { id: "cancelled",   label: "Cancelled" },
    { id: "in_progress", label: "Preparing" },
    { id: "new",         label: "New" },
  ];

  return (
    <div data-testid="dashboard-history">
      <h1 className="font-heading text-3xl font-bold text-brand-black mb-1">Order History</h1>
      <p className="font-body text-sm text-brand-text mb-5">Last 200 orders across all statuses.</p>

      <div className="flex gap-1 mb-5 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setLoading(true); }}
            data-testid={`history-filter-${f.id}`}
            className={`px-3 py-1.5 rounded-md text-xs font-body font-semibold whitespace-nowrap transition-colors ${filter === f.id ? "bg-brand-orange text-white" : "bg-white text-brand-text border border-brand-border hover:border-brand-orange"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>}
      {loading ? (
        <div className="text-brand-text font-body text-sm">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-2xl p-10 text-center">
          <Clock className="mx-auto mb-3 text-brand-border" size={32} />
          <p className="font-body text-brand-text">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-brand-cream text-brand-text">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider">When</th>
                <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider">Customer</th>
                <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-brand-border" data-testid={`history-row-${o.id}`}>
                  <td className="px-4 py-3 text-xs text-brand-text">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-brand-black">{o.customer_name}</div>
                    <div className="text-xs text-brand-text flex items-center gap-1"><Phone size={10}/> {o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {o.order_type === "delivery" ? "Delivery" : "Pickup"}
                    {o.delivery_address && <div className="text-brand-text flex items-start gap-1 mt-0.5"><MapPin size={10} className="mt-0.5"/> <span className="truncate max-w-[180px]">{o.delivery_address}</span></div>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded text-white ${o.status === "completed" ? "bg-brand-green" : o.status === "cancelled" ? "bg-gray-500" : o.status === "in_progress" ? "bg-amber-500" : "bg-brand-orange"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-orange">${Number(o.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
