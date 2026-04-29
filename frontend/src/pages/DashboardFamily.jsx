import { Users, Salad } from "lucide-react";
import { useTable, ErrorBox, Section, CrudTable } from "../components/dashboardCrud";

export default function DashboardFamily() {
  const proteins = useTable("family_proteins");
  const bases    = useTable("family_bases");

  if (proteins.loading || bases.loading)
    return <div className="text-brand-text font-body text-sm">Loading…</div>;
  const err = proteins.error || bases.error;
  if (err) return <ErrorBox message={err} />;

  const cols = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "price", label: "Price", type: "money" },
    { key: "image_url", label: "Image URL", type: "text" },
    { key: "display_order", label: "Order", type: "int" },
  ];
  const colsMod = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "price_modifier", label: "Modifier", type: "money" },
    { key: "display_order", label: "Order", type: "int" },
  ];

  return (
    <div data-testid="dashboard-family" className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-black">Repas Familiaux</h1>
        <p className="font-body text-sm text-brand-text">Manage proteins &amp; rice bases for family meal combos (serves 4).</p>
      </div>

      <Section icon={Users} title="Family Proteins" subtitle="Base price for a family meal">
        <CrudTable rows={proteins.rows} columns={cols} table="family_proteins" onUpdate={proteins.update} />
      </Section>

      <Section icon={Salad} title="Family Bases" subtitle="Rice options">
        <CrudTable rows={bases.rows} columns={colsMod} table="family_bases" onUpdate={bases.update} />
      </Section>
    </div>
  );
}
