import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const EMPTY = { name: "", description: "", price: "", category: "", image_url: "", is_available: true, display_order: 0 };

export default function DashboardMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // id or "new"
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    const { data, error } = await supabase.from("menu_items").select("*").order("display_order", { ascending: true });
    if (error) { setError(error.message); setLoading(false); return; }
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item, price: String(item.price) });
  };

  const startNew = () => {
    setEditing("new");
    setForm(EMPTY);
  };

  const cancel = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price: parseFloat(form.price) || 0,
        category: form.category.trim(),
        image_url: form.image_url?.trim() || null,
        is_available: !!form.is_available,
        display_order: parseInt(form.display_order) || 0,
      };
      if (!payload.name || !payload.category) { setError("Name and category are required"); setSaving(false); return; }

      if (editing === "new") {
        const { error } = await supabase.from("menu_items").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editing);
        if (error) throw error;
      }
      cancel();
      await fetchItems();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!supabase) return;
    if (!window.confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    fetchItems();
  };

  return (
    <div data-testid="dashboard-menu">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-black">Menu Manager</h1>
          <p className="font-body text-sm text-brand-text">Items here override the static fallback.</p>
        </div>
        <button
          onClick={startNew}
          data-testid="add-menu-item-btn"
          className="inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-body font-semibold px-4 py-2 rounded-md"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>}

      {editing && (
        <div className="bg-white border-2 border-brand-orange rounded-2xl p-5 mb-5">
          <h3 className="font-heading text-lg font-semibold text-brand-black mb-3">{editing === "new" ? "New Item" : "Edit Item"}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name *"><input className="dash-input" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} data-testid="menu-form-name" /></Field>
            <Field label="Category *"><input className="dash-input" placeholder="e.g. griot, jerk, drinks" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} data-testid="menu-form-category" /></Field>
            <Field label="Price (CAD) *"><input className="dash-input" type="number" step="0.01" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} data-testid="menu-form-price" /></Field>
            <Field label="Display Order"><input className="dash-input" type="number" value={form.display_order} onChange={(e)=>setForm({...form, display_order:e.target.value})} /></Field>
            <Field label="Image URL" full><input className="dash-input" value={form.image_url || ""} onChange={(e)=>setForm({...form, image_url:e.target.value})} /></Field>
            <Field label="Description" full><textarea rows={2} className="dash-input resize-none" value={form.description || ""} onChange={(e)=>setForm({...form, description:e.target.value})} /></Field>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="inline-flex items-center gap-2 text-sm font-body text-brand-black">
              <input type="checkbox" checked={form.is_available} onChange={(e)=>setForm({...form, is_available:e.target.checked})} />
              Available
            </label>
            <div className="ml-auto flex gap-2">
              <button onClick={cancel} className="inline-flex items-center gap-1.5 bg-white border border-brand-border text-brand-text px-4 py-2 rounded-md text-sm font-body hover:bg-brand-cream"><X size={14}/> Cancel</button>
              <button onClick={save} disabled={saving} data-testid="menu-form-save" className="inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-md text-sm font-body font-semibold disabled:opacity-60">
                {saving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-brand-text font-body text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-2xl p-10 text-center">
          <p className="font-body text-brand-text">No items yet. The public menu is using the static fallback. Add an item to override.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-brand-cream text-brand-text">
              <tr>
                <Th>Name</Th><Th>Category</Th><Th>Price</Th><Th>Available</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-brand-border" data-testid={`menu-row-${it.id}`}>
                  <Td><div className="font-semibold text-brand-black">{it.name}</div><div className="text-xs text-brand-text">{it.description}</div></Td>
                  <Td>{it.category}</Td>
                  <Td className="text-brand-orange font-semibold">${Number(it.price).toFixed(2)}</Td>
                  <Td>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${it.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {it.is_available ? "YES" : "NO"}
                    </span>
                  </Td>
                  <Td align="right">
                    <button onClick={() => startEdit(it)} className="text-brand-orange p-1.5 hover:bg-brand-cream rounded-md mr-1" data-testid={`edit-${it.id}`}><Edit2 size={14}/></button>
                    <button onClick={() => remove(it.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-md" data-testid={`delete-${it.id}`}><Trash2 size={14}/></button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`.dash-input{width:100%;border:1px solid var(--brand-border,#e5e7eb);border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none;transition:all .2s;background:white}.dash-input:focus{border-color:#D84315;box-shadow:0 0 0 3px rgba(216,67,21,.15)}`}</style>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-body font-semibold text-brand-text uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

function Th({ children, align }) { return <th className={`px-4 py-2.5 text-${align||"left"} font-body font-semibold text-xs uppercase tracking-wider`}>{children}</th>; }
function Td({ children, align, className="" }) { return <td className={`px-4 py-3 text-${align||"left"} ${className}`}>{children}</td>; }
