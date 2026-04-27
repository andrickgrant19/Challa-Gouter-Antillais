// Reusable dashboard CRUD primitives for combo / family / drinks / desserts
import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, X, Check, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export function useTable(table, orderBy = "display_order") {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    const { data, error } = await supabase.from(table).select("*").order(orderBy);
    if (error) {
      setError(error.message.includes("Could not find")
        ? "Tables not yet created. Run /app/supabase_migrations.sql in Supabase SQL Editor."
        : error.message);
      setLoading(false); return;
    }
    setRows(data || []); setLoading(false);
  };

  useEffect(() => {
    reload();
    if (!supabase) return;
    const ch = supabase.channel(`tbl-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, reload)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [table]);

  const update = async (id, patch) => {
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    if (error) alert(error.message);
  };
  const insert = async (payload) => {
    const { error } = await supabase.from(table).insert(payload);
    if (error) { alert(error.message); return false; }
    return true;
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(error.message);
  };
  return { rows, loading, error, update, insert, remove, reload };
}

export function ErrorBox({ message }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 max-w-xl">
      <AlertCircle className="text-amber-600 mb-2" size={20} />
      <p className="font-body text-amber-900 text-sm">{message}</p>
    </div>
  );
}

export function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="bg-white border border-brand-border rounded-2xl p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center">
          <Icon size={18} className="text-brand-orange" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-brand-black">{title}</h2>
          {subtitle && <p className="font-body text-xs text-brand-text">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Toggle({ on, onChange, testid }) {
  return (
    <button onClick={() => onChange(!on)} data-testid={testid}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors ${on ? "bg-brand-green" : "bg-gray-300"}`}>
      <span className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${on ? "translate-x-5" : ""}`}>
        {on ? <Check size={10} className="text-brand-green absolute inset-0 m-auto" /> : null}
      </span>
    </button>
  );
}

export function InlineField({ value, type = "text", options, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setDraft(value); }, [value]);
  const display = (() => {
    if (type === "money") return `$${Number(value || 0).toFixed(2)}`;
    if (type === "int") return String(value ?? 0);
    return value ?? "—";
  })();
  const commit = async () => {
    setSaving(true);
    let v = draft;
    if (type === "money") v = parseFloat(draft) || 0;
    if (type === "int") v = parseInt(draft, 10) || 0;
    await onSave(v); setSaving(false); setEditing(false);
  };
  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-left hover:bg-brand-cream rounded px-1 py-0.5 -mx-1 transition-colors">
        <span className={type === "money" ? "font-semibold text-brand-orange" : "text-brand-black"}>{display}</span>
      </button>
    );
  }
  if (type === "select") {
    return (
      <select autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        className="border border-brand-orange rounded px-2 py-1 text-sm font-body bg-white">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <div className="inline-flex items-center gap-1">
      <input autoFocus type={type === "money" || type === "int" ? "number" : "text"}
        step={type === "money" ? "0.01" : "1"} value={draft ?? ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        onBlur={commit}
        className="border border-brand-orange rounded px-2 py-1 text-sm font-body bg-white w-32 focus:outline-none focus:ring-2 focus:ring-brand-orange/30" />
      {saving && <Loader2 className="animate-spin text-brand-orange" size={12} />}
    </div>
  );
}

export function CrudTable({ rows, columns, onUpdate, onDelete, allowDelete = false, addBtn, table }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm font-body">
        <thead className="bg-brand-cream text-brand-text">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">{c.label}</th>
            ))}
            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold">Available</th>
            {allowDelete && <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} data-testid={`${table}-row-${r.id}`} className="border-t border-brand-border">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top">
                  <InlineField value={r[c.key]} type={c.type} options={c.options}
                    onSave={(v) => onUpdate(r.id, { [c.key]: v })} />
                </td>
              ))}
              <td className="px-3 py-2">
                <Toggle on={!!r.is_available} onChange={(on) => onUpdate(r.id, { is_available: on })} testid={`${table}-avail-${r.id}`} />
              </td>
              {allowDelete && (
                <td className="px-3 py-2 text-right">
                  <button onClick={() => onDelete(r.id)} data-testid={`${table}-del-${r.id}`}
                    className="text-red-500 p-1.5 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {addBtn}
    </div>
  );
}

export function NewRowForm({ columns, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => {
    const d = {};
    columns.forEach((c) => {
      d[c.key] = c.type === "money" || c.type === "int" ? 0 : (c.type === "select" ? c.options[0] : "");
    });
    d.is_available = true;
    return d;
  });
  return (
    <div className="bg-brand-orange/5 border-2 border-brand-orange rounded-xl p-3 mt-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {columns.map((c) => (
          <div key={c.key}>
            <label className="block text-[10px] font-body font-semibold uppercase tracking-wider text-brand-text mb-1">{c.label}</label>
            <input type={c.type === "money" || c.type === "int" ? "number" : "text"} step={c.type === "money" ? "0.01" : "1"}
              value={draft[c.key] ?? ""} onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
              className="w-full border border-brand-border rounded px-2 py-1.5 text-sm font-body" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-md text-xs font-body bg-white border border-brand-border hover:bg-brand-cream"><X size={12} className="inline mr-1" />Cancel</button>
        <button onClick={() => {
          const payload = { ...draft };
          columns.forEach((c) => {
            if (c.type === "money") payload[c.key] = parseFloat(payload[c.key]) || 0;
            if (c.type === "int") payload[c.key] = parseInt(payload[c.key], 10) || 0;
          });
          onSave(payload);
        }}
          className="px-3 py-1.5 rounded-md text-xs font-body font-semibold bg-brand-orange hover:bg-brand-orange-dark text-white inline-flex items-center gap-1"><Save size={12} />Save</button>
      </div>
    </div>
  );
}

export function AddBtn({ label, onClick, testid }) {
  return (
    <button onClick={onClick} data-testid={testid}
      className="mt-3 inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-body font-semibold px-3 py-2 rounded-md">
      <Plus size={14} /> {label}
    </button>
  );
}
