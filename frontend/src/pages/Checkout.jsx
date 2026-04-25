import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { restaurantConfig } from "../restaurant.config";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { lang } = useLanguage();

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    order_type: "pickup",
    delivery_address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stripeMissing, setStripeMissing] = useState(false);

  const T = {
    title:    lang === "fr" ? "Paiement" : "Checkout",
    back:     lang === "fr" ? "Retour au menu" : "Back to Menu",
    summary:  lang === "fr" ? "Récapitulatif de commande" : "Order Summary",
    empty:    lang === "fr" ? "Votre panier est vide." : "Your cart is empty.",
    browse:   lang === "fr" ? "Parcourir le menu" : "Browse Menu",
    customer: lang === "fr" ? "Vos coordonnées" : "Your Details",
    name:     lang === "fr" ? "Nom complet" : "Full Name",
    email:    lang === "fr" ? "Adresse e-mail" : "Email Address",
    phone:    lang === "fr" ? "Téléphone" : "Phone Number",
    type:     lang === "fr" ? "Type de commande" : "Order Type",
    pickup:   lang === "fr" ? "À emporter" : "Pickup",
    delivery: lang === "fr" ? "Livraison" : "Delivery",
    address:  lang === "fr" ? "Adresse de livraison" : "Delivery Address",
    notes:    lang === "fr" ? "Notes (allergies, instructions...)" : "Notes (allergies, instructions...)",
    pay:      lang === "fr" ? "Payer avec Stripe" : "Pay with Stripe",
    notReady: lang === "fr" ? "Stripe n'est pas configuré — votre commande a été enregistrée." : "Stripe is not configured — your order has been saved.",
    pickupTime:   lang === "fr" ? `Prêt en ${restaurantConfig.estimatedPickupTime}` : `Ready in ${restaurantConfig.estimatedPickupTime}`,
    deliveryTime: lang === "fr" ? `Livré en ${restaurantConfig.estimatedDeliveryTime}` : `Delivered in ${restaurantConfig.estimatedDeliveryTime}`,
    total:    lang === "fr" ? "Total" : "Total",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) { setError(T.empty); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          unit_price: parseFloat(i.unit_price),
          quantity: i.quantity,
          image: i.image || null,
        })),
        subtotal: Number(totalPrice.toFixed(2)),
      };
      const res = await fetch(`${BACKEND_URL}/api/checkout/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Checkout failed");

      if (data.stripe_configured && data.checkout_url) {
        clearCart();
        window.location.href = data.checkout_url;
      } else {
        // Stripe not configured: order is saved, show success state
        setStripeMissing(true);
        clearCart();
        setTimeout(() => navigate(`/order-confirmation?order_id=${data.order_id}`), 1200);
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !stripeMissing) {
    return (
      <main className="min-h-screen bg-brand-cream pt-32 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <ShoppingBag className="mx-auto mb-4 text-brand-border" size={56} />
          <h1 className="font-heading text-3xl font-bold text-brand-black mb-3">{T.empty}</h1>
          <button
            onClick={() => navigate("/menu")}
            data-testid="empty-browse-btn"
            className="mt-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {T.browse}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <button
          onClick={() => navigate("/menu")}
          data-testid="checkout-back-btn"
          className="inline-flex items-center gap-2 text-brand-text hover:text-brand-orange font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> {T.back}
        </button>
        <h1 data-testid="checkout-title" className="font-heading text-4xl md:text-5xl font-bold text-brand-black mb-8">{T.title}</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-2xl border border-brand-border p-6 lg:p-8 shadow-sm space-y-5" data-testid="checkout-form">
            <h2 className="font-heading text-xl font-semibold text-brand-black mb-2">{T.customer}</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={T.name} required>
                <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} data-testid="checkout-name-input" className="checkout-input" />
              </Field>
              <Field label={T.phone} required>
                <input required type="tel" value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} data-testid="checkout-phone-input" className="checkout-input" />
              </Field>
            </div>
            <Field label={T.email} required>
              <input required type="email" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})} data-testid="checkout-email-input" className="checkout-input" />
            </Field>

            <div>
              <label className="block text-sm font-body font-medium text-brand-black mb-2">{T.type} *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "pickup", label: T.pickup, time: T.pickupTime },
                  { id: "delivery", label: T.delivery, time: T.deliveryTime },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`order-type-${opt.id}`}
                    onClick={() => setForm({...form, order_type: opt.id})}
                    className={`p-4 rounded-xl border text-left transition-all ${form.order_type === opt.id ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/30" : "border-brand-border hover:border-brand-orange/40"}`}
                  >
                    <div className="font-body font-semibold text-brand-black">{opt.label}</div>
                    <div className="text-xs font-body text-brand-text mt-0.5">{opt.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {form.order_type === "delivery" && (
              <Field label={T.address} required>
                <input
                  required
                  value={form.delivery_address}
                  onChange={(e) => setForm({...form, delivery_address: e.target.value})}
                  data-testid="checkout-address-input"
                  placeholder="11866 Bd Rivière-des-Prairies, Montréal..."
                  className="checkout-input"
                />
              </Field>
            )}

            <Field label={T.notes}>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                data-testid="checkout-notes-input"
                className="checkout-input resize-none"
              />
            </Field>

            {error && (
              <div data-testid="checkout-error" className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>
            )}
            {stripeMissing && (
              <div data-testid="checkout-stripe-missing" className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm font-body">{T.notReady}</div>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              data-testid="checkout-submit-btn"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-body font-semibold py-4 rounded-xl transition-colors"
            >
              {submitting && <Loader2 className="animate-spin" size={18} />}
              {T.pay} →
            </button>
          </form>

          {/* Summary */}
          <aside className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm sticky top-24">
              <h2 className="font-heading text-xl font-semibold text-brand-black mb-4">{T.summary}</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between gap-3 pb-3 border-b border-brand-border last:border-0">
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-sm text-brand-black truncate">{i.name}</p>
                      <p className="font-body text-xs text-brand-text">${parseFloat(i.unit_price).toFixed(2)} × {i.quantity}</p>
                    </div>
                    <p className="font-body font-bold text-sm text-brand-black whitespace-nowrap">${(parseFloat(i.unit_price) * i.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border pt-4 mt-4 flex justify-between items-center">
                <span className="font-body font-semibold text-brand-black">{T.total}</span>
                <span className="font-heading font-bold text-2xl text-brand-orange" data-testid="checkout-total">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .checkout-input { width: 100%; border: 1px solid var(--brand-border, #e5e7eb); border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: inherit; font-size: 0.875rem; outline: none; transition: all 0.2s; background: white; }
        .checkout-input:focus { border-color: #D84315; box-shadow: 0 0 0 3px rgba(216,67,21,0.15); }
      `}</style>
    </main>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-body font-medium text-brand-black mb-1.5">
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}
