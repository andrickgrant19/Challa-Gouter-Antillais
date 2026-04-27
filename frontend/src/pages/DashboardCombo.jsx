import { useEffect, useState } from "react";
import { Plus, Trash2, ChefHat, Salad, Cookie, Loader2, Save, X, Check, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function DashboardCombo() {
  const [proteins, setProteins] = useState([]);
  const [sides, setSides]       = useState([]);
  const [extras, setExtras]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchAll = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    const [p, s, e] = await Promise.all([
      supabase.from("combo_proteins").select("*").order("display_order"),
      supabase.from("combo_sides").select("*").order("side_type").order("display_order"),
      supabase.from("combo_extras").select("*").order("display_order"),
    ]);
    const errMsg = p.error?.message || s.error?.message || e.error?.message;
    if (errMsg) {
      setError(errMsg.includes("Could not find")
        ? "Combo tables not yet created. Run /app/supabase_migrations.sql in your Supabase SQL Editor."
        : errMsg);
      setLoading(false); return;
    }
    setProteins(p.data || []);
    setSides(s.data || []);
    setExtras(e.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    if (!supabase) return;
    const ch = supabase
      .channel("dashboard-combo-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_proteins" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_sides" },    fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_extras" },   fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (loading) return <div className="text-brand-text font-body text-sm">Loading…</div>;
  if (error) return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-xl">
      <AlertCircle className="text-amber-600 mb-2" size={20} />
      <p className="font-body text-amber-900 text-sm">{error}</p>
    </div>
  );

  return (
    <div data-testid="dashboard-combo" className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-black">Combo Builder</h1>
        <p className="font-body text-sm text-brand-text">
          Owner-managed proteins, rice bases, sides &amp; extras. Changes save instantly and reflect on the public menu.
        </p>
      </div>

      <Section icon={ChefHat} title="Proteins" subtitle="Step 1 of the combo">
        <ItemTable
          items={proteins}
          table="combo_proteins"
          columns={[
            { key: "name",         label: "Name (FR)", type: "text" },
            { key: "name_en",      label: "Name (EN)", type: "text" },
            { key: "price",        label: "Price",     type: "money" },
            { key: "display_order",label: "Order",     type: "int" },
          ]}
          onRefresh={fetchAll}
        />
      </Section>

      <Section icon={Salad} title="Sides &amp; Bases" subtitle="Step 2 (rice base) and Step 3 (second side)">
        <ItemTable
          items={sides}
          table="combo_sides"
          columns={[
            { key: "name",          label: "Name (FR)",  type: "text" },
            { key: "name_en",       label: "Name (EN)",  type: "text" },
            { key: "price_modifier",label: "Modifier",   type: "money" },
            { key: "side_type",     label: "Type",       type: "select", options: ["base","side"] },
            { key: "display_order", label: "Order",      type: "int" },
          ]}
          onRefresh={fetchAll}
        />
      </Section>

      <Section icon={Cookie} title="Extras" subtitle="Step 4 — multiple selections allowed" addable>
        <ItemTable
          items={extras}
          table="combo_extras"
          columns={[
            { key: "name",         label: "Name (FR)", type: "text" },
            { key: "name_en",      label: "Name (EN)", type: "text" },
            { key: "price",        label: "Price",     type: "money" },
            { key: "display_order",label: "Order",     type: "int" },
          ]}
          allowAdd
          allowDelete
          onRefresh={fetchAll}
        />
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
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

function ItemTable({ items, table, columns, allowAdd = false, allowDelete = false, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);

  const blank = () => {
    const d = {};
    columns.forEach((c) => {
      d[c.key] = c.type === "money" || c.type === "int" ? 0 : (c.type === "select" ? c.options[0] : "");
    });
    d.is_available = true;
    return d;
  };

  const startAdd = () => { setDraft(blank()); setAdding(true); };
  const cancel  = () => { setDraft(null); setAdding(false); };

  const saveNew = async () => {
    const { error } = await supabase.from(table).insert(draft);
    if (error) { alert(error.message); return; }
    cancel();
    onRefresh();
  };

  const updateField = async (id, key, value) => {
    const { error } = await supabase.from(table).update({ [key]: value }).eq("id", id);
    if (error) alert(error.message);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(error.message);
    onRefresh();
  };

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm font-body">
        <thead className="bg-brand-cream text-brand-text">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">{c.label}</th>
            ))}
            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold">Available</th>
            <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} data-testid={`${table}-row-${it.id}`} className="border-t border-brand-border">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top">
                  <InlineField
                    value={it[c.key]}
                    type={c.type}
                    options={c.options}
                    onSave={(v) => updateField(it.id, c.key, v)}
                  />
                </td>
              ))}
              <td className="px-3 py-2">
                <Toggle
                  testid={`${table}-avail-${it.id}`}
                  on={!!it.is_available}
                  onChange={(on) => updateField(it.id, "is_available", on)}
                />
              </td>
              <td className="px-3 py-2 text-right">
                {allowDelete && (
                  <button onClick={() => remove(it.id)} data-testid={`${table}-del-${it.id}`} className="text-red-500 p-1.5 hover:bg-red-50 rounded-md">
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}

          {adding && draft && (
            <tr className="border-t-2 border-brand-orange bg-brand-orange/5">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2">
                  <NewField
                    value={draft[c.key]}
                    type={c.type}
                    options={c.options}
                    onChange={(v) => setDraft({ ...draft, [c.key]: v })}
                  />
                </td>
              ))}
              <td className="px-3 py-2">
                <Toggle on={true} onChange={(v) => setDraft({ ...draft, is_available: v })} />
              </td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <button onClick={cancel} className="text-brand-text p-1.5 hover:bg-brand-cream rounded-md mr-1"><X size={14}/></button>
                <button onClick={saveNew} data-testid={`${table}-save-new`} className="bg-brand-orange text-white px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1"><Save size={12}/>Save</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {allowAdd && !adding && (
        <button onClick={startAdd} data-testid={`${table}-add-btn`} className="mt-3 inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-body font-semibold px-3 py-2 rounded-md">
          <Plus size={14} /> Add Extra
        </button>
      )}
    </div>
  );
}

