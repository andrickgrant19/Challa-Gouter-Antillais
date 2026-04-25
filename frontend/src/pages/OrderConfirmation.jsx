import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, Phone, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { restaurantConfig } from "../restaurant.config";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = params.get("session_id");
  const orderId = params.get("order_id");

  const T = {
    success:  lang === "fr" ? "Commande confirmée!" : "Order Confirmed!",
    pending:  lang === "fr" ? "Récupération de votre commande..." : "Retrieving your order...",
    thanks:   lang === "fr" ? "Merci pour votre commande!" : "Thank you for your order!",
    refTxt:   lang === "fr" ? "Numéro de référence" : "Reference number",
    detailsTitle: lang === "fr" ? "Détails de la commande" : "Order Details",
    items:    lang === "fr" ? "Articles" : "Items",
    type:     lang === "fr" ? "Type" : "Type",
    pickup:   lang === "fr" ? "À emporter" : "Pickup",
    delivery: lang === "fr" ? "Livraison" : "Delivery",
    pickupTime:   lang === "fr" ? `Votre commande sera prête en environ ${restaurantConfig.estimatedPickupTime}.` : `Your order will be ready in about ${restaurantConfig.estimatedPickupTime}.`,
    deliveryTime: lang === "fr" ? `Votre commande sera livrée en environ ${restaurantConfig.estimatedDeliveryTime}.` : `Your order will be delivered in about ${restaurantConfig.estimatedDeliveryTime}.`,
    questions: lang === "fr" ? "Des questions?" : "Questions?",
    callUs:    lang === "fr" ? "Appelez-nous" : "Call us",
    home:      lang === "fr" ? "Retour à l'accueil" : "Back to Home",
    notFound:  lang === "fr" ? "Commande introuvable." : "Order not found.",
    total:     lang === "fr" ? "Total" : "Total",
    notes:     lang === "fr" ? "Notes" : "Notes",
  };

  useEffect(() => {
    if (!sessionId && !orderId) { setError(T.notFound); setLoading(false); return; }

    const url = sessionId
      ? `${BACKEND_URL}/api/orders/by-session/${sessionId}`
      : `${BACKEND_URL}/api/orders/${orderId}`;

    let attempts = 0;
    const fetchOrder = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setOrder(data);
        setLoading(false);
      } catch {
        attempts += 1;
        if (attempts < 5) setTimeout(fetchOrder, 1500);
        else { setError(T.notFound); setLoading(false); }
      }
    };
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-cream pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-brand-orange mb-3" size={36} />
          <p className="font-body text-brand-text">{T.pending}</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-brand-cream pt-32 pb-20 text-center px-6">
        <h1 className="font-heading text-3xl font-bold text-brand-black mb-3">{T.notFound}</h1>
        <Link to="/" className="text-brand-orange hover:underline font-body">{T.home}</Link>
      </main>
    );
  }

  const isDelivery = order.order_type === "delivery";
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <main className="min-h-screen bg-brand-cream pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Success hero */}
        <div className="bg-white rounded-2xl border border-brand-border p-8 text-center shadow-sm mb-6" data-testid="order-confirmation-hero">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-brand-green" size={36} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-black mb-2">{T.success}</h1>
          <p className="font-body text-brand-text mb-3">{T.thanks}</p>
          <div className="inline-flex items-center gap-2 bg-brand-cream rounded-lg px-4 py-2 text-xs font-body text-brand-text">
            <span className="font-semibold">{T.refTxt}:</span>
            <code className="text-brand-black" data-testid="order-id">{order.id}</code>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange-dark rounded-lg px-4 py-2 text-sm font-body font-medium">
            <Clock size={14} />
            {isDelivery ? T.deliveryTime : T.pickupTime}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 lg:p-8 shadow-sm mb-6">
          <h2 className="font-heading text-xl font-semibold text-brand-black mb-4">{T.detailsTitle}</h2>

          <div className="space-y-2 text-sm font-body text-brand-text mb-5">
            <p><span className="font-semibold text-brand-black">{T.type}:</span> {isDelivery ? T.delivery : T.pickup}</p>
            {isDelivery && order.delivery_address && (
              <p className="flex gap-2"><MapPin size={14} className="mt-0.5 flex-shrink-0 text-brand-gold" /> {order.delivery_address}</p>
            )}
            {order.notes && <p><span className="font-semibold text-brand-black">{T.notes}:</span> {order.notes}</p>}
          </div>

          <h3 className="font-heading text-base font-semibold text-brand-black mb-3">{T.items}</h3>
          <div className="space-y-2">
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between border-b border-brand-border pb-2 last:border-0">
                <div>
                  <p className="font-body font-medium text-brand-black text-sm">{i.name}</p>
                  <p className="font-body text-xs text-brand-text">${Number(i.unit_price).toFixed(2)} × {i.quantity}</p>
                </div>
                <p className="font-body font-semibold text-brand-black text-sm">${(Number(i.unit_price) * i.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-brand-border">
            <span className="font-body font-semibold text-brand-black">{T.total}</span>
            <span className="font-heading font-bold text-2xl text-brand-orange">${Number(order.subtotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Help */}
        <div className="bg-brand-black rounded-2xl p-6 text-white text-center">
          <p className="font-body text-white/70 mb-3">{T.questions}</p>
          <a
            href={`tel:${restaurantConfig.phone.replace(/[^0-9+]/g, "")}`}
            data-testid="confirmation-call-btn"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Phone size={14} /> {T.callUs} {restaurantConfig.phone}
          </a>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate("/")} className="font-body text-sm text-brand-text hover:text-brand-orange transition-colors">
            ← {T.home}
          </button>
        </div>
      </div>
    </main>
  );
}
