import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cart: [],
  totalItems: 0,
  totalPrice: 0,

  addToCart: (product) => {
    const cart = get().cart;
    const existing = cart.find((item) => item._id === product._id);

    let updatedCart;
    if (existing) {
      updatedCart = cart.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    set({
      cart: updatedCart,
      totalItems: updatedCart.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: updatedCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  },

  removeFromCart: (id) => {
    const updatedCart = get().cart.filter((item) => item._id !== id);
    set({
      cart: updatedCart,
      totalItems: updatedCart.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: updatedCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  },

  increaseQuantity: (id) => {
    const updatedCart = get().cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    set({
      cart: updatedCart,
      totalItems: updatedCart.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: updatedCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  },

  decreaseQuantity: (id) => {
    const updatedCart = get().cart
      .map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    set({ 
      cart: updatedCart,
      totalItems: updatedCart.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: updatedCart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  },

  clearCart: () => set({ cart: [], totalItems: 0, totalPrice: 0 }),
}));

export default useCartStore;
