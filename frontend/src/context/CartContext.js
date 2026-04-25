import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("chala_cart") || "[]"); }
    catch { return []; }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("chala_cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((newItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty < 1) { setItems((prev) => prev.filter((i) => i.id !== id)); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.unit_price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isDrawerOpen,
      addItem, removeItem, updateQuantity, clearCart,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
