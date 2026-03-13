import { useState, useCallback, useEffect } from "react";
import { menuItems, type MenuItem } from "@/data/menu";
import type { OrderItem } from "@/types/order";
import MenuItemCard from "@/components/MenuItemCard";
import OrderSummary from "@/components/OrderSummary";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Discount = {
  Discount_ID: number;
  Discounttype: string;
  Discountrate: number;
};

const OrderPage = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const discountRate = selectedDiscount?.Discountrate ?? 0;

  /* ---------------- FETCH DISCOUNTS ---------------- */
useEffect(() => {
  const fetchDiscounts = async () => {
    const { data, error } = await supabase
      .from('Discount')
      .select('Discount_ID,Discounttype,Discountrate');
    if (error) {
      console.error("Failed to fetch discounts:", error);
      toast.error("Failed to load discounts.");
      return;
    }
    console.log("Fetched discounts:", data);
    setDiscounts(data ?? []);
  };
  fetchDiscounts();
}, []);

  /* ---------------- ORDER FUNCTIONS ---------------- */
  const handleAddItem = useCallback((item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.menuItem.id === itemId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const handleClearOrder = useCallback(() => {
    setOrderItems([]);
    setSelectedDiscount(null);
    toast.info("Order cleared.");
  }, []);

  const handleCompleteOrder = useCallback(async () => {
    if (orderItems.length === 0) {
      toast.warning("Add items first.");
      return;
    }

    const subtotal = orderItems.reduce(
      (sum, i) => sum + i.menuItem.price * i.quantity,
      0
    );
    const total = subtotal * (1 - discountRate);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("Order")
        .insert({
          Order_date: new Date().toISOString(),
          total_amount: total,
          discount: discountRate,
          payment: paymentMethod,
        })
        .select()
        .single();

      if (orderError || !orderData)
        throw orderError ?? new Error("Order insert failed");

      const orderId = orderData.Order_id;

      const orderDetails = orderItems.map((item) => ({
        ProductID: item.menuItem.id,
        ProductName: item.menuItem.name,
        Alias: item.menuItem.alias ?? item.menuItem.name,
        Quantity: item.quantity,
        Subtotal: item.menuItem.price * item.quantity,
        Order_id: orderId,
        Payment: paymentMethod,
      }));

      const { error: detailsError } = await supabase
        .from("OrderDetails")
        .insert(orderDetails);

      if (detailsError) throw detailsError;
    } catch (err) {
      console.error("Failed to save order:", err);
      toast.error("Database save failed.");
      return;
    }

    toast.success(
      `Order completed! Total: ₱${total.toFixed(2)} (${paymentMethod.toUpperCase()})`
    );

    setOrderItems([]);
    setSelectedDiscount(null);
  }, [orderItems, discountRate, paymentMethod]);

  const openDiscountModal = () => setShowDiscountModal(true);
  const handleApplyDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setShowDiscountModal(false);
    toast.success(`${discount.Discounttype} applied!`);
  };

const handlePrintReceipt = useCallback(() => {
  if (orderItems.length === 0) {
    toast.warning("No items to print.");
    return;
  }

  const subtotal = orderItems.reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  );

  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  const receiptWindow = window.open("", "PRINT", "height=600,width=400");

  if (!receiptWindow) return;

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: monospace; padding:20px; }
          h2 { text-align:center; }
          .line { display:flex; justify-content:space-between; }
        </style>
      </head>
      <body>
        <h2>GRND Cafe</h2>
        <p>${new Date().toLocaleString()}</p>
        <hr/>

        ${orderItems
          .map(
            (i) => `
          <div class="line">
            <span>${i.menuItem.name} x${i.quantity}</span>
            <span>₱${(i.menuItem.price * i.quantity).toFixed(2)}</span>
          </div>
        `
          )
          .join("")}

        <hr/>

        <div class="line">
          <span>Subtotal</span>
          <span>₱${subtotal.toFixed(2)}</span>
        </div>

        <div class="line">
          <span>Discount</span>
          <span>-₱${discountAmount.toFixed(2)}</span>
        </div>

        <div class="line">
          <strong>Total</strong>
          <strong>₱${total.toFixed(2)}</strong>
        </div>

        <p>Payment: ${paymentMethod.toUpperCase()}</p>

        <hr/>
        <p style="text-align:center">Thank you!</p>
      </body>
    </html>
  `);

  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
  receiptWindow.close();
}, [orderItems, discountRate, paymentMethod]);

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-1 gap-4 p-4 overflow-hidden">
      {/* MENU */}
      <div className="flex-1 overflow-y-auto rounded border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">MENU ITEMS</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded border ${viewMode === "grid" ? "bg-black text-white" : ""}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded border ${viewMode === "list" ? "bg-black text-white" : ""}`}
            >
              List
            </button>
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="flex flex-col divide-y">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">₱{item.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => handleAddItem(item)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDER PANEL */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-2">
        {selectedDiscount && (
          <div className="p-2 text-sm text-green-700">
            Applied Discount: {selectedDiscount.Discounttype} ({selectedDiscount.Discountrate * 100}%)
          </div>
        )}

<OrderSummary
  items={orderItems}
  discount={discountRate}
  paymentMethod={paymentMethod}
  onUpdateQuantity={handleUpdateQuantity}
  onSetPaymentMethod={setPaymentMethod}
  onClearOrder={handleClearOrder}
  onCompleteOrder={handleCompleteOrder}
  onApplyDiscountClick={openDiscountModal}
  onPrintReceipt={handlePrintReceipt}
/>
      </div>

      {/* ---------------- Discount Modal ---------------- */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-4 relative">
            {/* Close button */}
            <button
              onClick={() => setShowDiscountModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4 text-center">Select Discount</h2>

            {discounts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No discounts available.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {discounts.map((d) => (
                  <button
                    key={d.Discount_ID}
                    className="w-full px-4 py-2 border rounded hover:bg-gray-100 text-left"
                    onClick={() => handleApplyDiscount(d)}
                  >
                    {d.Discounttype} ({(d.Discountrate * 100).toFixed(0)}%)
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;