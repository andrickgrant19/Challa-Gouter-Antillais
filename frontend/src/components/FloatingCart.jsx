import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const { totalItems, totalPrice, openDrawer } = useCart();
  if (totalItems === 0) return null;
  return (
    <button
      data-testid="floating-cart-btn"
      onClick={openDrawer}
      className="fixed bottom-20 right-6 z-40 lg:hidden bg-brand-orange text-white rounded-2xl shadow-lg flex items-center gap-2 px-4 py-3 hover:bg-brand-orange-dark transition-all hover:scale-105 active:scale-95"
    >
      <div className="relative">
        <ShoppingBag size={18} />
        <span className="absolute -top-2 -right-2 bg-white text-brand-orange text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {totalItems}
        </span>
      </div>
      <span className="font-body font-bold text-sm">${totalPrice.toFixed(2)}</span>
    </button>
  );
}
