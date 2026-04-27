// Shared utilities for menu page (4-tab layout)
import { useEffect, useState, useMemo } from "react";
import { Plus, Check, Loader2, AlertCircle, ShoppingBag, Coffee, IceCreamCone } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

const PROTEIN_IMG = {
  Griot:          "https://images.pexels.com/photos/9609848/pexels-photo-9609848.jpeg?auto=compress&cs=tinysrgb&w=600",
  Poulet:         "https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg?auto=compress&cs=tinysrgb&w=600",
  Dinde:          "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=600",
  "Poisson Frit": "https://images.pexels.com/photos/3296434/pexels-photo-3296434.jpeg?auto=compress&cs=tinysrgb&w=600",
  Légume:         "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600",
};
const DRINK_IMG = "https://images.pexels.com/photos/3987008/pexels-photo-3987008.jpeg?auto=compress&cs=tinysrgb&w=400";
const DESSERT_FALLBACK = "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600";

const labelOf = (row, lang) => (lang === "fr" ? row.name : (row.name_en || row.name));
const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

// ─── Card primitive ─────────────────────────────────────────────────────────
function SelectCard({ testid, selected, onClick, image, title, meta, multi = false, compact = false }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`relative text-left rounded-xl border-2 transition-all ${
        selected ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20"
                 : "border-brand-border bg-white hover:border-brand-orange/50"
      } ${compact ? "p-3" : "p-2.5"} active:scale-[0.99]`}
    >
      {image && !compact && (
        <div className="w-full h-24 rounded-lg overflow-hidden mb-2.5">
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="px-1.5 pb-1.5">
        <div className="font-body font-semibold text-sm text-brand-black leading-tight">{title}</div>
        {meta && (<div className={`font-body text-xs mt-0.5 ${selected ? "text-brand-orange font-semibold" : "text-brand-text"}`}>{meta}</div>)}
      </div>
      {selected && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center shadow">
          {multi ? <Plus size={12} className="text-white rotate-45" /> : <Check size={14} className="text-white" />}
        </span>
      )}
    </button>
  );
}

