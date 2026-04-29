import { useState } from "react";
import { Coffee, FolderTree } from "lucide-react";
import { useTable, ErrorBox, Section, CrudTable, NewRowForm, AddBtn } from "../components/dashboardCrud";

export default function DashboardDrinks() {
  const cats   = useTable("drinks_categories");
  const items  = useTable("drinks_items");
  const [addingCat, setAddingCat] = useState(false);
  const [addingItemFor, setAddingItemFor] = useState(null);

  if (cats.loading || items.loading) return <div className="text-brand-text font-body text-sm">Loading…</div>;
  const err = cats.error || items.error;
  if (err) return <ErrorBox message={err} />;

  const catCols = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "display_order", label: "Order", type: "int" },
  ];
  const itemCols = [
    { key: "name", label: "Name (FR)", type: "text" },
    { key: "name_en", label: "Name (EN)", type: "text" },
    { key: "price", label: "Price", type: "money" },
    { key: "image_url", label: "Image URL", type: "text" },
    { key: "display_order", label: "Order", type: "int" },
  ];

  return (
    <div data-testid="dashboard-drinks" className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-black">Boissons</h1>
        <p className="font-body text-sm text-brand-text">Manage drink categories and individual drinks.</p>
      </div>

      <Section icon={FolderTree} title="Categories" subtitle="Top-level drink categories">
        <CrudTable rows={cats.rows} columns={catCols} table="drinks_categories"
          onUpdate={cats.update} onDelete={cats.remove} allowDelete
          addBtn={!addingCat && <AddBtn label="Add Category" onClick={() => setAddingCat(true)} testid="drinks_cat-add" />} />
        {addingCat && (
          <NewRowForm columns={catCols}
            onSave={async (p) => { if (await cats.insert(p)) setAddingCat(false); }}
            onCancel={() => setAddingCat(false)} />
        )}
      </Section>

      {cats.rows.map((c) => {
        const list = items.rows.filter((i) => i.category_id === c.id);
        return (
          <Section key={c.id} icon={Coffee} title={c.name} subtitle={`${list.length} drink${list.length !== 1 ? "s" : ""}`}>
            <CrudTable rows={list} columns={itemCols} table="drinks_items"
              onUpdate={items.update} onDelete={items.remove} allowDelete
              addBtn={addingItemFor !== c.id && <AddBtn label="Add Drink" onClick={() => setAddingItemFor(c.id)} testid={`drinks_item-add-${c.id}`} />} />
            {addingItemFor === c.id && (
              <NewRowForm columns={itemCols}
                onSave={async (p) => { if (await items.insert({ ...p, category_id: c.id })) setAddingItemFor(null); }}
                onCancel={() => setAddingItemFor(null)} />
            )}
          </Section>
        );
      })}
    </div>
  );
}