function InlineField({ value, type, options, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const display = (() => {
    if (type === "money") return `$${Number(value || 0).toFixed(2)}`;
    if (type === "int")   return String(value ?? 0);
    return value ?? "—";
  })();

  const commit = async () => {
    setSaving(true);
    let v = draft;
    if (type === "money") v = parseFloat(draft) || 0;
    if (type === "int")   v = parseInt(draft, 10) || 0;
    await onSave(v);
    setSaving(false);
    setEditing(false);
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
      <select
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        className="border border-brand-orange rounded px-2 py-1 text-sm font-body bg-white"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <input
        autoFocus
        type={type === "money" || type === "int" ? "number" : "text"}
        step={type === "money" ? "0.01" : "1"}
        value={draft ?? ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        onBlur={commit}
        className="border border-brand-orange rounded px-2 py-1 text-sm font-body bg-white w-28 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      />
      {saving && <Loader2 className="animate-spin text-brand-orange" size={12} />}
    </div>
  );
}

function NewField({ value, type, options, onChange }) {
  if (type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border border-brand-border rounded px-2 py-1 text-sm font-body bg-white">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input
      type={type === "money" || type === "int" ? "number" : "text"}
      step={type === "money" ? "0.01" : "1"}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={type === "money" ? "0.00" : ""}
      className="border border-brand-border rounded px-2 py-1 text-sm font-body bg-white w-28 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
    />
  );
}

function Toggle({ testid, on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      data-testid={testid}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors ${on ? "bg-brand-green" : "bg-gray-300"}`}
    >
      <span className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${on ? "translate-x-5" : ""}`}>
        {on ? <Check size={10} className="text-brand-green absolute inset-0 m-auto" /> : null}
      </span>
    </button>
  );
}
