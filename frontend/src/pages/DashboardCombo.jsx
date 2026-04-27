import { ChefHat, Salad, Sandwich, Cookie } from "lucide-react";
import { useTable, ErrorBox, Section, CrudTable, NewRowForm, AddBtn } from "../components/dashboardCrud";
import { useState } from "react";

export default function DashboardCombo() {
  const proteins = useTable("combo_proteins");
  const bases    = useTable("combo_bases");
  const sides    = useTable("combo_sides");
  const extras   = useTable("combo_extras");
  const [adding, setAdding] = useState(false);

  if (proteins.loading || bases.loading || sides.loading || extras.loading)
    return <div className="text-brand-text font-body text-sm">Loading…</div>;
  const err = proteins.error || bases.error || sides.error || extras.error;
  if (err) return <ErrorBox message={err} />;

  const cols = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "price", label: "Price", type: "money" },
    { key: "display_order", label: "Order", type: "int" },
  ];
  const colsMod = [...cols.slice(0,2), { key: "price_modifier", label: "Modifier", type: "money" }, cols[3]];
  const colsSimple = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "display_order", label: "Order", type: "int" },
  ];
  const colsExtra = cols;

  return (
    <div data-testid="dashboard-combo" className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-black">Plats — Combo Builder</h1>
        <p className="font-body text-sm text-brand-text">Manage proteins, rice bases, sides &amp; extras for individual combos.</p>
      </div>

      <Section icon={ChefHat} title="Proteins" subtitle="Step 1 of the combo">
        <CrudTable rows={proteins.rows} columns={cols} table="combo_proteins"
          onUpdate={proteins.update} />
      </Section>

      <Section icon={Salad} title="Rice Bases" subtitle="Step 2">
        <CrudTable rows={bases.rows} columns={colsMod} table="combo_bases"
          onUpdate={bases.update} />
      </Section>

      <Section icon={Sandwich} title="Sides" subtitle="Step 3 — second side option">
        <CrudTable rows={sides.rows} columns={colsSimple} table="combo_sides"
          onUpdate={sides.update} />
      </Section>

      <Section icon={Cookie} title="Extras" subtitle="Step 4 — multiple selectable">
        <CrudTable rows={extras.rows} columns={colsExtra} table="combo_extras"
          onUpdate={extras.update} onDelete={extras.remove} allowDelete
          addBtn={!adding && <AddBtn label="Add Extra" onClick={() => setAdding(true)} testid="combo_extras-add" />} />
        {adding && (
          <NewRowForm columns={colsExtra}
            onSave={async (p) => { if (await extras.insert(p)) setAdding(false); }}
            onCancel={() => setAdding(false)} />
        )}
      </Section>
    </div>
  );
}