function Step({ title, subtitle, tag, required, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-black">
          {title}{subtitle && <span className="text-brand-text font-normal text-sm ml-1">{subtitle}</span>}
        </h3>
        {tag && (
          <span className={`text-[10px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${required ? "bg-brand-orange text-white" : "bg-brand-cream text-brand-text border border-brand-border"}`}>
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Loading() {
  const { lang } = useLanguage();
  return (
    <div className="text-center py-16">
      <Loader2 className="animate-spin mx-auto text-brand-orange mb-3" size={32} />
      <p className="font-body text-brand-text">{lang === "fr" ? "Chargement…" : "Loading…"}</p>
    </div>
  );
}
function SetupNeeded({ reason }) {
  const { lang } = useLanguage();
  const messages = {
    "no-client": lang === "fr"
      ? "Configuration Supabase manquante. Ajoutez REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY aux variables d'environnement Vercel, puis redéployez."
      : "Supabase credentials are missing. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your Vercel environment variables, then redeploy.",
    "table-missing": lang === "fr"
      ? "Une ou plusieurs tables ne sont pas encore créées dans Supabase. Exécutez supabase_migrations.sql dans l'éditeur SQL Supabase."
      : "One or more tables don't exist yet. Run supabase_migrations.sql in the Supabase SQL Editor.",
    "empty": lang === "fr"
      ? "Aucun élément disponible dans cette section pour le moment."
      : "No items available in this section right now.",
    "rls": lang === "fr"
      ? "Les permissions de lecture publique ne sont pas activées. Réexécutez supabase_migrations.sql pour appliquer les politiques RLS."
      : "Public read permissions are not enabled. Re-run supabase_migrations.sql to apply RLS policies.",
  };
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
      <AlertCircle className="mx-auto text-amber-600 mb-3" size={32} />
      <p className="font-body text-amber-900">{messages[reason] || messages.empty}</p>
    </div>
  );
}

function classifyError(err) {
  if (!err) return null;
  const msg = (err.message || String(err)).toLowerCase();
  if (msg.includes("could not find the table") || msg.includes("does not exist") || msg.includes("relation")) return "table-missing";
  if (msg.includes("permission denied") || msg.includes("rls") || msg.includes("policy") || err.code === "42501") return "rls";
  return null;
}

// ─── INDIVIDUAL COMBO ────────────────────────────────────────────────────────
export function IndividualBuilder() {
  const { lang } = useLanguage();
  const { addItem, openDrawer } = useCart();
  const [proteins, setProteins] = useState([]);
  const [bases, setBases] = useState([]);
  const [sides, setSides] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupReason, setSetupReason] = useState(null);
  const [proteinId, setProteinId] = useState(null);
  const [baseId, setBaseId] = useState(null);
  const [sideId, setSideId] = useState(null);
  const [extraIds, setExtraIds] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log("[IndividualBuilder] mount. supabase=", !!supabase, "url=", process.env.REACT_APP_SUPABASE_URL?.slice(0, 35));
    }
    if (!supabase) { setSetupReason("no-client"); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      // eslint-disable-next-line no-console
      console.log("[IndividualBuilder] starting fetch...");
      const [p, b, s, e] = await Promise.all([
        supabase.from("combo_proteins").select("*").eq("is_available", true).order("display_order"),
        supabase.from("combo_bases").select("*").eq("is_available", true).order("display_order"),
        supabase.from("combo_sides").select("*").eq("is_available", true).order("display_order"),
        supabase.from("combo_extras").select("*").eq("is_available", true).order("display_order"),
      ]);
      // eslint-disable-next-line no-console
      console.log("[IndividualBuilder] fetch done. proteins=", p.data?.length, "err=", p.error?.message, "bases=", b.data?.length, "err=", b.error?.message);
      if (cancelled) return;
      // Diagnose: only block the UI if proteins OR bases (the two required steps) fail.
      const reason = classifyError(p.error) || classifyError(b.error);
      if (reason) {
        console.error("[IndividualBuilder] supabase error:", { p: p.error, b: b.error, s: s.error, e: e.error });
        setSetupReason(reason); setLoading(false); return;
      }
      setProteins(p.data || []);
      setBases(b.data || []);
      setSides(s.data || []);
      setExtras(e.data || []);
      // If proteins fetched OK but is empty, that's a seed issue
      if ((p.data || []).length === 0) { setSetupReason("empty"); setLoading(false); return; }
      const aucun = (s.data || []).find((x) => x.name === "Aucun" || x.name_en === "None");
      if (aucun) setSideId(aucun.id);
      setSetupReason(null);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("combo-pub")
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_proteins" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_bases" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_sides" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_extras" }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  const protein = proteins.find((x) => x.id === proteinId);
  const base = bases.find((x) => x.id === baseId);
  const side = sides.find((x) => x.id === sideId);
  const chosen = extras.filter((x) => extraIds.includes(x.id));
  const total = useMemo(() => {
    let t = 0;
    if (protein) t += +protein.price;
    if (base) t += +base.price_modifier;
    chosen.forEach((x) => { t += +x.price; });
    return t;
  }, [protein, base, chosen]);

  const breakdown = useMemo(() => {
    const parts = [];
    if (protein) parts.push(`${labelOf(protein, lang)} ${fmtMoney(protein.price)}`);
    if (base) parts.push(+base.price_modifier > 0 ? `${labelOf(base, lang)} +${fmtMoney(base.price_modifier)}` : labelOf(base, lang));
    if (side && side.name !== "Aucun" && side.name_en !== "None") parts.push(labelOf(side, lang));
    chosen.forEach((x) => parts.push(`${labelOf(x, lang)} +${fmtMoney(x.price)}`));
    return parts.join("  •  ");
  }, [protein, base, side, chosen, lang]);

  const canAdd = !!protein && !!base;
  const toggleExtra = (id) => setExtraIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleAdd = () => {
    if (!canAdd) return;
    const sortedExtras = [...extraIds].sort();
    const cartId = `combo:${protein.id}:${base.id}:${side?.id || "none"}:${sortedExtras.join(",")}`;
    const parts = [labelOf(protein, lang), labelOf(base, lang)];
    if (side && side.name !== "Aucun" && side.name_en !== "None") parts.push(labelOf(side, lang));
    chosen.forEach((x) => parts.push(`+ ${labelOf(x, lang)}`));
    addItem({ id: cartId, name: parts.join(" • "), unit_price: +total.toFixed(2), image: PROTEIN_IMG[protein.name] || "" });
    setFeedback("ok");
    setTimeout(() => { setFeedback(null); openDrawer(); }, 600);
  };

  if (loading) return <Loading />;
  if (setupReason) return <SetupNeeded reason={setupReason} />;

  const T = {
    s1: lang === "fr" ? "1. Choisissez votre protéine" : "1. Choose your protein",
    s2: lang === "fr" ? "2. Choisissez votre riz"     : "2. Choose your rice",
    s3: lang === "fr" ? "3. Ajoutez un accompagnement" : "3. Add a side",
    s4: lang === "fr" ? "4. Suppléments"              : "4. Add extras",
    optional: lang === "fr" ? "(optionnel)"   : "(optional)",
    multi:    lang === "fr" ? "(plusieurs)" : "(multiple)",
    required: lang === "fr" ? "Requis" : "Required",
    optionalTag: lang === "fr" ? "Facultatif" : "Optional",
    total: lang === "fr" ? "Total" : "Total",
    breakdown: lang === "fr" ? "Détail" : "Breakdown",
    add: lang === "fr" ? "Ajouter au panier" : "Add to Cart",
    added: lang === "fr" ? "Ajouté ✓" : "Added ✓",
    chooseAll: lang === "fr" ? "Choisissez une protéine et un riz" : "Pick protein + rice to continue",
    selecting: lang === "fr" ? "Faites votre sélection..." : "Make your selection...",
    included: lang === "fr" ? "Inclus" : "Included",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Step title={T.s1} required tag={T.required}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {proteins.map((p) => (
              <SelectCard key={p.id} testid={`protein-${p.id}`}
                selected={proteinId === p.id} onClick={() => setProteinId(p.id)}
                image={PROTEIN_IMG[p.name]} title={labelOf(p, lang)} meta={fmtMoney(p.price)} />
            ))}
          </div>
        </Step>
        <Step title={T.s2} required tag={T.required}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bases.map((b) => (
              <SelectCard key={b.id} testid={`base-${b.id}`} compact
                selected={baseId === b.id} onClick={() => setBaseId(b.id)}
                title={labelOf(b, lang)} meta={+b.price_modifier > 0 ? `+${fmtMoney(b.price_modifier)}` : T.included} />
            ))}
          </div>
        </Step>
        <Step title={T.s3} subtitle={T.optional} tag={T.optionalTag}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sides.map((s) => (
              <SelectCard key={s.id} testid={`side-${s.id}`} compact
                selected={sideId === s.id} onClick={() => setSideId(s.id)} title={labelOf(s, lang)} />
            ))}
          </div>
        </Step>
        <Step title={T.s4} subtitle={T.multi} tag={T.optionalTag}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {extras.map((x) => (
              <SelectCard key={x.id} testid={`extra-${x.id}`} compact multi
                selected={extraIds.includes(x.id)} onClick={() => toggleExtra(x.id)}
                title={labelOf(x, lang)} meta={`+${fmtMoney(x.price)}`} />
            ))}
          </div>
        </Step>
      </div>
      <aside className="lg:col-span-1">
        <div className="bg-brand-black rounded-2xl p-6 lg:sticky lg:top-24 shadow-xl">
          <h3 className="font-heading text-lg text-white/70 mb-1 uppercase tracking-widest text-xs">{T.total}</h3>
          <p data-testid="combo-total" className="font-heading text-5xl font-bold text-brand-gold mb-4">{fmtMoney(total)}</p>
          <div className="border-t border-white/10 pt-4 mb-5 min-h-[3rem]">
            <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1.5">{T.breakdown}</p>
            <p data-testid="combo-breakdown" className="font-body text-sm text-white/85 leading-relaxed">{breakdown || T.selecting}</p>
          </div>
          <button onClick={handleAdd} disabled={!canAdd} data-testid="combo-add-to-cart"
            className={`w-full inline-flex items-center justify-center gap-2 font-body font-semibold py-4 rounded-xl transition-all ${
              feedback === "ok" ? "bg-brand-green text-white"
                : canAdd ? "bg-brand-orange hover:bg-brand-orange-dark text-white shadow-lg"
                         : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
            {feedback === "ok" ? <Check size={18} /> : <ShoppingBag size={18} />}
            {feedback === "ok" ? T.added : T.add}
          </button>
          {!canAdd && <p className="text-center text-[11px] text-white/50 font-body mt-3">{T.chooseAll}</p>}
        </div>
      </aside>
    </div>
  );
}

// ─── FAMILY MEAL BUILDER ─────────────────────────────────────────────────────
export function FamilyBuilder() {
  const { lang } = useLanguage();
  const { addItem, openDrawer } = useCart();
  const [proteins, setProteins] = useState([]);
  const [bases, setBases] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupReason, setSetupReason] = useState(null);
  const [proteinId, setProteinId] = useState(null);
  const [baseId, setBaseId] = useState(null);
  const [extraIds, setExtraIds] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!supabase) { setSetupReason("no-client"); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const [p, b, e] = await Promise.all([
        supabase.from("family_proteins").select("*").eq("is_available", true).order("display_order"),
        supabase.from("family_bases").select("*").eq("is_available", true).order("display_order"),
        supabase.from("combo_extras").select("*").eq("is_available", true).order("display_order"),
      ]);
      if (cancelled) return;
      const reason = classifyError(p.error) || classifyError(b.error);
      if (reason) {
        console.error("[FamilyBuilder] supabase error:", { p: p.error, b: b.error, e: e.error });
        setSetupReason(reason); setLoading(false); return;
      }
      setProteins(p.data || []); setBases(b.data || []); setExtras(e.data || []);
      if ((p.data || []).length === 0) { setSetupReason("empty"); setLoading(false); return; }
      setSetupReason(null);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("family-pub")
      .on("postgres_changes", { event: "*", schema: "public", table: "family_proteins" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "family_bases" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_extras" }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  const protein = proteins.find((x) => x.id === proteinId);
  const base = bases.find((x) => x.id === baseId);
  const chosen = extras.filter((x) => extraIds.includes(x.id));
  const total = useMemo(() => {
    let t = 0;
    if (protein) t += +protein.price;
    if (base) t += +base.price_modifier;
    chosen.forEach((x) => { t += +x.price; });
    return t;
  }, [protein, base, chosen]);
  const breakdown = useMemo(() => {
    const p = [];
    if (protein) p.push(`${labelOf(protein, lang)} ${fmtMoney(protein.price)}`);
    if (base) p.push(+base.price_modifier > 0 ? `${labelOf(base, lang)} +${fmtMoney(base.price_modifier)}` : labelOf(base, lang));
    chosen.forEach((x) => p.push(`${labelOf(x, lang)} +${fmtMoney(x.price)}`));
    return p.join("  •  ");
  }, [protein, base, chosen, lang]);
  const canAdd = !!protein && !!base;
  const toggleExtra = (id) => setExtraIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleAdd = () => {
    if (!canAdd) return;
    const sortedExtras = [...extraIds].sort();
    const cartId = `family:${protein.id}:${base.id}:${sortedExtras.join(",")}`;
    const parts = [`${labelOf(protein, lang)} (4 pers.)`, labelOf(base, lang)];
    chosen.forEach((x) => parts.push(`+ ${labelOf(x, lang)}`));
    addItem({ id: cartId, name: parts.join(" • "), unit_price: +total.toFixed(2), image: PROTEIN_IMG[protein.name] || "" });
    setFeedback("ok");
    setTimeout(() => { setFeedback(null); openDrawer(); }, 600);
  };

  if (loading) return <Loading />;
  if (setupReason) return <SetupNeeded reason={setupReason} />;

  const T = {
    badge: lang === "fr" ? "Pour 4 personnes" : "For 4 people",
    s1: lang === "fr" ? "1. Choisissez votre protéine" : "1. Choose your protein",
    s2: lang === "fr" ? "2. Choisissez votre riz" : "2. Choose your rice",
    s3: lang === "fr" ? "3. Suppléments" : "3. Add extras",
    optional: lang === "fr" ? "(plusieurs)" : "(multiple)",
    required: lang === "fr" ? "Requis" : "Required",
    optionalTag: lang === "fr" ? "Facultatif" : "Optional",
    total: lang === "fr" ? "Total" : "Total",
    breakdown: lang === "fr" ? "Détail" : "Breakdown",
    add: lang === "fr" ? "Ajouter au panier" : "Add to Cart",
    added: lang === "fr" ? "Ajouté ✓" : "Added ✓",
    chooseAll: lang === "fr" ? "Choisissez une protéine et un riz" : "Pick protein + rice",
    selecting: lang === "fr" ? "Faites votre sélection..." : "Make your selection...",
    included: lang === "fr" ? "Inclus" : "Included",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30 rounded-full px-4 py-1.5 text-xs font-body font-semibold uppercase tracking-wider">
          <span>👨‍👩‍👧‍👦</span> {T.badge}
        </div>
        <Step title={T.s1} required tag={T.required}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {proteins.map((p) => (
              <SelectCard key={p.id} testid={`fam-protein-${p.id}`}
                selected={proteinId === p.id} onClick={() => setProteinId(p.id)}
                image={PROTEIN_IMG[p.name]} title={labelOf(p, lang)} meta={fmtMoney(p.price)} />
            ))}
          </div>
        </Step>
        <Step title={T.s2} required tag={T.required}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bases.map((b) => (
              <SelectCard key={b.id} testid={`fam-base-${b.id}`} compact
                selected={baseId === b.id} onClick={() => setBaseId(b.id)}
                title={labelOf(b, lang)} meta={+b.price_modifier > 0 ? `+${fmtMoney(b.price_modifier)}` : T.included} />
            ))}
          </div>
        </Step>
        <Step title={T.s3} subtitle={T.optional} tag={T.optionalTag}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {extras.map((x) => (
              <SelectCard key={x.id} testid={`fam-extra-${x.id}`} compact multi
                selected={extraIds.includes(x.id)} onClick={() => toggleExtra(x.id)}
                title={labelOf(x, lang)} meta={`+${fmtMoney(x.price)}`} />
            ))}
          </div>
        </Step>
      </div>
      <aside className="lg:col-span-1">
        <div className="bg-brand-black rounded-2xl p-6 lg:sticky lg:top-24 shadow-xl">
          <h3 className="font-heading text-lg text-white/70 mb-1 uppercase tracking-widest text-xs">{T.total}</h3>
          <p data-testid="family-total" className="font-heading text-5xl font-bold text-brand-gold mb-4">{fmtMoney(total)}</p>
          <div className="border-t border-white/10 pt-4 mb-5 min-h-[3rem]">
            <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1.5">{T.breakdown}</p>
            <p className="font-body text-sm text-white/85 leading-relaxed">{breakdown || T.selecting}</p>
          </div>
          <button onClick={handleAdd} disabled={!canAdd} data-testid="family-add-to-cart"
            className={`w-full inline-flex items-center justify-center gap-2 font-body font-semibold py-4 rounded-xl transition-all ${
              feedback === "ok" ? "bg-brand-green text-white"
                : canAdd ? "bg-brand-orange hover:bg-brand-orange-dark text-white shadow-lg"
                         : "bg-white/10 text-white/40 cursor-not-allowed"}`}>
            {feedback === "ok" ? <Check size={18} /> : <ShoppingBag size={18} />}
            {feedback === "ok" ? T.added : T.add}
          </button>
          {!canAdd && <p className="text-center text-[11px] text-white/50 font-body mt-3">{T.chooseAll}</p>}
        </div>
      </aside>
    </div>
  );
}

// ─── DRINKS ─────────────────────────────────────────────────────────────────
export function DrinksMenu() {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupReason, setSetupReason] = useState(null);

  useEffect(() => {
    if (!supabase) { setSetupReason("no-client"); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const [c, i] = await Promise.all([
        supabase.from("drinks_categories").select("*").eq("is_available", true).order("display_order"),
        supabase.from("drinks_items").select("*").eq("is_available", true).order("display_order"),
      ]);
      if (cancelled) return;
      const reason = classifyError(c.error) || classifyError(i.error);
      if (reason) {
        console.error("[DrinksMenu] supabase error:", { c: c.error, i: i.error });
        setSetupReason(reason); setLoading(false); return;
      }
      setCats(c.data || []); setItems(i.data || []);
      if ((c.data || []).length === 0) { setSetupReason("empty"); setLoading(false); return; }
      if ((c.data || []).length && !active) setActive(c.data[0].id);
      setSetupReason(null);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("drinks-pub")
      .on("postgres_changes", { event: "*", schema: "public", table: "drinks_categories" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "drinks_items" }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, []);

  if (loading) return <Loading />;
  if (setupReason) return <SetupNeeded reason={setupReason} />;

  const visible = items.filter((x) => x.category_id === active);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} data-testid={`drink-cat-${c.id}`}
            className={`px-4 py-2 rounded-md text-sm font-body font-semibold transition-colors ${
              active === c.id ? "bg-brand-orange text-white" : "bg-white text-brand-text border border-brand-border hover:border-brand-orange"}`}>
            {labelOf(c, lang)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="text-center py-10 text-brand-text font-body">
          {lang === "fr" ? "Aucune boisson dans cette catégorie." : "No drinks in this category."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map((d) => <DrinkCard key={d.id} item={d} lang={lang} addItem={addItem} />)}
        </div>
      )}
    </div>
  );
}
function DrinkCard({ item, lang, addItem }) {
  const [adding, setAdding] = useState(false);
  const handleAdd = () => {
    addItem({ id: `drink:${item.id}`, name: labelOf(item, lang), unit_price: +item.price, image: DRINK_IMG });
    setAdding(true); setTimeout(() => setAdding(false), 700);
  };
  return (
    <div data-testid={`drink-${item.id}`} className="bg-white rounded-xl border border-brand-border overflow-hidden hover:shadow-md transition-all flex flex-col animate-fadeIn">
      <div className="h-32 bg-gradient-to-br from-brand-cream to-brand-gold/20 flex items-center justify-center">
        <Coffee size={42} className="text-brand-orange/60" />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-heading text-sm font-semibold text-brand-black flex-1 leading-tight">{labelOf(item, lang)}</h4>
        <div className="flex items-center justify-between mt-3">
          <span className="font-heading text-lg font-bold text-brand-orange">{fmtMoney(item.price)}</span>
          <button onClick={handleAdd} data-testid={`add-drink-${item.id}`}
            className={`px-3 py-1.5 rounded-md text-xs font-body font-semibold inline-flex items-center gap-1 transition-colors ${
              adding ? "bg-brand-green text-white" : "bg-brand-orange hover:bg-brand-orange-dark text-white"}`}>
            <Plus size={12} />{adding ? (lang === "fr" ? "Ajouté" : "Added") : (lang === "fr" ? "Ajouter" : "Add")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DESSERTS ───────────────────────────────────────────────────────────────
export function DessertsMenu() {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupReason, setSetupReason] = useState(null);

  useEffect(() => {
    if (!supabase) { setSetupReason("no-client"); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const r = await supabase.from("desserts").select("*").eq("is_available", true).order("display_order");
      if (cancelled) return;
      const reason = classifyError(r.error);
      if (reason) {
        console.error("[DessertsMenu] supabase error:", r.error);
        setSetupReason(reason); setLoading(false); return;
      }
      setItems(r.data || []);
      setSetupReason(null);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("desserts-pub")
      .on("postgres_changes", { event: "*", schema: "public", table: "desserts" }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  if (loading) return <Loading />;
  if (setupReason) return <SetupNeeded reason={setupReason} />;
  if (items.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <IceCreamCone className="mx-auto mb-3 text-brand-border" size={42} />
        <h3 className="font-heading text-2xl font-bold text-brand-black mb-2">
          {lang === "fr" ? "Revenez bientôt !" : "Coming soon!"}
        </h3>
        <p className="font-body text-brand-text">
          {lang === "fr" ? "De délicieux desserts arrivent bientôt." : "Delicious desserts are on their way."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((d) => (
        <div key={d.id} data-testid={`dessert-${d.id}`} className="bg-white rounded-xl border border-brand-border overflow-hidden hover:shadow-md transition-all flex flex-col animate-fadeIn">
          <div className="h-44 overflow-hidden bg-brand-cream">
            <img src={d.image_url || DESSERT_FALLBACK} alt={labelOf(d, lang)} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h4 className="font-heading text-lg font-semibold text-brand-black">{labelOf(d, lang)}</h4>
            {d.description && <p className="font-body text-sm text-brand-text mt-1 leading-relaxed flex-1">{d.description}</p>}
            <div className="flex items-center justify-between mt-3">
              <span className="font-heading text-xl font-bold text-brand-orange">{fmtMoney(d.price)}</span>
              <DessertAddBtn item={d} lang={lang} addItem={addItem} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function DessertAddBtn({ item, lang, addItem }) {
  const [adding, setAdding] = useState(false);
  const handle = () => {
    addItem({ id: `dessert:${item.id}`, name: labelOf(item, lang), unit_price: +item.price, image: item.image_url || DESSERT_FALLBACK });
    setAdding(true); setTimeout(() => setAdding(false), 700);
  };
  return (
    <button onClick={handle} data-testid={`add-dessert-${item.id}`}
      className={`px-3 py-2 rounded-md text-xs font-body font-semibold inline-flex items-center gap-1 transition-colors ${
        adding ? "bg-brand-green text-white" : "bg-brand-orange hover:bg-brand-orange-dark text-white"}`}>
      <Plus size={12} />{adding ? (lang === "fr" ? "Ajouté" : "Added") : (lang === "fr" ? "Ajouter" : "Add")}
    </button>
  );
}
