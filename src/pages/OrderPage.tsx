import { useState, useCallback } from "react";
import { menuItems, type MenuItem } from "@/data/menu";
import type { OrderItem } from "@/types/order";
import MenuItemCard from "@/components/MenuItemCard";
import OrderSummary from "@/components/OrderSummary";
import { toast } from "sonner";

const ORDERS_KEY = "grnd.orders";
const OrderPage = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");

  const handleAddItem = useCallback((item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.menuItem.id === itemId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  }, []);

  const handleApplyDiscount = useCallback(() => {
    if (discount === 0) {
      setDiscount(0.1);
      toast.success("10% Instagram follower discount applied!");
    } else {
      setDiscount(0);
      toast.info("Discount removed.");
    }
  }, [discount]);

  const handleClearOrder = useCallback(() => {
    setOrderItems([]);
    setDiscount(0);
    toast.info("Order cleared.");
  }, []);

  
const handleCompleteOrder = useCallback(() => {
  if (orderItems.length === 0) return;

  const subtotal = orderItems.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  const total = subtotal - subtotal * discount;

  const savedOrder = {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    paymentMethod,
    discount,
    items: orderItems,
  };

  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(savedOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  } catch {
    // ignore—if storage fails we still complete the flow
  }

  toast.success(`Order completed! Total: ₱${total.toFixed(2)} (${paymentMethod.toUpperCase()})`);
  setOrderItems([]);
  setDiscount(0);
}, [orderItems, discount, paymentMethod]);


  return (
    <div className="flex flex-1 gap-4 p-4 overflow-hidden">
      {/* Menu items */}
      <div className="flex-1 overflow-y-auto rounded border border-border bg-card p-4">
        <h2 className="mb-4 font-display text-2xl font-bold">MENU ITEMS</h2>
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="w-[380px] flex-shrink-0">
        <OrderSummary
          items={orderItems}
          discount={discount}
          paymentMethod={paymentMethod}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onSetPaymentMethod={setPaymentMethod}
          onApplyDiscount={handleApplyDiscount}
          onClearOrder={handleClearOrder}
          onCompleteOrder={handleCompleteOrder}
        />
      </div>
    </div>
  );
};

export default OrderPage;
