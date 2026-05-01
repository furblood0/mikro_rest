import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(i => i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: menuItem.id, itemName: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
    } else {
      setItems(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
