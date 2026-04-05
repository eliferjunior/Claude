'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export interface CartItem {
  product_id: number;
  product_name: string;
  size: 'P' | 'M' | 'G';
  quantity: number;
  unit_price: number;
  borda?: string;
  borda_price?: number;
}

export interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  allows_delivery: number;
  allows_pickup: number;
  allows_dine_in: number;
  allows_reservation: number;
  active: number;
}

interface CartContextType {
  // State
  selectedStore: Store | null;
  orderType: 'delivery' | 'pickup' | null;
  cart: CartItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  paymentMethod: string;
  changeFor: string;
  notes: string;
  deliveryFee: number;
  orderId: number | null;

  // Computed
  cartSubtotal: number;
  cartTotal: number;
  cartItemCount: number;

  // Actions
  setSelectedStore: (store: Store | null) => void;
  setOrderType: (type: 'delivery' | 'pickup' | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setCustomerData: (data: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
  }) => void;
  setPaymentData: (data: {
    paymentMethod?: string;
    changeFor?: string;
    notes?: string;
    deliveryFee?: number;
  }) => void;
  setOrderId: (id: number | null) => void;
  resetAll: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const bordaTotal = (item.borda_price ?? 0) * item.quantity;
      return sum + item.unit_price * item.quantity + bordaTotal;
    }, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return orderType === 'delivery' ? cartSubtotal + deliveryFee : cartSubtotal;
  }, [cartSubtotal, deliveryFee, orderType]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const setCustomerData = (data: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
  }) => {
    if (data.customerName !== undefined) setCustomerName(data.customerName);
    if (data.customerPhone !== undefined) setCustomerPhone(data.customerPhone);
    if (data.customerEmail !== undefined) setCustomerEmail(data.customerEmail);
    if (data.addressStreet !== undefined) setAddressStreet(data.addressStreet);
    if (data.addressNumber !== undefined) setAddressNumber(data.addressNumber);
    if (data.addressComplement !== undefined) setAddressComplement(data.addressComplement);
    if (data.addressNeighborhood !== undefined) setAddressNeighborhood(data.addressNeighborhood);
  };

  const setPaymentData = (data: {
    paymentMethod?: string;
    changeFor?: string;
    notes?: string;
    deliveryFee?: number;
  }) => {
    if (data.paymentMethod !== undefined) setPaymentMethod(data.paymentMethod);
    if (data.changeFor !== undefined) setChangeFor(data.changeFor);
    if (data.notes !== undefined) setNotes(data.notes);
    if (data.deliveryFee !== undefined) setDeliveryFee(data.deliveryFee);
  };

  const resetAll = () => {
    setSelectedStore(null);
    setOrderType(null);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setAddressStreet('');
    setAddressNumber('');
    setAddressComplement('');
    setAddressNeighborhood('');
    setPaymentMethod('');
    setChangeFor('');
    setNotes('');
    setDeliveryFee(0);
    setOrderId(null);
  };

  const value: CartContextType = {
    selectedStore,
    orderType,
    cart,
    customerName,
    customerPhone,
    customerEmail,
    addressStreet,
    addressNumber,
    addressComplement,
    addressNeighborhood,
    paymentMethod,
    changeFor,
    notes,
    deliveryFee,
    orderId,
    cartSubtotal,
    cartTotal,
    cartItemCount,
    setSelectedStore,
    setOrderType,
    addToCart,
    removeFromCart,
    clearCart,
    setCustomerData,
    setPaymentData,
    setOrderId,
    resetAll,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
