import { useState } from "react";
import { IceCreamCone } from "lucide-react";
import { useTable, ErrorBox, Section, CrudTable, NewRowForm, AddBtn } from "../components/dashboardCrud";

export default function DashboardDesserts() {
  const desserts = useTable("desserts");
  const [adding, setAdding] = useState(false);

  if (desserts.loading) return <div className="text-brand-text font-body text-sm">Loading…</div>;
  if (desserts.error) return <ErrorBox message={desserts.error} />;

  const cols = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "price", label: "Price", type: "money" },
    { key: "image_url", label: "Image URL", type: "text" },
    { key: "display_order", label: "Order", type: "int" },
  ];

  return (
    <div data-testid="dashboard-desserts" className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-black">Desserts</h1>
        <p className="font-body text-sm text-brand-text">Add and manage dessert offerings — they appear on the public Desserts tab in real time.</p>
      </div>

      <Section icon={IceCreamCone} title="Desserts" subtitle={`${desserts.rows.length} item${desserts.rows.length !== 1 ? "s" : ""}`}>
        <CrudTable rows={desserts.rows} columns={cols} table="desserts"
          onUpdate={desserts.update} onDelete={desserts.remove} allowDelete
          addBtn={!adding && <AddBtn label="Add Dessert" onClick={() => setAdding(true)} testid="desserts-add" />} />
        {adding && (
          <NewRowForm columns={cols}
            onSave={async (p) => { if (await desserts.insert(p)) setAdding(false); }}
            onCancel={() => setAdding(false)} />
        )}
      </Section>
    </div>
  );
}
