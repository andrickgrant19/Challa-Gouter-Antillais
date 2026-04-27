import { useEffect, useMemo, useState } from "react";
import { Check, Plus, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

// Heuristic image fallback for protein cards. Owner can later add image_url to combo_proteins if desired.
const PROTEIN_IMG = {
  Griot:          "https://images.pexels.com/photos/9609848/pexels-photo-9609848.jpeg?auto=compress&cs=tinysrgb&w=600",
  Poulet:         "https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg?auto=compress&cs=tinysrgb&w=600",
  Dinde:          "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=600",
  "Poisson Frit": "https://images.pexels.com/photos/3296434/pexels-photo-3296434.jpeg?auto=compress&cs=tinysrgb&w=600",
  Légume:         "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600",
};

export default function ComboBuilder() {
  const { lang } = useLanguage();
  const { addItem, openDrawer } = useCart();

  const [proteins, setProteins] = useState([]);
  const [sides, setSides]       = useState([]);
  const [extras, setExtras]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const [proteinId, setProteinId] = useState(null);
  const [baseId, setBaseId]       = useState(null);
  const [sideId, setSideId]       = useState(null);
  const [extraIds, setExtraIds]   = useState([]);
  const [feedback, setFeedback]   = useState(null);

  const T = {
    title:    lang === "fr" ? "Composez votre combo" : "Build Your Combo",
    subtitle: lang === "fr" ? "Personnalisez votre repas en 4 étapes simples" : "Customize your meal in 4 simple steps",
    step1:    lang === "fr" ? "1. Choisissez votre protéine" : "1. Choose your protein",
    step2:    lang === "fr" ? "2. Choisissez votre riz" : "2. Choose your rice",
    step3:    lang === "fr" ? "3. Ajoutez un accompagnement" : "3. Add a side",
    step3sub: lang === "fr" ? "(optionnel)" : "(optional)",
    step4:    lang === "fr" ? "4. Suppléments" : "4. Add extras",
    step4sub: lang === "fr" ? "(plusieurs choix possibles)" : "(multiple choices)",
    required: lang === "fr" ? "Requis" : "Required",
    optional: lang === "fr" ? "Facultatif" : "Optional",
    breakdown:lang === "fr" ? "Détail" : "Breakdown",
    total:    lang === "fr" ? "Total" : "Total",
    add:      lang === "fr" ? "Ajouter au panier" : "Add to Cart",
    added:    lang === "fr" ? "Combo ajouté ✓" : "Combo added ✓",
    chooseAll:lang === "fr" ? "Choisissez une protéine et un riz pour continuer" : "Pick a protein and a rice to continue",
    none:     lang === "fr" ? "Aucun" : "None",
    setupNeeded: lang === "fr"
      ? "Le constructeur de combo n'est pas encore configuré. Le propriétaire doit exécuter la migration Supabase."
      : "Combo builder is not configured yet. The owner needs to run the Supabase migration.",
  };

  const label = (row) => (lang === "fr" ? row.name : row.name_en || row.name);

  useEffect(() => {
    if (!supabase) { setError(T.setupNeeded); setLoading(false); return; }
    let cancelled = false;

    const fetchAll = async () => {
      const [p, s, e] = await Promise.all([
        supabase.from("combo_proteins").select("*").eq("is_available", true).order("display_order"),
        supabase.from("combo_sides").select("*").eq("is_available", true).order("display_order"),
        supabase.from("combo_extras").select("*").eq("is_available", true).order("display_order"),
      ]);
      if (cancelled) return;
      const errMsg = p.error?.message || s.error?.message || e.error?.message;
      if (errMsg) {
        setError(errMsg.includes("Could not find") ? T.setupNeeded : errMsg);
        setLoading(false); return;
      }
      setProteins(p.data || []);
      setSides(s.data || []);
      setExtras(e.data || []);
      setLoading(false);
      // Pre-select "Aucun" side when available
      const aucun = (s.data || []).find((x) => x.side_type === "side" && (x.name === "Aucun" || x.name_en === "None"));
      if (aucun) setSideId(aucun.id);
    };

    fetchAll();

    const ch = supabase
      .channel("combo-public-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_proteins" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_sides" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "combo_extras" }, fetchAll)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const bases = sides.filter((s) => s.side_type === "base");
  const secondary = sides.filter((s) => s.side_type === "side");

  const protein = proteins.find((p) => p.id === proteinId) || null;
  const base    = bases.find((b) => b.id === baseId)       || null;
  const side    = secondary.find((s) => s.id === sideId)   || null;
  const chosenExtras = extras.filter((e) => extraIds.includes(e.id));

  const total = useMemo(() => {
    let t = 0;
    if (protein) t += parseFloat(protein.price);
    if (base)    t += parseFloat(base.price_modifier);
    chosenExtras.forEach((e) => { t += parseFloat(e.price); });
    return t;
  }, [protein, base, chosenExtras]);

  const breakdown = useMemo(() => {
    const parts = [];
    if (protein) parts.push(`${label(protein)} $${Number(protein.price).toFixed(2)}`);
    if (base) {
      const mod = parseFloat(base.price_modifier);
      parts.push(mod > 0 ? `${label(base)} +$${mod.toFixed(2)}` : label(base));
    }
    if (side && side.name !== "Aucun" && side.name_en !== "None") parts.push(label(side));
    chosenExtras.forEach((e) => parts.push(`${label(e)} +$${Number(e.price).toFixed(2)}`));
    return parts.join("  •  ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protein, base, side, chosenExtras, lang]);

  const canAdd = protein && base;

  const toggleExtra = (id) => {
    setExtraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAdd = () => {
    if (!canAdd) return;
    const sortedExtraIds = [...extraIds].sort();
    // Stable id -> identical combos merge in cart
    const cartId = `combo:${protein.id}:${base.id}:${side?.id || "none"}:${sortedExtraIds.join(",")}`;
    const nameParts = [label(protein), label(base)];
    if (side && side.name !== "Aucun" && side.name_en !== "None") nameParts.push(label(side));
    chosenExtras.forEach((e) => nameParts.push(`+ ${label(e)}`));
    const cartName = nameParts.join(" • ");
    addItem({ id: cartId, name: cartName, unit_price: Number(total.toFixed(2)), image: PROTEIN_IMG[protein.name] || "" });
    setFeedback("ok");
    setTimeout(() => { setFeedback(null); openDrawer(); }, 600);
  };

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16 text-center">
        <Loader2 className="animate-spin mx-auto text-brand-orange mb-3" size={32} />
        <p className="font-body text-brand-text">{lang === "fr" ? "Chargement…" : "Loading…"}</p>
      </section>
    );
  }
  if (error || proteins.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <AlertCircle className="mx-auto text-amber-600 mb-3" size={32} />
          <p className="font-body text-amber-900">{error || T.setupNeeded}</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="combo-builder" className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-10">
        <span className="gold-divider mb-4 inline-block" />
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black mb-2">{T.title}</h2>
        <p className="font-body text-brand-text">{T.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Steps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1 — Protein */}
          <Step number={T.step1} required tag={T.required}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {proteins.map((p) => (
                <SelectCard
                  key={p.id}
                  testid={`protein-${p.id}`}
                  selected={proteinId === p.id}
                  onClick={() => setProteinId(p.id)}
                  image={PROTEIN_IMG[p.name]}
                  title={label(p)}
                  meta={`$${Number(p.price).toFixed(2)}`}
                />
              ))}
            </div>
          </Step>

          {/* Step 2 — Base */}
          <Step number={T.step2} required tag={T.required}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {bases.map((b) => {
                const mod = parseFloat(b.price_modifier);
                return (
                  <SelectCard
                    key={b.id}
                    testid={`base-${b.id}`}
                    selected={baseId === b.id}
                    onClick={() => setBaseId(b.id)}
                    title={label(b)}
                    meta={mod > 0 ? `+$${mod.toFixed(2)}` : (lang === "fr" ? "Inclus" : "Included")}
                  />
                );
              })}
            </div>
          </Step>

          {/* Step 3 — Side */}
          <Step number={T.step3} subtitle={T.step3sub} tag={T.optional}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {secondary.map((s) => (
                <SelectCard
                  key={s.id}
                  testid={`side-${s.id}`}
                  selected={sideId === s.id}
                  onClick={() => setSideId(s.id)}
                  title={label(s)}
                  compact
                />
              ))}
            </div>
          </Step>

          {/* Step 4 — Extras */}
          <Step number={T.step4} subtitle={T.step4sub} tag={T.optional}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {extras.map((e) => (
                <SelectCard
                  key={e.id}
                  testid={`extra-${e.id}`}
                  selected={extraIds.includes(e.id)}
                  onClick={() => toggleExtra(e.id)}
                  title={label(e)}
                  meta={`+$${Number(e.price).toFixed(2)}`}
                  multi
                />
              ))}
            </div>
          </Step>
        </div>

        {/* Live total */}
        <aside className="lg:col-span-1">
          <div className="bg-brand-black rounded-2xl p-6 lg:sticky lg:top-24 shadow-xl">
            <h3 className="font-heading text-lg text-white/70 mb-1 uppercase tracking-widest text-xs">{T.total}</h3>
            <p data-testid="combo-total" className="font-heading text-5xl font-bold text-brand-gold mb-4">${total.toFixed(2)}</p>
            <div className="border-t border-white/10 pt-4 mb-5 min-h-[3rem]">
              <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1.5">{T.breakdown}</p>
              <p data-testid="combo-breakdown" className="font-body text-sm text-white/85 leading-relaxed">
                {breakdown || (lang === "fr" ? "Faites votre sélection..." : "Make your selection...")}
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              data-testid="combo-add-to-cart"
              className={`w-full inline-flex items-center justify-center gap-2 font-body font-semibold py-4 rounded-xl transition-all ${
                feedback === "ok"
                  ? "bg-brand-green text-white"
                  : canAdd
                    ? "bg-brand-orange hover:bg-brand-orange-dark text-white -translate-y-0 hover:-translate-y-0.5 shadow-lg"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {feedback === "ok" ? <Check size={18} /> : <ShoppingBag size={18} />}
              {feedback === "ok" ? T.added : T.add}
            </button>
            {!canAdd && (
              <p className="text-center text-[11px] text-white/50 font-body mt-3">{T.chooseAll}</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Step({ number, subtitle, tag, required, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-black">
          {number} {subtitle && <span className="text-brand-text font-normal text-sm">{subtitle}</span>}
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

function SelectCard({ testid, selected, onClick, image, title, meta, compact = false, multi = false }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`relative text-left rounded-xl border-2 transition-all ${
        selected
          ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20"
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
        {meta && <div className={`font-body text-xs mt-0.5 ${selected ? "text-brand-orange font-semibold" : "text-brand-text"}`}>{meta}</div>}
      </div>
      {selected && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center shadow">
          {multi ? <Plus size={12} className="text-white rotate-45" /> : <Check size={14} className="text-white" />}
        </span>
      )}
    </button>
  );
}
