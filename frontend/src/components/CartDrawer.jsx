import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const T = {
    title: lang === "fr" ? "Votre Panier" : "Your Cart",
    empty: lang === "fr" ? "Votre panier est vide" : "Your cart is empty",
    emptyDesc: lang === "fr" ? "Parcourez notre menu et ajoutez vos plats caribéens préférés." : "Browse our menu and add your favorite Caribbean dishes.",
    browse: lang === "fr" ? "Voir le Menu" : "Browse Menu",
    subtotal: lang === "fr" ? "Sous-total" : "Subtotal",
    checkout: lang === "fr" ? "Passer à la Caisse" : "Proceed to Checkout",
  };

  if (!isDrawerOpen) return null;

  const handleCheckout = () => { closeDrawer(); navigate("/checkout"); };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={closeDrawer} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col" style={{ animation: "slideInFromRight 0.3s ease" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-orange" />
            <h2 className="font-heading text-xl font-bold text-brand-black">{T.title}</h2>
            {items.length > 0 && (
              <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">{items.reduce((s,i)=>s+i.quantity,0)}</span>
            )}
          </div>
          <button data-testid="cart-close-btn" onClick={closeDrawer} className="p-2 hover:bg-brand-cream rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ShoppingBag size={48} className="text-brand-border mb-4" />
              <p className="font-heading text-xl text-brand-black mb-2">{T.empty}</p>
              <p className="font-body text-sm text-brand-text mb-6">{T.emptyDesc}</p>
              <button onClick={() => { closeDrawer(); navigate("/menu"); }} className="bg-brand-orange text-white font-body font-semibold px-6 py-3 rounded-lg hover:bg-brand-orange-dark transition-colors">
                {T.browse}
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} data-testid={`cart-item-${item.id}`} className="flex gap-3 bg-brand-cream rounded-xl p-3 border border-brand-border">
                  {item.image && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-brand-black truncate">{item.name}</p>
                    <p className="font-body text-sm text-brand-orange font-bold">${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</p>
                    <p className="font-body text-xs text-brand-text">${parseFloat(item.unit_price).toFixed(2)} each</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-white border border-brand-border flex items-center justify-center hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="font-body text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-white border border-brand-border flex items-center justify-center hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-colors">
                        <Plus size={10} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-brand-border bg-white">
            <div className="flex justify-between mb-4">
              <span className="font-body font-semibold text-brand-black">{T.subtotal}</span>
              <span className="font-body font-bold text-xl text-brand-orange">${totalPrice.toFixed(2)}</span>
            </div>
            <button data-testid="proceed-checkout-btn" onClick={handleCheckout} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold py-4 rounded-xl transition-colors text-base">
              {T.checkout} →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
